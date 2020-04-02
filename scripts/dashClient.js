var siteDetailsP = `
<div id="siteDetails">
<div id="lPanel">
    <img src="/images/logo.image" id="siteIMAGE">
    <span class="tBox">Site Logo</span>
</div>
<div id="rPanel">
    <div class="formElement">
        <span class="formText">Site Name:</span>
        <span class="formInput"><input type="text" id="siteName"></span>
    </div>
    <div class="formElement">
        <span class="formText">Site Description:</span>
        <span class="formInput"><input type="text" id="siteDesc"></span>
    </div>
    <div class="formElement">
        <span class="formText">Site Logo:</span>
        <span class="formInput"><input type="file" id="siteLogo" class="fileUpload"></span>
    </div>
    <div class="formBtn">Update</div>
</div>
</div>
`;
var userPage = `
<div id="manage">
<div id="lPanel">
    <div id="title">Manage Users</div>
    <div class="contentBox">
    //[USERS]//
    </div>
</div>
<div id="rPanel">
    <div id="title">Add User</div>
    <div class="contentBox">
        <div class="field top"><span>Username:</span> <input type="text" id="uword"></div>
        <div class="field"><span>Password:</span> <input type="password" id="pword"></div>
        <div class="field"><span>Permissions:</span>
        <select id="permis">
            <option value="1">1</option>
            <option value="root">Root</option>
        </select>
        </div>
        <div class="field bottom"><button type="button" id="ADDUSER">Add User</button></div>
    </div>
</div>
</div>
`;
var userPageData = "";
var housePage = `
<div id="manage">
<div id="lPanel">
    <div id="title">Manage Houses</div>
    <div class="contentBox">
    //[HOUSES]//
    </div>
</div>
<div id="rPanel">
    <div id="title">Add Houses</div>
    <div class="contentBox">
        <div class="field top"><span>Address:</span> <input type="text" id="addr"></div>
        <div class="field"><span>Post Code:</span> <input type="text" id="pcode"></div>
        <div class="field"><span>City:</span> <input type="text" id="city"></div>
        <div class="field" style="height:min-content"><span>Description:</span>
        <textarea id="houseDesc" rows="3"></textarea>
        </div>
        <div class="field"><span>Property Image:</span><input type="file" id="hImage" class="fileUpload"></div>
        <div class="field bottom"><button type="button" id="ADDprop">Add Property</button></div>
    </div>
</div>
</div>
`;
var housePageData = "";

class dashboard{
    constructor(view){
        this.view = view;
        this.users = [];
        this.houses = [];
        this.listeners = [];
        this.init();
    }
    init(){
        this.getUsers();
        this.getHouses();
        this.setView(this.view);
    }
    setActive(){
        $(".mItem").each((i,el)=>{
            if(i==this.view){
                $(el).css("background-color","rgba(255, 255, 255, 0.65)").hover(()=>{
                    $(el).css("background-color","rgba(255, 255, 255, 0.65)");
                });
            }else{
                $(el).css("background-color","white").hover(()=>{
                    $(el).css("background-color","rgba(255, 255, 255, 0.65)");
                },()=>{
                    $(el).css("background-color","white");
                });
            }
        });
    }
    setView(v){
        this.view = v;
        switch(this.view){
            case 0:
                siteInfoPage(siteDetailsP,this);
                this.setActive();
                break;
            case 1:
                this.getUsers();
                uPage(userPageData,this);
                this.setActive();
                break;
            case 2:
                this.getHouses();
                hPage(housePageData,this);
                this.setActive();
                break;
        }
    }
    getHouses(callback){
        if(housePageData==""){housePageData=housePage.replace("//[HOUSES]//","");}
        socket.emit("getHouses");
        socket.off("housesReturned");
        socket.on("housesReturned",houseD=>{
            this.houses = houseD;
            this.returnHouses(string=>{
                housePageData = housePage.replace("//[HOUSES]//",string);
                if(callback)callback();
            });
        });
    }
    getUsers(callback){
        if(userPageData==""){userPageData = userPage.replace("//[USERS]//","");}
        socket.emit("getUsers");
        socket.off("usersReturned");
        socket.on("usersReturned",userD=>{
            this.users = userD;
            this.returnUsers(string=>{
                userPageData = userPage.replace("//[USERS]//",string);
                if(callback)callback();
            });
        });
    }
    returnUsers(callback){
        var string = '<div id="userSearch"><input type="text"></div>';
        this.users.forEach(el=>{
            string += `<div class="user" data-user="${el.username}">
                       <div class="uNameT"><b>Username:</b> ${el.username}</div>
                       <div class="pMissT"><b>Access:</b> ${el.permissions}</div>
                       </div>
            `;
        });
        callback(string);
    }
    returnHouses(callback){
        var string = '<div id="houseSearch"><input type="text"></div>';
        this.houses.forEach(el=>{
            string += `<div class="house" data-house="${el.houseID}">
                       <div class="Haddress"><b>Address:</b> ${el.address}</div>
                       <div class="HpCode"><b>Post Code:</b> ${el.postCode}</div>
                       </div>
            `;
        });
        callback(string);
    }
    newUser(data,callback){
        socket.emit("newUserDash",data);
        socket.off("newUserRequest");
        socket.on("newUserRequest",result=>{
            callback(result);
        });
    }
    newSiteInfo(data,callback){
        socket.emit("siteInfoUpdate",data);
        socket.off("siteInfoResult");
        socket.on("siteInfoResult",result=>{
            callback(result);
        });
    }

    addNewHouse(data,callback){
        socket.emit("addHouse",data);
        socket.off("addHouseResult");
        socket.on("addHouseResult",result=>{
            callback(result);
        });
    }
    
}

