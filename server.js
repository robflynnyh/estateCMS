var express = require("express");
var app = express();
const mysql = require("mysql");
const fs = require("fs");

var housePage = require("./module/housePage"); //for loading property specific page
var propSearch = require("./module/propertyReturn"); //gets info about property when given its ID
var hImagesManager = require("./module/hImageManager"); //saves and manages images for each property
var userLog = require("./module/userLogs"); //saves and manages images for each property

var dbAccess = 0; // dbAcess denotes what data the site has access to anything less than 2 and setup page is used instead of login
var socketUsers = [];
var site = { 
    name: "",
    description: "",
    homeText: ""
}

var dbDetailsPage = { //sent to client when needed
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
///////////////////////////////////////////////////////////SETUP -- all site data is read
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

function saveSiteInfo(callback){
    fs.writeFile("siteInfo.json",JSON.stringify(site),"utf8",err=>{
        if(err&&callback)callback(false);
        else if (err) throw(err);
        else{
            console.log("Site Info - file created");
            if(callback)callback(true);
        }
    });
}
//res.status(404).send('Not found');
fs.readFile("siteInfo.json","utf8",(er,data)=>{
    if(er)saveSiteInfo();
    else{
        site = JSON.parse(data);
        console.log("Site Info -- Loaded ✓");
    }
});
///
app.get("/admin",(req,res,nxt)=>{
    res.sendFile(__dirname+"/admin/main.html");
});
app.get("/siteInfo",(req,res,nxt)=>{
    res.sendFile(__dirname+"/siteInfo.json");
});
app.get("/property",(req,res)=>{ //custom page for each property generated from houseID through received from GET request
    fs.readFile(__dirname+"/serverFiles/propertyPage.html","utf8",(er,data)=>{
        if(er)res.status(404).send('Error Loading Page...'),console.error(er);
        else{
            var prop = new propSearch(newConnection(),req.query.id);
            prop.getData(outcome=>{
                console.log(outcome);
                if(outcome.result){
                    new housePage(data,outcome.data[0],html=>{
                        res.send(html);
                        res.end();
                    });
                }else{
                    res.status(404).send('Error Loading Property...')
                }
                prop.endConnection();
            });
            
        }
    });

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

function createUser(userData,socket){ //creates initial user
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


function validateEmpty(data,fieldNum){ //checks if anythings empty before updating files/db
    if(Object.keys(data).filter(el=>data[el].length).length != fieldNum){
        return false;
    }else{
        return true;
    }
}

function PclientDB(socket){ //sends client dbsetup page
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

function getIndex(socketid){ //returns user info  stored with their socketID
    return socketUsers.findIndex(el=>el.socketID==socketid);
}

function writeFromBuffer(imgpath,imgBuff,callback){ //writes an image file
    fs.writeFile(imgpath,Buffer.from(imgBuff),error=>callback(error));
}

function verifyLogin(loginData,socket,callback){ //checks login details
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
            var hIMGManager = new hImagesManager(houseID,writeFromBuffer);
            hIMGManager.init();
            hIMGManager.newProperty(result=>{
                if(!result.outcome)console.log(result.reason),callback("noImage"); //look at dash.js possibly change paremeters
                else{
                    hIMGManager.addImage(house.image,result2=>{
                        if(!result.outcome)console.log(result.reason),callback("noImage");
                        else{
                            callback(true);
                        }
                    })
                }
                con.end();
            });
        }
    });
}

function addNewHouse(house,callback){
    var con = newConnection();
    let sql = `INSERT INTO houses (address, postCode, city, description, beds, bathrooms, lat, lon, price, status)
                VALUES ("${house.address}","${house.postCode}","${house.city}","${house.description}","${house.bedrooms}","${house.bathrooms}","${house.lat}","${house.long}",
                "${house.price}", "${house.status}")`;
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
    socket.on("addImg",data=>{
        let image = data.file;
        let id = data.hID;
        var imgManager = new hImagesManager(id,writeFromBuffer);
        imgManager.getImagesData(result=>{
            if(result.outcome){
                imgManager.addImage(image,result2=>{
                    new userLog(socketUsers[getIndex(socket.id)].user,"Added Image to house: "+data.hID+".").add();
                    socket.emit("addImgResult",{outcome:result2.outcome,imgArray:result2.data});
                });
            }else{
                socket.emit("addImgResult",{outcome:false});
            }
        });
    });
    socket.on("removeImg",data=>{
        var imgManager = new hImagesManager(data.id,writeFromBuffer);
        imgManager.removeIMG(data.arrayNum,result=>{
            if(result.outcome){
                new userLog(socketUsers[getIndex(socket.id)].user,"Removed Image from house: "+data.hID+".").add();
            }
            socket.emit("removeImgResult",{outcome:result.outcome,imgArray:result.data});
        });
    });

    socket.on("newHouseImg",data=>{
        var imgManager = new hImagesManager(data,writeFromBuffer);
        imgManager.init();
        imgManager.newProperty(result=>{
            socket.emit("newHouseImgResult",result);
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
                    new userLog(socketUsers[getIndex(socket.id)].user,"Added new user: "+uData.username+" with Permissions: "+uData.permissions).add();
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
            if(result!=false)new userLog(socketUsers[getIndex(socket.id)].user,"Added house with address: "+data.address+".").add();
            socket.emit("addHouseResult",result);
        });
    });
    socket.on("siteBackgroundUpdate",data=>{
        if(socketUsers[getIndex(socket.id)].permissions == "root"){
            writeFromBuffer("images/Mbacking.image",data,err=>{
                if(err)console.log(err),socket.emit("sBresult",false);
                else{
                    new userLog(socketUsers[getIndex(socket.id)].user,"Updated site background image.").add();
                    console.log("-- Site background updated --");
                    socket.emit("sBresult",true);
                }
            });
        }
        else socket.emit("sBresult",false);
    });
    socket.on("siteInfoUpdate",data=>{
        if(socketUsers[getIndex(socket.id)].permissions == "root"){
            site.name = data.name;
            site.description = data.description;
            if(data.homeText)site.homeText=data.homeText;
            if(data.image){
                writeFromBuffer("images/logo.image",data.image,err=>{
                    if(err)console.log(err),socket.emit("siteInfoResult",false);
                    else{
                        saveSiteInfo(success=>{
                            if(success){
                                new userLog(socketUsers[getIndex(socket.id)].user,"Updated site info.").add();
                                console.log("-- Site info Saved --");
                                socket.emit("siteInfoResult",true);
                            }
                        });
                    }
                });
            }
            else{
                saveSiteInfo(outcome=>{
                    if(outcome)new userLog(socketUsers[getIndex(socket.id)].user,"Updated site info.").add();
                    socket.emit("siteInfoResult",outcome);
                });
            }
        }else socket.emit("siteInfoResult",false);
    });
    socket.on("deleteHouse",ID=>{
        ID = parseInt(ID);
        new propSearch(newConnection(),ID).removeHouse(outcome=>{
            if(outcome.result)new userLog(socketUsers[getIndex(socket.id)].user,"Removed House: "+ID+".").add();
            socket.emit("popupRequest",outcome);
        });
    });
    socket.on("updateHouse",data=>{
        new propSearch(newConnection(),data["id"]).updateHouse(data,outcome=>{
            if(outcome.result)new userLog(socketUsers[getIndex(socket.id)].user,"Added house: "+data["id"]+".").add();
            socket.emit("popupRequest",outcome);
        });
    });
    socket.on("uPermis",()=>{
        socket.emit("permissions",socketUsers[getIndex(socket.id)].permissions);
    });
}
function createHouseDB(con){
    let sql = `CREATE TABLE houses(houseID int AUTO_INCREMENT PRIMARY KEY, address varchar(255) NOT NULL UNIQUE,
                                 postCode varchar(10) NOT NULL, city varchar(20) NOT NULL, description varchar(1000), beds int NOT NULL, bathrooms int NOT NULL, lat varchar(255), lon varchar(255),
                                 price decimal(15,2) NOT NULL, status varchar(20)
                                 )`;
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
                    socket.emit("connectClient",{code:dbAccess+1,template:dashBoardPage.html,scripts:dashBoardPage.scripts,siteInfo:site});
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

function addPropsImages(propList,callback){
    var results = propList;
    var promises = [];
    function prop(el,i){
        return new Promise(resolve=>{
            new hImagesManager(el.houseID).getImagesData(outcome=>{
                if(outcome.data)results[i].image=outcome.data[0];
                resolve();
            });
        });
    }
    results.forEach((el,i)=>{
        promises.push(prop(el,i));
    })
    Promise.all(promises).then(()=>{
        callback(results);
    })
}

//user section
user.on("connection",socket=>{
    socket.emit("siteDetails",site);
    socket.on("sendProps",()=>{
        getProps(results=>{
            addPropsImages(results,props=>{
                socket.emit("props",props);
            });
        });
    });
   
});
