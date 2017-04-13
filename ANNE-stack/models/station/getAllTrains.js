var neo4j = require('neo4j-driver').v1;
var async = require('async');
var driver = require('../../connection');

function getOutwardTrains(station_name, callback){
    console.log("In getOutwardTrains");

    var outgoingTrainQuery = "" + 
        "match (n:station)-[p:travel]->(m:station) " + 
        "where n.name = {station_from} " +
        "return p";
        
    var session = driver.session();

    var data = [];
    session
        .run( neighbour_query, {station_from:station_name})
        .then( function( result ) {
            for(var i=0;i<result.records.length;i++){
                data.push(result.records[i]._fields[0].properties);
                console.log(result.records[i]._fields);
            }
            console.log(data);
            callback(null, data);
            session.close();
        })
        .catch( function(error){
            callback(error, null);
        });
}

function getTrains(stationName, callback) {
    var BFS_query = "" + 
        "MATCH (n:Station)-[p:Travel*..]->(m:Station) " + 
        "WHERE n.name = {station_from} " + 
        "AND all(r in p where r.number = {number}) " + 
        "RETURN p";

    var neighbour_query = "" + 
        "match (n:station)-[p:travel]->(m:station) " + 
        "where n.name = {station_from} " +
        "return p";

    var session = driver.session();

    async.waterfall([
        function(callback){
            getOutwardTrains(stationName, function(err, results){
                if(err){
                    callback(err, null);
                }
                else{
                    callback(null, results);
                }
            });
        },
        function(data, callback){
            async.each(data, function(train, call){
                train.station_from = stationName;
                session
                    .run( BFS_query, train)
                    .then( function( result ) {
                        for(var i=0;i<result.records.length;i++){
                            console.log("NEW PATH");
                            for(var j=0;j<result.records[i]._fields[0].length;j++){
                                console.log(result.records[i]._fields[0][j].properties);
                            }
                        }
                        // console.log(result);
                        console.log("NEW TRAIN");
                        call(null);
                    });
            },
            function(err){
                callback(null);
            });
        }],
        function(err, results){
            console.log("We're Done!");
            callback(err, results);
            session.close();
        }
    );
}

module.exports = { 
    getOutwardTrains: getOutwardTrains,
    getTrains : getTrains,
};
