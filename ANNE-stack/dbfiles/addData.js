var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "password"));

var session = driver.session();
var data = [
	{station_name:"New Delhi"},
	{station_name:"Mumbai"},
    {station_name:"Bengaluru"},
    {station_name:"Bhopal"},
    {station_name:"Kanpur"},
    {station_name:"Indore"},
    {train:1},
    {train:2},
    {train:3},
    {train:4},
    {train:5},
    {train:6},
    {train:7},
	{station_from:"New Delhi", station_to:"Bengaluru", train:2},
	{station_from:"New Delhi", station_to:"Indore", train:1},
	{station_from:"New Delhi", station_to:"Mumbai", train:3},
	{station_from:"New Delhi", station_to:"Bhopal", train:4},
	{station_from:"Bengaluru", station_to:"Mumbai", train:2},
	{station_from:"Mumbai", station_to:"Bhopal", train:2},
	{station_from:"Indore", station_to:"Bhopal", train:2},
    {station_from:"Indore", station_to:"New Delhi", train:5},
    {station_from:"New Delhi", station_to:"Bhopal", train:5},
    {station_from:"Bhopal", station_to:"Mumbai", train:5},
    {station_from:"Bengaluru", station_to:"Mumbai", train:6},
    {station_from:"Mumbai", station_to:"Bhopal", train:6},
    {station_from:"Bhopal", station_to:"Indore", train:6},
]
var commands = [
    "CREATE (n:Station { name: {station_name}})",
    "CREATE (n:Station { name: {station_name}})",
    "CREATE (n:Station { name: {station_name}})",
    "CREATE (n:Station { name: {station_name}})",
    "CREATE (n:Station { name: {station_name}})",
    "CREATE (n:Station { name: {station_name}})",
	"CREATE (n:Train { name: {train}})",
	"CREATE (n:Train { name: {train}})",
	"CREATE (n:Train { name: {train}})",
	"CREATE (n:Train { name: {train}})",
    "CREATE (n:Train { name: {train}})",
    "CREATE (n:Train { name: {train}})",
    "CREATE (n:Train { name: {train}})",
	"MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
	"MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
	"MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
	"MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
	"MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
	"MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
	"MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
    "MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
    "MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
    "MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
    "MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
    "MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
    "MATCH (a:Station {name:{station_from}}), (b:Station {name:{station_to}}) CREATE (a)-[r:Travel { number:{train}, from:{station_from}, to:{station_to}}]->(b) RETURN a",
]

for( var i = 0; i<commands.length; i++){
	console.log(commands[i])
	console.log(data[i])
	session
		.run( commands[i], data[i])
		.then( function( result ) {
			console.log( result.records );
			session.close();
			driver.close();
		});
}
