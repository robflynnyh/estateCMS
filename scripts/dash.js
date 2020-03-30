function docReady(){
    var dash = new dashboard(0);
    $(".mItem").each((i,el)=>{
        $(el).click(event=>{
            dash.setView(i);
        });
    });
}
function pageContent(html){
    $(".main").html(html);
}

function uPage(html,dash){
    $(".main").html(html);
    $("#ADDUSER").click(event=>{
        let u = $("#uword").val();
        let p = $("#pword").val();
        let per =$("#permis").val();
        if(u.length==0||p.length==0)alert("Please fill in all fields");
        else{
            let data = {
                username:u,
                password:p,
                permissions:per
            }
            dash.newUser(data,success=>{
                if(success){
                    dash.getUsers(()=>{
                        dash.setView(1);
                    });
                }else{
                    alert("Error");
                }
            });
        }
    });
}