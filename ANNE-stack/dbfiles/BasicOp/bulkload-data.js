const fs = require("fs");
const _ = require("lodash");
const async = require("async");

// Set the directory
var dir = process.argv[2];
console.log("Reading from "+dir);
// Set the size of bulk loading in one step
var bulk_size = 50;
console.log("The size of 1 bulk input is "+ bulk_size);

async.waterfall([
    // Reading the directory for all files to load
    function(callback){
        fs.readdir(dir, (err, files)=>{
            if(err) callback(err);
            callback(null, files);
        });
    },
    // Partitioning the file list into groups of bulk_size each
    function(files ,callback){
        var file_group = [];
        var file_list = [];
        var i = 0;
        files.forEach( file => {
            if(i<bulk_size) {
                file_list.push(file);
                i++;
            }
            else{
                file_group.push(file_list);
                file_list = [];
                i=0;

                file_list.push(file);
                i++;
            }
        });

        if(file_list.length !== 0){
            file_group.push(file_list);
        }
        // console.log(file_group);

        callback(null, file_group);
    },
    // To Do Add the code to transfer the data in neo4j
    function(file_group, callback){
        var count = 0;
        console.log("Getting the files");
        file_group.forEach( list => {
            async.waterfall([
                function(callback) {
                    var obj_list = [];
                    async.each(list,
                        (file, callback) => {
                            fs.readFile(dir+'/'+file, 'utf-8', function(err, data){
                                if(err) {
                                    callback(err);
                                } else {
                                    if (! data) {
                                        callback('Empty File '+dir+'/'+file);
                                    } else {
                                        // To add the code for add the obj_list to neo4j
                                        obj_list.push(JSON.parse(data));
                                        callback(null);
                                    }
                                }
                            });
                        },
                        (err) => {
                            if(err) {
                                callback(err, null);
                            } else {
                                console.log(obj_list);
                                callback(null);
                            }
                        });
                }],
                function(err) {
                    count ++;
                    if (count == file_group.length) {
                        callback(err, null);
                    } else if (err) {
                        console.log(err);
                    }
                });
        });
    }],
    function(err, result){
        if(err) console.log(err);
        else console.log("Success");
    }
);

