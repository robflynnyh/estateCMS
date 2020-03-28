var express = require("express");
var app = express();
const mysql = require("mysql");
const fs = require("fs");

var dbAccess = 0;
var dbDetailsPage = {
    html:"",
    scripts:["/scripts/dbSetup.js"]
}; 
var rootUserPage = {
    html:"",
    scripts:["/scripts/RuserSetup.js"]
}

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
function checkUserTable(con,callback){
    let sql = "SELECT COUNt(*) FROM userINFO";
    con.query(sql,(er,result)=>{
        if(er){
            dbAccess = 1;
            callback();
        }else{
            dbAccess = 2;
            callback();
        }
        con.end();
    });
}

function testConnection(callback){
    var con = newConnection();
    con.connect(er=>{
        if(er){
            dbAccess=0;
            callback()
        }else{
            checkUserTable(con,callback);
        }
    });
}

fs.readFile("dbCredentials.json",(er,data)=>{
    if(er)dbAccess=0;
    else{
        DBdata = JSON.parse(data);
        testConnection(()=>{
            console.log("DB-"+dbAccess+" Credentials -- Loaded ✓");
        });
    }
});
fs.readFile(__dirname+"/serverFiles/dbSetup.html","utf8",(er,data)=>{
    if(er)throw er;
    else{
        dbDetailsPage.html = data;
        console.log("dbSetup page -- Loaded ✓");
    }
});
fs.readFile(__dirname+"/serverFiles/userSetup.html","utf8",(er,data)=>{
    if(er)throw er;
    else{
        rootUserPage.html = data;
        console.log("Setup page -- Loaded ✓");
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

function buildDBcredFile(){
    fs.writeFile("dbCredentials.json",JSON.stringify(DBdata),"utf8",err=>{
        if(err)throw err;
        console.log("New Credentials Saved");
    });
}
function createUserTable(con,socket,userdata){
    let sql="CREATE TABLE userINFO(userID int NOT NULL AUTO_INCREMENT PRIMARY KEY, username varchar(255) NOT NULL, password varchar(255) NOT NULL, permissions varchar(255) NOT NULL)";
    con.query(sql,(err,result)=>{
        if(err)throw err;
        con.end();
        createUser(userdata,socket);
    });
}

function createUser(userData,socket){
    var con = newConnection();
    con.connect(err=>{
      if(err){
          console.error("ERROR CONNECTING TO DB");
      }else{
        let sql = "SELECT * FROM userInfo";
        con.query(sql,(err,result)=>{
            if(err){
                console.log("No USER Table - creating one");
                createUserTable(con,socket,userData);  
            }
            else{    
                let sql = "INSERT INTO userInfo (username,password,permissions) VALUES ('"+userData[0]+"','"+userData[1]+"','"+userData[2]+"')";
                con.query(sql,(err,result)=>{
                    if(err){
                        console.error("Unable to create user");
                        con.end;
                    }
                    else{
                        console.log("User: "+userData[0]+" Permissions: "+userData[2]+" Created!");
                        con.end();
                        dbAccess = 2;
                    }
                });
            }
        });
      }
    });
}


function validateEmpty(data,fieldNum){
    if(Object.keys(data).filter(el=>data[el].length).length != fieldNum){
        return false;
    }else{
        return true;
    }
}

function PclientDB(socket){
    socket.emit("connectClient",{code:dbAccess,template:dbDetailsPage.html,scripts:dbDetailsPage.scripts});
    socket.on("setupDB",(data)=>{
        if(validateEmpty(data,5)==false){
            socket.emit("refresh","Please Fill in all fields");
        }else{
            DBdata = data;
            testConnection(()=>{
                switch(dbAccess){
                    case 0:
                        socket.emit("refresh","Invalid Details");
                        break;
                    case 1:
                        buildDBcredFile();
                        PrUserDB(socket);
                        break;
                    case 2:
                        console.log("Woop");
                        break;
                }
            });
        }
    });
}

function PrUserDB(socket){
    socket.emit("connectClient",{code:dbAccess,template:rootUserPage.html,scripts:rootUserPage.scripts});
    socket.on("newUser",data=>{
        if(validateEmpty(data,2)==false){
            socket.emit("refresh","Please Fill in all fields");
        }else{

        }
    });
}

admin.on("connection",(socket)=>{
    console.log("Admin page connection");
    switch(dbAccess){
        case 0:
            PclientDB(socket);
            break;
        case 1:
            PrUserDB(socket);
            break;
        case 2:
            break;
    }
});