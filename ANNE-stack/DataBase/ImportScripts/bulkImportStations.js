var neo4j = require('neo4j-driver').v1;
var fs = require('fs');
var _ = require('lodash');

var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "password"));

var file = process.argv[2];
console.log(file);

var data = {};

var req_info = ['code', 'name', 'state', 'lat', 'lng'];
var commands = "CREATE (n:Station { ";

for(var i=0; i<req_info.length; i++){
    if(i == req_info.length-1){
        commands = commands + req_info[i] + ": {" + req_info[i] + "} ";
    }
    else{
        commands = commands + req_info[i] + ": {" + req_info[i] + "}, ";
    }
}

commands = commands + "})";

console.log("Command is "+commands);

try{
    var data = JSON.parse(fs.readFileSync(file, 'utf-8'));
}
catch(err){
    console.log(err);
    console.log("Could not read data from file");
    process.exit();
}

var keys = Object.keys(data);

var stepSize = 500;
var count = 0;

for(var j = 14; j<15; j++){
    for(var i = 0; i<stepSize ;i++){
        var pos = stepSize*j+i;
        if (keys[pos]) {
            console.log(keys[pos]);
            var session = driver.session();
            session
                .run( commands, data[keys[pos]])
                .then( function( result ) {
                    console.log(++count);
                })
            .catch( function(err){
                console.log(err);
                console.log("######################################");
            });
        } else {
            break;
        }
    }
}

console.log("Done");
