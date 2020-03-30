var siteDetailsP = `
<div id="siteDetails" style="display:none;">
<div id="lPanel">
    <img src="logo.png">
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
var dataSet = [
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    },
    {
        name:"Jerry Brown",
        Uname:"Jerry27",
        Pmiss:3
    }
]
class dashboard{
    constructor(view,user){
        this.view = view;
        this.user = user;
        this.users = [];
        this.init();
    }
    init(){
        this.getUsers();
        this.setView(this.view);
    }
    setView(v){
        switch(v){
            case 0:
                $("#content").html(siteDetailsP);
                break;
            case 1:
                break;
        }
    }
    getUsers(){
        this.users = dataSet;
    }
    returnUsers(callback){
        var string = "";
        this.users.forEach(el=>{
            string += `<div class="user">
                       <div class="nameT">${el.name}</div>
                       <div class="uNameT">${el.Uname}</div>
                       <div class="pMissT">${el.Pmiss}</div>
                       </div>
            `;
        });
        callback(string);
    }
    
}

