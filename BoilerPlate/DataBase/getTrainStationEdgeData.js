var fs = require("fs");

var dir = process.argv[2] + '/';
var req_info_in = ['code', 'fullname', 'state', 'lat', 'lng'];
var req_info_out = ['code', 'name', 'state', 'lat', 'lng'];

var train_list = {};
var station_list = {};
var edge_list = {};
var empty_files = [];

try {
    process.chdir(dir);
    console.log('New directory: ' + process.cwd());
    dir = '';
} catch (err) {
    console.log('chdir: ' + err);
}

fs.unlink('AbsentFiles');

for(var i = 1; i < 9; i++) {
    var fileDir = dir + 'G' + i + '/';
    for (var j = 0; j < 10000; ++j) {
        var file = 10000 * i + j;
        file = fileDir + file;
        if (fs.existsSync(file)) {
            try {
                data = fs.readFileSync(file, 'utf-8');
                // To add the code for add the obj_list to neo4j
                if (data) {
                    train = JSON.parse(data);

                    if (train['response_code'] == 200) {
                        manageData(train);
                    } else if (train['response_code'] != 204) {
                        console.log("Unknown response_code for file " + file);
                        empty_files.push(10000*i+j);
                    }
                } else {
                    console.log('File \'' + file + '\'is Empty');
                    empty_files.push(10000*i+j);
                }
            } catch (err) {
                console.log("Error while parsing file '" + file + "'");
                console.log(err);
            }
        } else {
            empty_files.push(10000*i+j);
        }
    }
}

try {
    fs.writeFile('train_data', JSON.stringify(train_list));
    fs.writeFile('station_data', JSON.stringify(station_list));
    fs.writeFile('edge_data', JSON.stringify(edge_list));
    fs.writeFile('AbsentFiles', empty_files);
} catch (err) {
    console.log("Couldn't log train/station/edge data in files");
    console.log(err);
}

function manageData(data) {
    if (data['route'].length == 0) {
        console.log("No route found for train #" + data['train']['number']);
    } else {
        for(var i = 0; i < data['route'].length; i++) {
            manageStation(data['route'][i]);
        }

        data['train']['source'] = data['route'][0]['code'];
        manageTrain(data['train']);

        edge_list[data['train']['number']] = addEdges(data['route'],
                data['train']['number']);
    }
}

function manageTrain(train) {
    if (typeof train_list[train['number']] == 'undefined') {
	var days = [];
	var classes = [];
	for(var i=0; i<train['days'].length; i++){
		if(train['days'][i]['runs'] == "Y") days.push(train['days'][i]['day-code']);
	}
	for(var i=0; i<train['classes'].length; i++){
		if(train['classes'][i]['available'] == "Y") classes.push(train['classes'][i]['class-code']);
	}
	train['days'] = days;
	train['classes'] = classes;
        train_list[train['number']] = train;
    } else {
        console.log('Train number repeated ' + train['number']);
    }
}

// Structure of station node
// {
// "code": "LTT",
// "lng": 72.8919834,
// "fullname": "LOKMANYATILAK T",
// "state": "Maharashtra 400089",
// "lat": 19.0695301
// },

function manageStation(station) {
    if (typeof station_list[station['code']] == 'undefined') {
        station_list[station['code']] = {};
        for(var key = 0; key < req_info_in.length; key++) {
            station_list[station['code']][req_info_out[key]] =
                station[req_info_in[key]];
        }
    }
}

// Structure of an Edge
// {
// "train": 11061,
// "src": "BAU",
// "schdep": "11:05",
// "day1": 1,
// "dest": "KNW",
// "scharr": "12:35"
// "day2": 1,
// "distance": 78,
// "halt": 2 // "Destination" for last station
// }

function addEdges(route, number) {
    var trainEdgeList = [];
    for (var i = 1; i < route.length; i++) {
        if (route[i]['route'] != 1)
            break;

        trainEdge = {};
        trainEdge['number'] = number;
        trainEdge['src'] = route[i-1]['code'];
        trainEdge['schdep'] = route[i-1]['schdep'];
        trainEdge['day1'] = route[i-1]['day'];
        trainEdge['dest'] = route[i]['code'];
        trainEdge['scharr'] = route[i]['scharr'];
        trainEdge['day2'] = route[i]['day'];
        trainEdge['distance'] = route[i]['distance'] - route[i-1]['distance'];
        trainEdge['halt'] = route[i]['halt'];
        trainEdgeList.push(trainEdge);
    }
    return trainEdgeList;
}

