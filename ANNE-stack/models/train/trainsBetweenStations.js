var neo4j = require('neo4j-driver').v1;
var async = require('async');
var driver = require('../../connection');

var st_h

function trainsBetweenStations(from, to, callback){

    var BFS_query = "" +
        "MATCH (n:Station)-[p:Travel*..]->(m:Station) " + 
        "WHERE n.name = {station_from} AND m.name={station_to} " + 
        "AND all(r in p where r.number = {number}) " +
        "RETURN p";

    var neighbour_query = "" +
        "MATCH (n:Station)-[p:Travel]->(m:Station) " +
        "WHERE n.name = {station_from} " +
        "RETURN p";

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
	    var train_list= []
            async.each(data, 
                function(train, call){
                    train.station_from = from;
                    train.station_to = to;
                    session
                        .run( BFS_query, train)
                        .then( function( result ) {
                            for(var i=0;i<result.records.length;i++){
				var station_list = []; 
                                for(var j=0; j<result.records[i]._fields[0].length; j++){
                                    station_list.push(result.records[i]._fields[0][j].properties);
                                    console.log(result.records[i]._fields[0][j].properties);
                                }
				train_list.push(station_list);
                            }
                            // console.log(result);
                            call(null);
                        });
                }, 
                function(err){
                    callback(null, train_list);
                }
            );
        }],
        function(err, results){
            console.log("We're Done!");
            console.log(results);
	    callback(err, results);
            session.close();
        }
    );
}

module.exports = { trainsBetweenStations : trainsBetweenStations }
