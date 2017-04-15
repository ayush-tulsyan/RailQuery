
        /**
         * Module dependencies.
         */

        // Setup
        // =================
        var express = require('express');
        var http = require('http');
        var path = require('path');
        var routes = require('./routes');
        var api = require('./routes/api');
        var expressJwt = require('express-jwt');
        var jwt = require('jsonwebtoken');
        var flash = require('connect-flash');
        var passport = require("passport");
        var LocalStrategy = require('passport-local').Strategy;
        var TwitterStrategy = require('passport-twitter').Strategy;
        var Neo4J = require('./connection');
        var bfs = require('./models/train/trainsBetweenStations');
        var reachability = require('./models/station/getAllTrains');
        var async = require('async');
        console.log("BFS: ", bfs);
        var users = [
            { id: 1, username: 'guest', password: 'guestpass', email: 'guest@anne.com' },
            { id: 2, username: 'visitor', password: 'visitorpass', email: 'visitor@anne.com' }
        ];


        function findById(id, fn) {
            var idx = id - 1;
            if (users[idx]) {
                fn(null, users[idx]);
            } else {
                fn(new Error('User ' + id + ' does not exist'));
            }
        }
        function findByUsername(username, fn) {
            for (var i = 0, len = users.length; i < len; i++) {
                var user = users[i];
                if (user.username === username) {
                    return fn(null, user);
                }
            }
            return fn(null, null);
        }

        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });
        passport.deserializeUser(function(id, done) {
            findById(id, function (err, user) {
                done(err, user);
            });
        });

        // Use the LocalStrategy within Passport.
        // Strategies in passport require a `verify` function, which accept
        // credentials (in this case, a username and password), and invoke a callback
        // with a user object. In the real world, this would query a database;
        // however, in this example we are using a baked-in set of users.
        passport.use(new LocalStrategy(
            function(username, password, done) {
            // asynchronous verification, for effect...
                process.nextTick(function () {
                // Find the user by username. If there is no user with the given
                // username, or the password is not correct, set the user to `false` to
                // indicate failure and set a flash message. Otherwise, return the
                // authenticated `user`.
                    findByUsername(username, function(err, user) {
                        if (err) { return done(err); }
                        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
                        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
                        return done(null, user);
                    })
                });
            }
        ));
        // Create our app with express
        var app = express();

        // Configure all environments
        // =================

        app.set('port', process.env.PORT || 3000);
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use('/api', expressJwt({secret: 'secret-anne'}));
        app.use(express.json());
        app.use(express.urlencoded());
        //for use with sessions
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.methodOverride());  // simulate DELETE and PUT
        app.use(express.session({ cookie: { maxAge: 60000 }, secret: 'anne#'}));
        // use flash messages
        app.use(flash());
        app.use('/static', express.static('public'))

        app.use(passport.initialize());
        app.use(passport.session());

        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));  // set the static files location /public/img will be /img for users

        app.use(function(req, res, next) {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
          next();
        });

        // development only
        if ('development' == app.get('env')) {
          app.use(express.errorHandler());
        }

        // We only need a default route.  Angular will handle the rest.
        app.get('/', function(request, response){
          response.sendfile("./public/home.html");
        });

        app.get('/page1', function(request, response){
          response.sendfile("./public/page1.html");
        });

        app.get('/page2', function(request, response){
          response.sendfile("./public/page2.html");
        });

        app.get('/page3', function(request, response){
          response.sendfile("./public/page3.html");
        });

        app.get('/background', function (req, res) {
            var path = require('path'),
            fs = require('fs');
            res.sendfile(path.resolve('./public/images/dark_embroidery.png'));
        });

        app.get('/query1', function(req, res){

                var source = req.query.source;
                var destination = req.query.destination;
                console.log("test1: ", source, destination);
                var tmpObj = {};
                // var result = {'nodes' : [], 'edges' : []};
                // result.nodes.push({'name' : 'test1'});
                // result.nodes.push({'name' : 'test2'});
                // result.edges.push({'source' : 0, 'target' : 1});
                // result.number = 69;
                // res.send(JSON.stringify([result]));
            	bfs.trainsBetweenStations(source, destination, function(err, data){
            		if(err){
            			console.log(err);
            		}
            		else{
            			console.log("data: ", data);
                        // var result = [];
                        // for(var i in data){
                        //     tmp = data[i];
                        //     var dataset = {'nodes' : [], 'edges' : []};
                        //     if(data[i] != null && data[i] != undefined){
                        //         var count = 0;
                        //         for(var j in data[i]){
                        //             console.log("J: ", j);
                        //             if(data[i][j] != null && data[i][j] != undefined && data[i][j] != tmpObj){
                        //                 if(j == 0){
                        //                     console.log(data[i][j].from, data[i][j].to);
                        //                     dataset.number = data[i][j].number;
                        //                     dataset.nodes.push({'name' : data[i][j].from});
                        //                     dataset.nodes.push({'name' : data[i][j].to});
                        //                     dataset.edges.push({'source' : count, 'target' : count+1});
                        //                     count++;
                        //                 }
                        //                 else{
                        //                     dataset.nodes.push({'name' : data[i][j].to});
                        //                     dataset.edges.push({'source' : count, 'target' : count+1});
                        //                     count++;        
                        //                 }
                        //             }
                        //         }
                        //     }
                        //     result.push(dataset);
                        // }
                        console.log("RESULT", data);
                        res.send(JSON.stringify(data));
            	
            		}
                });
            
                
        });

        app.get('/query2', function(req, res){
                var source = req.query.source;
                console.log("test1: ", source);
                var tmpObj = {};
                // var result = {'nodes' : [], 'edges' : []};
                // result.nodes.push({'name' : 'test1'});
                // result.nodes.push({'name' : 'test2'});
                // result.edges.push({'source' : 0, 'target' : 1});
                // result.number = 69;
                // res.send(JSON.stringify([result]));
                reachability.getReachableStations(source, function(err, data){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("data: ", data);
                        // var result = [];
                        // for(var i in data){
                        //     tmp = data[i];
                        //     var dataset = {'nodes' : [], 'edges' : []};
                        //     if(data[i] != null && data[i] != undefined){
                        //         var count = 0;
                        //         for(var j in data[i]){
                        //             console.log("J: ", j);
                        //             if(data[i][j] != null && data[i][j] != undefined && data[i][j] != tmpObj){
                        //                 if(j == 0){
                        //                     console.log(data[i][j].from, data[i][j].to);
                        //                     dataset.number = data[i][j].number;
                        //                     dataset.nodes.push({'name' : data[i][j].from});
                        //                     dataset.nodes.push({'name' : data[i][j].to});
                        //                     dataset.edges.push({'source' : count, 'target' : count+1});
                        //                     count++;
                        //                 }
                        //                 else{
                        //                     dataset.nodes.push({'name' : data[i][j].to});
                        //                     dataset.edges.push({'source' : count, 'target' : count+1});
                        //                     count++;        
                        //                 }
                        //             }
                        //         }
                        //     }
                        //     result.push(dataset);
                        // }
                        console.log("RESULT", data);
                        res.send(JSON.stringify(data));
                    }
                });
            
                
        });

        app.get('/data2', function(request, response){
          response.sendfile("./public/view.html");
        });




        app.get('/query3', function(req, res){
            var tnumber = req.query.tnumber;
            console.log("test1: ", tnumber);
            var tmpObj = {};
            // var result = {'nodes' : [], 'edges' : []};
            // result.nodes.push({'name' : 'test1'});
            // result.nodes.push({'name' : 'test2'});
            // result.edges.push({'source' : 0, 'target' : 1});
            // result.number = 69;
            // res.send(JSON.stringify([result]));
            bfs.getTrainRoute(tnumber, function(err, data){
                if(err){
                    console.log("ERR: ", err);
                }
                else{
                    console.log("data: ", data);
                    // var result = [];
                    // for(var i in data){
                    //     tmp = data[i];
                    //     var dataset = {'nodes' : [], 'edges' : []};
                    //     if(data[i] != null && data[i] != undefined){
                    //         var count = 0;
                    //         for(var j in data[i]){
                    //             console.log("J: ", j);
                    //             if(data[i][j] != null && data[i][j] != undefined && data[i][j] != tmpObj){
                    //                 if(j == 0){
                    //                     console.log(data[i][j].from, data[i][j].to);
                    //                     dataset.number = data[i][j].number;
                    //                     dataset.nodes.push({'name' : data[i][j].from});
                    //                     dataset.nodes.push({'name' : data[i][j].to});
                    //                     dataset.edges.push({'source' : count, 'target' : count+1});
                    //                     count++;
                    //                 }
                    //                 else{
                    //                     dataset.nodes.push({'name' : data[i][j].to});
                    //                     dataset.edges.push({'source' : count, 'target' : count+1});
                    //                     count++;        
                    //                 }
                    //             }
                    //         }
                    //     }
                    //     result.push(dataset);
                    // }
                    console.log("RESULT", data);
                    // app.get('/data5', function(req1, res1){
                    //     res1.send(JSON.stringify(result));
                    // });        
                    res.send(JSON.stringify(data));
                }
            });              
        });

        app.get('/link3', function(request, response){
          var data = req.query.data;
          response.send(JSON.stringify(data));
        });

        app.get('/data6', function(request, response){
          response.sendfile("./public/view3.html");
        });



        app.get('/query4', function(req, res){
            app.get('/data7', function(req1, res1){
                var source = req.query.source;
                var destination = req.query.destination;
                var date = req.query.date;
                console.log("test1: ", source, destination, date);
                var tmpObj = {};
                var result = {'nodes' : [], 'edges' : []};
                result.nodes.push({'name' : 'test1'});
                result.nodes.push({'name' : 'test2'});
                result.edges.push({'source' : 0, 'target' : 1});
                result.number = 69;
                res.send(JSON.stringify([result]));
                // bfs.getTrainRoute(source, destination, new Date(date).getDay(), function(err, data){   //function corresponding to date
                //     if(err){
                //         console.log("ERR: ", err);
                //     }
                //     else{
                //         console.log("data: ", data);
                //         var result = [];
                //         for(var i in data){
                //             tmp = data[i];
                //             var dataset = {'nodes' : [], 'edges' : []};
                //             if(data[i] != null && data[i] != undefined){
                //                 var count = 0;
                //                 for(var j in data[i]){
                //                     console.log("J: ", j);
                //                     if(data[i][j] != null && data[i][j] != undefined && data[i][j] != tmpObj){
                //                         if(j == 0){
                //                             console.log(data[i][j].from, data[i][j].to);
                //                             dataset.number = data[i][j].number;
                //                             dataset.nodes.push({'name' : data[i][j].from});
                //                             dataset.nodes.push({'name' : data[i][j].to});
                //                             dataset.edges.push({'source' : count, 'target' : count+1});
                //                             count++;
                //                         }
                //                         else{
                //                             dataset.nodes.push({'name' : data[i][j].to});
                //                             dataset.edges.push({'source' : count, 'target' : count+1});
                //                             count++;        
                //                         }
                //                     }
                //                 }
                //             }
                //             result.push(dataset);
                //         }
                //         console.log("RESULT", result);
                //         // app.get('/data1', function(req1, res1){
                //             res1.send(JSON.stringify(result));

                //         // });
                //     }
                // });
            });
            res.sendfile("./public/options4.html");
                
        });

        app.get('/data8', function(request, response){
          response.sendfile("./public/view4.html");
        });


        app.get('/data4', function(request, response){
          response.sendfile("./public/view2.html");
        });


        // Send to js file for routing
        app.get('/json/neo4j.json', function(request, response){
          response.sendfile("json/neo4j.json");
        });

        // JSON API
        app.post('/api/runAdhocQuery', api.runAdhocQuery);
        app.post('/api/runParallelQueries', api.runParallelQueries);
        app.post('/api/createNode', api.createNode);
        app.post('/api/deleteNode', api.deleteNode);
        app.post('/api/createRelationship', api.createRelationship);
        app.post('/api/deleteRelationship', api.deleteRelationship);
        app.post('/api/updateNode', api.updateNode);
        app.post('/api/getNode', api.getNode);
        app.get('/api/getAllNodes', api.getAllNodes);
        app.post('/signin', api.signin);

        // Simple route middleware to ensure user is authenticated.
        // Use this route middleware on any resource that needs to be protected. If
        // the request is authenticated (typically via a persistent login session),
        // the request will proceed. Otherwise, the user will be redirected to the
        // login page.
        function ensureAuthenticated(req, res, next) {
            if (req.isAuthenticated()) { return next(); }
            res.redirect('/login');
        }

        http.createServer(app).listen(app.get('port'), function(){
          console.log('Express server listening on port ' + app.get('port'));
        });




