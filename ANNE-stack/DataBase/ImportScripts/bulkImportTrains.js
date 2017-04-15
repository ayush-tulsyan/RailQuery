var neo4j = require('neo4j-driver').v1;
var fs = require('fs');
var _ = require('lodash');

var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "password"));

var session = driver.session();

var data = {};
var count = 0;

var file = process.argv[2];
console.log(file);


var req_info = ['name', 'classes', 'number', 'days', 'source'];
var commands = "CREATE (n:Train { ";

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

for(var j = 0; j<12; j++){
    for(var i = 0; i<stepSize; i++){
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

// _.forEach(data,
// function(value, key){
// // console.log(value);
// console.log(key);
// session
// .run( commands, value)
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

console.log("Done");
