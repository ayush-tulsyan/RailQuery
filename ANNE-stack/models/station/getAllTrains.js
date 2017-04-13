var neo4j = require('neo4j-driver').v1;
var async = require('async');
var driver = require('../../connection');

function getTrains(stationName, callback) {
    var BFS_query = "" + 
        "MATCH (n:Station)-[p:Travel*..]->(m:Station) " + 
        "WHERE n.name = {station_from} " + 
        "AND all(r in p where r.number = {number}) " + 
        "RETURN p";

    var neighbour_query = "" + 
        "MATCH (n:Station)-[p:Travel]->(m:Station) " + 
        "WHERE n.name = {station_from} " +
        "RETURN p";

    var session = driver.session();

    async.waterfall([
        function(callback){
            var data = [];
            session
                .run( neighbour_query, {station_from:stationName})
                .then( function( result ) {
                    for(var i=0;i<result.records.length;i++){
                        data.push(result.records[i]._fields[0].properties);
                    }
                    console.log(data);
                    callback(null, data);
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

module.exports = getTrains
