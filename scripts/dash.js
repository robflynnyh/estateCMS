function docReady(){
    var dash = new dashboard(0);
    $(".mItem").each((i,el)=>{
        $(el).click(event=>{
            dash.setView(i);
        });
    });
}

function hPage(html,dash){
    $(".main").html(html);
    var fileReader = new FileReader();
    var currentFile="";
    $("#ADDprop").click(event=>{
        let addr = $("#addr").val();
        let pcode = $("#pcode").val();
        let city = $("#city").val();
        let hDesc = $("#houseDesc").val();
        var newHouse = {
            address: addr,
            postCode: pcode,
            city: city,
            description:hDesc,
            image: currentFile
        }
        if(Object.values(newHouse).some(el=>el.length==0)==false){
            fileReader.onload = e =>{
                newHouse.image == e.target.result;
                dash.addNewHouse(newHouse,success=>{
                    console.log(success);
                    if(success==true || success=="noImage"){
                        dash.getHouses(()=>{
                            if(success=="noImage")alert("Unable to save image");
                            dash.setView(2);
                        });
                    }else{
                        alert("Error adding house");
                    }
                });
            }
            fileReader.readAsArrayBuffer(newHouse.image);
        }else{
            alert("Please fill in all fields");
        }
        
    });
    $(".fileUpload").change(event=>{
        currentFile = event.target.files[0];
    });
}

function siteInfoPage(html,dash){
    $(".main").html(html);
    $("#siteIMAGE").attr("src","/images/logo.image?"+new Date().getTime()); //update image instead of cached image
    var fileReader = new FileReader();
    var currentFile;
    $(".formBtn").click(event=>{
        if(currentFile){
            fileReader.onload = e =>{
                let siteLogo = e.target.result;
                dash.newSiteInfo({image:siteLogo},result=>{
                    if(result){
                        dash.setView(0);
                    }else{
                        alert("Error updating site info");
                    }
                });
                //console.log(e.target.result);

            }
            fileReader.readAsArrayBuffer(currentFile);
        }
    });
    $(".fileUpload").change(event=>{
        currentFile = event.target.files[0];
    });
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

