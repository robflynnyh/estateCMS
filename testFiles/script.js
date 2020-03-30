var dash = new dashboard(1,2);
function displayUsers(){
    dash.returnUsers((html)=>{
        var contents = `<div id="userSearch"><input type="text"></div>
        `+html;
        console.log(contents);
        $("#userManage #lPanel .userBox").html(contents);
    });
}
displayUsers();

