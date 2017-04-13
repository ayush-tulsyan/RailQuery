var app = require('express')(),
        server = require('http').Server(app),
            io = require('socket.io')(server),
                port = process.env.PORT || 8080;

server.listen(port, function(){
        console.log("listening port " + port);

});

