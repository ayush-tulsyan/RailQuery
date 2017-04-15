var neo4j = require('neo4j-driver').v1;
var async = require('async');
var driver = require('../../connection');

function getOutwardTrains(station_code, callback){
    console.log("Get outward trains "+station_code);

    var outgoingTrainQuery = "" +
        "MATCH (n:Station)-[p:Travel]->(m:Station) " +
        "WHERE n.code = {station_from} " +
        "RETURN p";

    var session = driver.session();

    var data = [];
    session
        .run( outgoingTrainQuery, {station_from : station_code})
        .then( function( result ) {
            console.log("Resuts");
            console.log(result);
            for(var i=0;i<result.records.length;i++){
                data.push(result.records[i]._fields[0].properties);
                console.log("Print The results of getOutwardTrains for station: "+station_code);
                console.log(result.records[i]._fields[0].properties);
            }
            callback(null, data);
            session.close();
        })
    .catch( function(error){
        callback(error, null);
    });
}

function getStationInfo(code, callback){
    console.log("in getStationInfo");

    var station_info_query = "" +
        "MATCH (n:Station) " +
        "WHERE n.code = {station_code} " +
        "RETURN n";

    var session = driver.session();

    console.log("RUNNING QUERY : "+station_info_query);
    console.log("Code : "+code);
    session
        .run( station_info_query, {station_code : code})
        .then( function( result ) {
            var data = result.records[0]._fields[0].properties;
            console.log(data);
            callback(null, data);
            session.close();
        })
    .catch( function(error){
        callback(error, null);
    });
}

function getReachableStations(station_code, callback) {
    console.log("IN GETREACHABLE STATIONS");
    var BFS_query = "" +
        "MATCH (n:Station)-[p:Travel*..]->(m:Station) " +
        "WHERE n.code = {station_from} " +
        "AND all(r in p where r.number = {number}) " +
        "RETURN p";

    var session = driver.session();

    async.waterfall([
            function(callback){
                console.log("IN ouward stations");

                getOutwardTrains(station_code, function(err, results){
                    if(err){
                        callback(err, null);
                    }
                    else{
                        callback(null, results);
                    }
                });
            },
            function(data, callback){
                console.log("IN CALLBACK1");
                var train_list= [];
                async.each(data,
                        function(train, call){
                            train.station_from = station_code;
                            session
                                .run( BFS_query, train)
                                .then( function( result ) {
                                    console.log(result);
                                    for(var i=0;i<result.records.length;i++){
                                        var station_list = [];
                                        for(var j=0;j<result.records[i]._fields[0].length;j++){
                                            station_list.push(result.records[i]._fields[0][j].properties);
                                        }
                                        train_list.push(station_list);
                                    }
                                    // console.log(result);
                                    call(null);
                                })
                            .catch( function(err){
                                call(err, null);
                            });
                        },
                        function(err){
                            if(err){
                                callback(err, null);
                            }
                            else{
                                callback(null, train_list);
                            }
                        }
                );
            },
            function(data, callback){
                console.log("IN CALLBACK2");
                train_list = [];
                async.each(data,
                        function(dat, callback2){
                            console.log("IN THE CALLBACK");
                            var station_list = [];
                            for(var i=0;i<dat.length;i++) station_list.push(0);

                            async.eachOf(dat,
                                    function(edge, index, call){
                                        console.log("WITH INDEX "+index+"with edge "+JSON.stringify(edge));
                                        getStationInfo(edge.src, function(err, res){
                                            if(err){
                                                call(err, err);
                                            }
                                            else{
                                                console.log("GOT DATA");
                                                station_list[index] = res;
                                                call(null, null);
                                            }
                                        });
                                    },
                                    function(err){
                                        if(err){
                                            callback2(err, null);
                                        }
                                        else{
                                            getStationInfo(dat[dat.length-1].dest, function(e, r){
                                                if(e){
                                                    callback2(e, null);
                                                }
                                                else{
                                                    station_list[dat.length-1] = r;
                                                    train_list.push(station_list);
                                                    callback2(null, null);
                                                }
                                            });
                                        }
                                    }
                            );
                        },
                        function(err){
                            if(err){
                                callback(err);
                            }
                            else{
                                callback(null,train_list);
                            }
                        });
            }],
            function(err, results){
                console.log("We're Done!");
                console.log(results);
                callback(err, results);
                session.close();
            }
    );
}

module.exports = {
    getOutwardTrains: getOutwardTrains,
    getReachableStations : getReachableStations,
    getStationInfo : getStationInfo,
};
