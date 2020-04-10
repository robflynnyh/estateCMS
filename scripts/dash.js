function docReady(){
    var dash = new dashboard(0);
    $(".mItem").each((i,el)=>{
        $(el).click(event=>{
            dash.setView(i);
        });
    });
}

function getGeocode(pcode,addr,thecity,callback){
    let key="key=ee62c5bae17847";
    let baseUrl = "https://eu1.locationiq.com/v1/search.php?"
    let format = "&format=json";
    let street = addr.replace(" ","+");
    let city = thecity.replace(" ","+");
    let postCode = pcode.replace(" ","+");
    let string = `${baseUrl}${key}&street=${street}&city=${city}&postalcode=${postCode}&countrycodes=gb${format}`;
    $.get(string,(data,success)=>{
        callback({data:data,outcome:success});
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
        let beds = $("#beds").val();
        let baths = $("#bathrooms").val();
        var newHouse = {
            address: addr,
            postCode: pcode,
            city: city,
            description:hDesc,
            bedrooms:beds,
            bathrooms:baths,
            image: currentFile
        }
        if(Object.values(newHouse).some(el=>el.length==0)==false){
            getGeocode(pcode,addr,city,result=>{
                if(result.outcome!="success"){
                    alert("Unable to find geocode please add manually");
                    newHouse.lat="NULL";
                    newHouse.long="NULL";
                }
                if(result.outcome=="success"){
                    let geocode = result.data[0];
                    newHouse.lat = geocode.lat;
                    newHouse.long = geocode.lon;
                }
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
            });
        }else{
            alert("Please fill in all fields");
        }
        
    });
    $(".fileUpload").change(event=>{
        currentFile = event.target.files[0];
    });
    $(".house").each((i,el)=>{
        $(el).off("click");
        $(el).click(event=>{
            var address = $(el).data("house");
            var house  =  dash.houses.filter(el=>el.address==address)[0];
            var housePopup = new popupBox(
                [{Fname:"House ID",Fdata:house.houseID},{Fname:"House Address",Fdata:house.address},{Fname:"Post Code",Fdata:house.postCode},{Fname:"City",Fdata:house.city}],
                [{Fname:"Description",Fdata:house.description}],
                "images/houses/"+house.houseID
            );
            housePopup.createPopup();
        });
    });

    $("#hTxtInput").off("input");
    $("#hTxtInput").on("input",event=>{
        let value = $("#hTxtInput").val().toLowerCase();
        $(".house").each((i,el)=>{
            let house = $(el).data("house").toLowerCase();
            if(house.indexOf(value)>-1){
                $(el).show();
            }
            else if(value==""){
                $(el).show();
            }else $(el).hide();
        });
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
    $("#uTxtInput").off("input");
    $("#uTxtInput").on("input",event=>{
        let value = $("#uTxtInput").val().toLowerCase();
        $(".user").each((i,el)=>{
            let user = $(el).data("user").toLowerCase();
            if(user.indexOf(value)>-1){
                $(el).show();
            }
            else if(value==""){
                $(el).show();
            }else $(el).hide();
        });
    });
}

