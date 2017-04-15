var neo4j = require('neo4j-driver').v1;
var async = require('async');
var driver = require('../../connection');

var st = require('../station/getAllTrains');

function getTrainInfo(train_no, callback){
    console.log("Get Train Info");
    var src_dest_query = "" +
        "MATCH (n:Train) " +
        "WHERE n.number = {train} " +
        "RETURN n";

    session = driver.session();
    session
        .run( src_dest_query, {train:train_no})
        .then( function( result ) {
            var data = "";
            for(var i=0;i<result.records.length;i++){
                data = result.records[i]._fields[0].properties;
                console.log(result.records[i]._fields);
            }
            console.log("YAHOOOO");
            console.log(data);
            callback(null, data);
            session.close();
        })
    .catch( function(error){
        callback(error, null);
    });
}

function getTrainRoute(train_no, callback){
    console.log("The Train no is" + train_no);
    //    train_no = parseInt(train_no);
    var route_query = "" +
        "MATCH (n:Station)-[p:Travel*..]->(m:Station) " +
        "WHERE n.code = {station_from} " +
        "AND all(r in p where r.number = {number}) " +
        "RETURN p";

    session = driver.session();

    async.waterfall([
            function(callback){
                getTrainInfo(train_no, function(err, results){
                    if(err){
                        callback(err, null);
                    }
                    else{
                        callback(null, results);
                    }
                });
            },
            function(data, callback){
                console.log("IN CALLBACK OF GETTRAINROUTE");
                var train_list = [];
                session
                    .run( route_query, {number:train_no, station_from:data.source})
                    .then( function(results){
                        console.log(results);
                        for(var i=0;i<results.records.length;i++){
                            var station_list = [];
                            for(var j=0; j<results.records[i]._fields[0].length; j++){
                                station_list.push(results.records[i]._fields[0][j].properties);
                                console.log(results.records[i]._fields[0][j].properties);
                            }
                            train_list.push(station_list);
                        }
                        callback(null, train_list.slice(-1)[0]);
                    })
                .catch( function(err){
                    callback(err, null);
                });
            },
            function(data, callback){
                console.log("IN THE CALLBACK");
                var station_list = [];
                for(var i=0;i<data.length;i++) station_list.push(0);

                async.eachOf(data,
                        function(edge, index, call){
                            console.log("WITH INDEX "+index+"with edge "+JSON.stringify(edge));
                            st.getStationInfo(edge.src, function(err, res){
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
                                callback(err, null);
                            }
                            else{
                                st.getStationInfo(data[data.length-1].dest, function(e, r){
                                    if(e){
                                        callback(e, null);
                                    }
                                    else{
                                        station_list[data.length-1] = r;
                                        callback(null, [station_list]);
                                    }
                                });
                            }
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



function trainsBetweenStations(from, to, callback){

    var BFS_query = "" +
        "MATCH (n:Station)-[p:Travel*..]->(m:Station) " +
        "WHERE n.code = {station_from} AND m.code ={station_to} " +
        "AND all(r in p where r.number = {number}) " +
        "RETURN p";

    var neighbour_query = "" +
        "MATCH (n:Station)-[p:Travel]->(m:Station) " +
        "WHERE n.code = {station_from} " +
        "RETURN p";

    var session = driver.session();

    async.waterfall([
            function(callback){
                st.getOutwardTrains(from, function(err, results){
                    if(err){
                        callback(err, null);
                    }
                    else{
                        callback(null, results);
                    }
                });
            },
            function(data, callback){
                var train_list= [];
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
                                    })
                                .catch( function(err){
                                    call(err,null);
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
                                        st.getStationInfo(edge.src, function(err, res){
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
                                            st.getStationInfo(dat[dat.length-1].dest, function(e, r){
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
    trainsBetweenStations : trainsBetweenStations,
    getTrainRoute : getTrainRoute,
    getTrainInfo : getTrainInfo
};
