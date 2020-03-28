var express = require("express");
var app = express();
const mysql = require("mysql");
const fs = require("fs");

var dbAccess = 0;

var DBdata = {
    hName:undefined,
    uName:undefined,
    pass:undefined,
    port:undefined,
    dbName:undefined
}

function newConnection(){
    return mysql.createConnection({
      host:DBdata.hName,
      user:DBdata.uName,
      password:DBdata.pass,
      port:DBdata.port,
      database:DBdata.dbName
    });
}

function testConnection(){
    let con = newConnection();
    con.connect(er=>{
        if(er){
            dbAccess=0;
        }
    });
}

fs.readFile("dbCredentials.json",(er,data)=>{
    if(er)dbAccess=0;
    else{
        DBdata = JSON.parse(data);
        dbAccess = 1;
        testConnection();
    }
});
///
app.get("/admin",(res,req)=>{
    res.sendFile(__dirname+"/admin/main.html");
});
///
app.use('/css',express.static(__dirname +'/css'));
app.use('/images',express.static(__dirname +'/images'));
app.use('/scripts',express.static(__dirname +'/scripts'));
var server = app.listen(8080, function(){
  console.log('listening on :8080');
});
var io = require("socket.io")(server);

const admin = io.of("/admin");

admin.on("connection",(socket)=>{

});