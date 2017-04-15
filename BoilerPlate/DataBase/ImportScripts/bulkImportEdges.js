var neo4j = require('neo4j-driver').v1;
var fs = require('fs');
var _ = require('lodash');

var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "password"));

var session = driver.session();

var file = process.argv[2];
console.log(file);

var data = {};
var count = 0;

var req_info = ['number', 'src', 'schdep', 'day1', 'dest', 'scharr', 'day2', 'distance', 'halt'];
var commands = ""+
"MATCH (n:Station { code: {src}}), (m:Station { code: {dest}}) " +
"CREATE (n)-[p:Travel { ";


for(var i=0; i<req_info.length; i++){
    if(i == req_info.length-1){
        commands = commands + req_info[i] + ": {" + req_info[i] + "} ";
    }
    else{
        commands = commands + req_info[i] + ": {" + req_info[i] + "}, ";
    }
}

commands = commands + "}]->(m) RETURN p";

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

var stepSize = 100;
var count = 0;

for(var j = 6; j<7; j++){
    for(var i = 0; i<stepSize ;i++){
        var pos = stepSize*j+i;
        if (keys[pos]) {
            console.log(keys[pos]);
            var edge_list = data[keys[pos]];
            for (var edge in edge_list) {
                // console.log(edge_list[edge]);
                var session = driver.session();
                session
                    .run( commands, edge_list[edge])
                    .then( function( result ) {
                        console.log(++count);
                    })
                .catch( function(err){
                    console.log(err);
                    console.log("######################################");
                    console.log(edge_list[edge]);
                });
            }
        } else {
            break;
        }
    }
}

// _.forEach(data,
        // function(value, key){
            // // console.log(value);
            // console.log(key);
            // _.forEach(value,
                    // function(v, k){
                        // console.log(v);
                        // session
                            // .run( commands, v)
                            // .then( function( result ) {
                                // session.close();
                                // driver.close();
                            // })
                        // .catch( function(err){
                            // console.log(err);
                            // console.log("######################################");
                        // });
                    // }
                    // );
        // }
        // );

console.log("Done");
