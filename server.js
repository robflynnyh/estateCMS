var express = require("express");
var app = express();
const mysql = require("mysql");
const fs = require("fs");

var dbAccess = 0;
var socketUsers = [];

var dbDetailsPage = {
    html:"",
    scripts:["/scripts/dbSetup.js"]
}; 
var rootUserPage = {
    html:"",
    scripts:["/scripts/RuserSetup.js"]
}
var loginPage = {
    html:"",
    scripts:["/scripts/login.js"]
}
var dashBoardPage = {
    html:"",
    scripts:["/scripts/dashClient.js","/scripts/dash.js"]
}

var DBdata = {
    hName:"",
    uName:"",
    pass:"",
    port:"",
    dbName:""
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
            if(result.length>0){
                dbAccess = 2;
            }else{
                dbAccess = 1;
            }
            callback();
        }
        con.end();
    });
}

function testConnection(callback){
    if(validateEmpty(DBdata,5)==true){
        var con = newConnection();
        con.connect((er,result)=>{
            if(er){
                dbAccess=0;
                callback()
            }else{
                console.log;
                checkUserTable(con,callback);
            }
        });
    }
    else{
        dbAccess=0;
        callback();
    }
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
fs.readFile(__dirname+"/serverFiles/loginPage.html","utf8",(er,data)=>{
    if(er)throw er;
    else{
        loginPage.html = data;
        console.log("Login page -- Loaded ✓");
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
fs.readFile(__dirname+"/serverFiles/dashboard.html","utf8",(er,data)=>{
    if(er)throw er;
    else{
        dashBoardPage.html = data;
        console.log("Dashboard page -- Loaded ✓");
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
app.use('/',express.static(__dirname +'/htdocs'));
var server = app.listen(8080, function(){
  console.log('listening on :8080');
});
var io = require("socket.io")(server);
const admin = io.of("/admin");
const user = io.of("/user");

function buildDBcredFile(){
    fs.writeFile("dbCredentials.json",JSON.stringify(DBdata),"utf8",err=>{
        if(err)throw err;
        console.log("New Credentials Saved");
    });
}
function createUserTable(con,socket,userdata){
    let sql="CREATE TABLE userINFO(userID int NOT NULL AUTO_INCREMENT PRIMARY KEY, username varchar(255) NOT NULL UNIQUE, password varchar(255) NOT NULL, permissions varchar(255) NOT NULL)";
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
                let sql = "INSERT INTO userInfo (username,password,permissions) VALUES ('"+userData.user+"','"+userData.pass+"','"+userData.permissions+"')";
                con.query(sql,(err,result)=>{
                    if(err){
                        console.error("Unable to create user");
                        con.end();
                    }
                    else{
                        console.log("User: "+userData.user+" Permissions: "+userData.permissions+" Created!");
                        con.end();
                        dbAccess = 2;
                        Plogin(socket);
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
                        buildDBcredFile();
                        Plogin(socket);
                        break;
                }
            });
        }
    });
}

function PrUserDB(socket){
    socket.emit("connectClient",{code:dbAccess,template:rootUserPage.html,scripts:rootUserPage.scripts});
    socket.on("newUser",data=>{
        data.permissions = "root";
        if(validateEmpty(data,3)==false){
            socket.emit("refresh","Please Fill in all fields");
        }else{
            createUser(data,socket);
        }
    });
}

function getIndex(socketid){
    return socketUsers.findIndex(el=>el.socketID==socketid);
}

function writeFromBuffer(imgpath,imgBuff,callback){
    fs.writeFile(imgpath,Buffer.from(imgBuff),error=>callback(error));
}

function verifyLogin(loginData,socket,callback){
    var con = newConnection();
    let sql = "SELECT username, permissions FROM userInfo WHERE username = '"+loginData.username+"' and password = '"+loginData.password+"'";
    con.query(sql,(err,result)=>{
      if(err)throw err //?
      if(result.length==0){
        socket.emit("refresh","Incorrect Login Details");
        con.end();
        callback(false);
      }
      else {
          socketUsers[getIndex(socket.id)].user = result[0].username;
          socketUsers[getIndex(socket.id)].permissions = result[0].permissions;
          console.log(socketUsers[getIndex(socket.id)]);
          con.end();
          callback(true);
      }
    });
  }

function addHouseImage(house,con,callback){
    let sql = `SELECT houseID FROM houses WHERE address = "${house.address}" `;
    con.query(sql,(error,result)=>{
        if(error)con.end(),console.log(error),callback("noImage");
        else{
            var houseID = result[0].houseID;
            writeFromBuffer("images/houses/"+houseID,house.image,err=>{
                if(err)console.log(err),callback("noImage");
                else{
                    callback(true);
                    con.end();
                }
            });
        }
    });
}

function addNewHouse(house,callback){
    var con = newConnection();
    let sql = `INSERT INTO houses (address, postCode, city, description, beds, bathrooms, lat, lon  )
                VALUES ("${house.address}","${house.postCode}","${house.city}","${house.description}","${house.bedrooms}","${house.bathrooms}","${house.lat}","${house.long}")`;
    con.query(sql,(err,result)=>{
        if(err)con.end(),console.log(err),callback(false);
        else{
            addHouseImage(house,con,callback);
        }
    });
}

function Pdash(socket){
    socket.on("getUsers",()=>{
        if(socketUsers[getIndex(socket.id)].permissions == "root"){
            console.log(socketUsers[getIndex(socket.id)]); /////////////////
            let con = newConnection();
            let sql = "SELECT username, permissions FROM userInfo";
            con.query(sql,(err,result)=>{
                if(err)throw err //?
                else {
                    socket.emit("usersReturned",result);
                    con.end();
                }
              });

        }
    });
    socket.on("getHouses",()=>{
        console.log(socketUsers[getIndex(socket.id)]); /////////////////
        let con = newConnection();
        let sql = "SELECT * FROM houses";
        con.query(sql,(err,result)=>{
            if(err)throw err //?
            else {
                socket.emit("housesReturned",result);
                con.end();
            }
        });
    });
    socket.on("newUserDash",uData=>{
        if(socketUsers[getIndex(socket.id)].permissions == "root"){
            let con = newConnection();
            let sql = "INSERT INTO userInfo (username,password,permissions) VALUES ('"+uData.username+"','"+uData.password+"','"+uData.permissions+"')";
            con.query(sql,(err,result)=>{
                if(err){
                    console.log(err);
                    socket.emit("newUserRequest",false);
                }else{
                    console.log("USER ADDED");
                    socket.emit("newUserRequest",true);
                }
            });
        }else{
            socket.emit("newUserRequest",false);
        }
    });

    socket.on("addHouse",data=>{
        addNewHouse(data,result=>{
            socket.emit("addHouseResult",result);
        });
    });

    socket.on("siteInfoUpdate",data=>{
        writeFromBuffer("images/logo.image",data.image,err=>{
            if(err)console.log(err),socket.emit("siteInfoResult",false);
            else{
                console.log("-- Site Log Saved --");
                socket.emit("siteInfoResult",true);
            }
        });
    });
}

function createHouseDB(con){
    let sql = `CREATE TABLE houses(houseID int AUTO_INCREMENT PRIMARY KEY, address varchar(255) NOT NULL UNIQUE,
                                 postCode varchar(10) NOT NULL, city varchar(20) NOT NULL, description varchar(1000), beds int NOT NULL, bathrooms int NOT NULL, lat varchar(255), lon varchar(255))`;
    con.query(sql,(err,result)=>{
        if(err)throw err;
        console.log("-- Houses table created --");
        con.end();
    });
}

function checkHouseDB(){
    let con = newConnection();
    let sql = "SELECT * FROM houses";
    con.query(sql,(err,result)=>{
        if(err){
            createHouseDB(con);
        }else con.end();
    });
}

function Plogin(socket){
    socket.emit("connectClient",{code:dbAccess,template:loginPage.html,scripts:loginPage.scripts});
    socket.on("loginUser",data=>{
        if(validateEmpty(data,2)==true){
            verifyLogin(data,socket,result=>{
                if(result){
                    socket.emit("connectClient",{code:dbAccess+1,template:dashBoardPage.html,scripts:dashBoardPage.scripts});
                    Pdash(socket);
                }
            });
        }else{
            socket.emit("refresh","Please fill in all fields")
        }
    });
    socket.on("checkDB",()=>{
        checkHouseDB();
    });
}

admin.on("connection",socket=>{
    socketUsers.push({socketID:socket.id});
    testConnection(()=>{
        console.log("Admin page connection");
        switch(dbAccess){
            case 0:
                PclientDB(socket);
                break;
            case 1:
                PrUserDB(socket);
                break;
            case 2:
                Plogin(socket);
                break;
        }
    });
    socket.on('disconnect',()=>{
        socketUsers = socketUsers.filter(el=>el.socketID!=socket.id);
    });
});

function getProps(callback){
    var con = new newConnection();
    let sql = `SELECT * FROM houses`;
    con.query(sql,(err,results)=>{
        con.end();
        if(err)console.error(err),callback(false);
        else callback(results);
    });
}

//user section
user.on("connection",socket=>{
    socket.on("sendProps",()=>{
        getProps(results=>{
            socket.emit("props",results);
        });
    });
});
