var express = require("express");
var app = express();
const mysql = require("mysql");
const fs = require("fs");

var dbAccess = 0;
var dbDetailsPage; 

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
function checkUserTable(con){
    let sql = "SELECT COUNt(*) FROM userINFO";
    con.query(sql,(er,result)=>{
        if(er)return false;
        else return true;
    });
}

function testConnection(){
    var con = newConnection();
    con.connect(er=>{
        if(er){
            dbAccess=0;
        }else{
            if(checkUserTable(con))dbAccess=2;
            else dbAccess = 1;
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
fs.readFile(__dirname+"/serverFiles/dbSetup.html","utf8",(er,data)=>{
    if(er)throw er;
    else{
        dbDetailsPage = data;
        console.log("dbSetup page -- Loaded ✓")
    }
});
///
app.get("/admin",(req,res,nxt)=>{
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

function PclientDB(socket){
    socket.emit("connectClient",{code:dbAccess,template:dbDetailsPage});
}

admin.on("connection",(socket)=>{
    console.log("Admin page connection");
    switch(dbAccess){
        case 0:
            PclientDB(socket);
            break;
        case 1:
            break;
        case 2:
            break;
    }
});