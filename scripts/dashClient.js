
var siteDetailsP = `
<div id="siteDetails">
<div id="lPanel">
    <img src="/images/logo.image" id="siteIMAGE">
    <span class="tBox">Site Logo</span>
</div>
<div id="rPanel">
    <div class="formElement">
        <span class="formText">Site Name:</span>
        <span class="formInput"><input type="text" id="siteName" value="//[SITENAME]//"></span>
    </div>
    <div class="formElement">
        <span class="formText">Site Description:</span>
        <span class="formInput"><input type="text" id="siteDesc" value="//[SITEDESC]//"></span>
    </div>
    <div class="formElement">
        <span class="formText">Site Logo:</span>
        <span class="formInput"><input type="file" id="siteLogo" class="fileUpload"></span>
    </div>
    <div class="formBtn">Update</div>
</div>
</div>
`;
var siteDetailsPdata;
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
        <div class="field">
        <span>
        Beds: <input type="number" id="beds" style="width:4rem; margin-left:1rem" min="1" max="20">
        </span>
        <span>
        Bathrooms: <input type="number" id="bathrooms" style="width:4rem; margin-left:1rem" min="1" max="15">
        </span>
        </div>
        <div class="field"><span>Property Image:</span><input type="file" id="hImage" class="fileUpload"></div>
        <div class="field"><span id="propPriceText">Price: (£PCM)</span> <input type="number" id="price" min="0"></div>
        <div class="field">
        <span>Sale type:</span> 
        <select id="propStatus">
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
        </select>
        </div>
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
                this.getInfo();
                siteInfoPage(siteDetailsPdata,this);
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

    getInfo(){
        siteDetailsPdata = siteDetailsP.replace("//[SITENAME]//",siteInfo.name);
        siteDetailsPdata = siteDetailsPdata.replace("//[SITEDESC]//",siteInfo.description);
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
        var string = '<div id="userSearch"><input type="text" id="uTxtInput" placeholder="Filter by username"></div>';
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
        var string = '<div id="houseSearch"><input type="text" id="hTxtInput" placeholder="Filter by address"></div>';
        this.houses.forEach(el=>{
            string += `<div class="house" data-house="${el.address}">
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

    updateAll(callback){
        this.getUsers(()=>{
            this.getHouses(()=>{
                callback();
            });
        });
    }
    newHouseImg(id,callback){
        socket.emit("newHouseImg",id);
        socket.off("newHouseImgResult");
        socket.on("newHouseImgResult",result=>{
            console.log(result);
            callback(result);
        });
    }
    
}

function returnObject(callback){ //builds object using fieldnames and values
    var obj = {};
    $(".popupInputArea").each(i=>{
        let fname = $(".popupInputArea")[i].getAttribute("name");
        let fval = $(".popupInputArea")[i].value;
        obj[fname] = fval;
    }).promise().done(()=>{
        callback(obj);
    });
}
//constructor(displayData,editFields,numFields,dropdown,imagesPath,imageList,identifier,socketDelete,socketUpdate,dash,currentImage){
class popupBox{
    constructor(options){

        this.currentImage = 0;
        Object.keys(options).forEach(el=>{
            this[el] = options[el];
        });
        this.html = "";  
    }
    createPopup(){
        $("#overlay").show();
        $("#popup").show();
        this.html += `<div id="topbar"><div id="exit">X</div></div>`;
        if(this.imgPath != false){
            if(this.imgList.outcome){
                this.html += `
                    <img src="${this.imgPath}${this.imgList.data.images[this.currentImage]}" id="popupIMG" title="Left click to cycle images">
                    <div id="imgNum" style="text-align:center;font-weight:600;user-select:none">${this.currentImage+1}/${this.imgList.data.images.length}</div>
                    <div id="imgTools">
                    <div id="removeImg">Remove Image</div>
                    <input type="file" id="uploadBtn" style="display:none">
                    <label id="addImg" for="uploadBtn">Add Image</label>
                    </div>
                    `;
            }
        }
        this.html+="<div id='formContainer'>";
        if(this.info){
            this.info.forEach(el=>{
                this.html += `
                    <div class="displayField">
                    <span class="fname">${el.Fname}:</span> <span class="fdata">${el.Fdata}</span>
                    </div>
                `;
            });
        }
        if(this.editable){
            this.editable.forEach(el=>{
                this.html+= `
                    <div class="displayField">
                    <span class="fname" style="align-self: center;">${el.Fname}:</span> <textarea class="popupInputArea" name="${el.Fname}" rows="${el.rows}">${el.Fdata}</textarea>
                    </div> 
                `;
            });
        }
        if(this.numFields){
            this.numFields.forEach(el=>{
                let placeholder = "";
                if(el.placeholder)placeholder=el.placeholder;
                this.html+= `
                <div class="displayField">
                <span class="fname" style="align-self: center;">${el.Fname}:</span> <input class="popupInputArea" type="number" name="${el.Fname}" value="${el.Fdata}" placeholder="${placeholder}">
                </div>
                `;
            });
        }
        if(this.dropDown){
            this.dropDown.forEach(el=>{
                this.html+=`
                <div class="displayField">
                    <span class="fname" style="align-self: center;">${el.Fname}:</span> 
                    <select class="popupDropDown popupInputArea" name="${el.Fname}">`;
                    el.options.forEach(el2=>{
                        let selected = "";
                        if(el2[0]==el.Fdata)selected="selected";
                        this.html+= `
                            <option value="${el2[0]}" ${selected}>${el2[1]}</option>
                        `;
                    });
                this.html+=`
                    </select>
                </div>
                `;
            });
        }
        this.html+= `</div>
            <div id="removeBtn">Remove</div>
            <div id="updateBtn">Update</div>
        `;
        $("#popup").html(this.html);
        $("#popup #exit").click(event=>this.destroyPopup());
        $("#popup #removeBtn").click(event=>this.deleteItem());
        $("#popup #updateBtn").click(event=>this.updateItem());
        if(this.imgPath){
            if(this.imgList.outcome){
                $("#popupIMG").click(e=>{
                    if(this.currentImage+1 >= this.imgList.data.images.length){
                        this.currentImage = 0;
                    }else{
                        this.currentImage++;
                    }
                    $("#popupIMG").attr("src",this.imgPath+this.imgList.data.images[this.currentImage]);
                    $("#imgNum").text(this.currentImage+1+"/"+this.imgList.data.images.length);
                });
                $("#popup #removeImg").click(e=>{
                    socket.emit("removeImg", {arrayNum:this.currentImage,id:this.ID});
                    socket.off("removeImgResult");
                    socket.on("removeImgResult",result=>{
                        if(result.outcome){
                            this.imgList.data.images = result.imgArray;
                            if(this.currentImage!=0){
                                this.currentImage -= 1;
                            }
                            new popupBox(this).createPopup();
                        }else{
                            $("#popup").html("<div style='text-align:center'>Request Unsuccesful</div>");
                            setTimeout(()=>this.destroyPopup(),2000);
                        }
                    });
                });
                $("#popup #uploadBtn").change(e=>{
                    let currentFile = e.target.files[0];
                    let fileReader = new FileReader();
                    fileReader.onload = event => {
                        currentFile = event.target.result;  
                        socket.emit("addImg",{file:currentFile,hID:this.ID});
                        socket.off("addImgResult");
                        socket.on("addImgResult",result=>{
                            if(result.outcome){
                                this.imgList.data.images = result.imgArray;
                                new popupBox(this).createPopup();
                            }else{
                                $("#popup").html("<div style='text-align:center'>Request Unsuccesful</div>");
                                setTimeout(()=>this.destroyPopup(),2000);
                            }
                        });
                    }
                    fileReader.readAsArrayBuffer(currentFile);
                });
                 
            }
        }
        this.listener();
    }
    listener(){
        socket.off("popupRequest");
        socket.on("popupRequest",outcome=>{
            $("#popup").css("top","100px");
            if(outcome.result)$("#popup").html("<div style='text-align:center'>Request Succesful</div>");
            else $("#popup").html("<div style='text-align:center'>Request Unsuccesful</div>");
            setTimeout(()=>this.destroyPopup(),2000);
        });
    }
    deleteItem(){
        socket.emit(this.socketDelete,this.ID);
    }
    updateItem(){
        returnObject(object=>{
            object["id"]=this.ID;
            socket.emit(this.socketUpdate,object);
        });
    }
    destroyPopup(){
        $("#popup").html("");
        $("#popup").css("top","1px");
        $("#popup").hide();
        $("#overlay").hide();   
        this.dash.updateAll(()=>{
            this.dash.setView(this.dash.view);
        });
    }
}

