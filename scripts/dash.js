function docReady(){
    var dash = new dashboard(0);
    dash.getPermissions(perm=>{
        if(perm!="root")dash.setView(2);
        $(".mItem").each((i,el)=>{
            if(perm!="root"&&i!=2)$(el).hide();
            $(el).click(event=>{
                dash.setView(i);
            });
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
    }).fail(e=>{
        callback({outcome:e.status});
    });
}

function getHouseImageList(id,dash,callback){
    $.get("images/houses/house"+id+"/images.json",(data,success)=>{
        callback({data:data,outcome:success});
    }).fail(e=>{
        dash.newHouseImg(id,result=>{
            if(result.outcome){
                getHouseImageList(id,dash,callback);
            }else console.error("Error creating folder");
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
        let beds = $("#beds").val();
        let baths = $("#bathrooms").val();
        let price = $("#price").val();
        let status = $("#propStatus").val();
        var newHouse = {
            address: addr,
            postCode: pcode,
            city: city,
            description:hDesc,
            bedrooms:beds,
            bathrooms:baths,
            image: currentFile,
            price: price,
            status: status
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
            console.log(house);
            getHouseImageList(house.houseID,dash,result=>{
                var popupOptions = {
                    info: [ //info fields
                        {Fname:"House ID",Fdata:house.houseID},
                        {Fname:"House Address",Fdata:house.address},
                        {Fname:"Post Code",Fdata:house.postCode},
                        {Fname:"City",Fdata:house.city}
                    ],
                    editable: [ //editable textbox fields
                        {Fname:"Description",Fdata:house.description,rows:3},
                    ],
                    numFields: [   //number Input Fields
                        {Fname:"Bathrooms",Fdata:house.bathrooms},
                        {Fname:"Beds",Fdata:house.beds},
                        {Fname:"Latitude",Fdata:house.lat},
                        {Fname:"Longitude",Fdata:house.lon},
                        {Fname:"Price",Fdata:house.price,placeholder:"£"}
                    ],
                    dropDown: [   //dropDown fields [[Option Value],[Option Display name]]
                        {Fname:"Status",Fdata:house.status,options:[[["rent"],["Rent"]],[["buy"],["Buy"]],[["sold"],["Sold"]]]}
                    ],
                    imgPath: "images/houses/house"+house.houseID+"/",
                    imgList: result,
                    ID: house.houseID,
                    socketDelete: "deleteHouse",
                    socketUpdate: "updateHouse",
                    dash: dash
                };
                var housePopup = new popupBox(popupOptions);
                housePopup.createPopup();
            });
        });
    });



    $("#propStatus").change(e=>{
        let pStat = $("#propStatus").val();
        switch(pStat){
            case "rent":
                $("#propPriceText").text("Price: (£PCM)");
                break;
            case "buy":
                $("#propPriceText").text("Price: (£)");
                break;
        }
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
        var sName = $("#siteName").val();
        var sDesc = $("#siteDesc").val();
        if(currentFile){
            fileReader.onload = e =>{
                let siteLogo = e.target.result;
                dash.newSiteInfo({image:siteLogo,name:sName,description:sDesc},result=>{
                    if(result){
                        siteInfo.name = sName;
                        siteInfo.description = sDesc;
                        dash.setView(0);
                    }else{
                        alert("Error updating site info");
                        dash.setView(0);
                    }
                });
                //console.log(e.target.result);

            }
            fileReader.readAsArrayBuffer(currentFile);
        }else{
            dash.newSiteInfo({image:false,name:sName,description:sDesc},result=>{
                if(result){
                    siteInfo.name = sName;
                    siteInfo.description = sDesc;
                    dash.setView(0);
                }else{
                    alert("Error updating site info");
                    dash.setView(0);
                }
            });
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
    $(".user").each((i,el)=>{
        $(el).off("click");
        $(el).click(event=>{
            var user = $(el).data("user");
       
            
            var popupOptions = {
                info: [ //info fields
                    {Fname:"Username",Fdata:user},
                ],
                passField: [ //info fields
                    {Fname:"Password",Fdata:""},
                ],
                imgList:false,
                imgPath:false,
                ID: user,
                socketDelete: "deleteHouse",
                socketUpdate: "updateHouse",
                dash: dash
            };
            var userPopup = new popupBox(popupOptions);
            userPopup.createPopup();
        });
    
    });
}
function destroyPopup(){
    $("#popup").html("");
    $("#popup").css("top","1px");
    $("#popup").hide();
    $("#overlay").hide();   
}

function cPage(html,dash){
    $(".main").html(html);
    $("#homeTxt").val(siteInfo.homeText);
    $("#submitDesc").click(e=>{
        dash.newSiteInfo({image:false,name:siteInfo.name,description:siteInfo.description,homeText:$("#homeTxt").val()},result=>{
            $("#popup").show();
            $("#overlay").show();
            $("#popup").css("top","100px");
            if(result){
                siteInfo.homeText=$("#homeTxt").val();
                $("#popup").html("<div style='text-align:center'>Request Succesful</div>");
                dash.setView(3);
            }else{
                $("#popup").html("<div style='text-align:center'>Request Unsuccesful</div>");
                dash.setView(3);
            }
            setTimeout(()=>destroyPopup(),2000);   
        });
    });
    $("#siteBackground").change(e=>{
        currentFile = e.target.files[0];
        var fileReader = new FileReader();
        fileReader.onload = e =>{
            let siteBackground = e.target.result;
            dash.changeSiteBackground(siteBackground,result=>{
                $("#popup").show();
                $("#overlay").show();
                $("#popup").css("top","100px");
                if(result){
                    $("#popup").html("<div style='text-align:center'>Request Succesful</div>");
                }else{
                    $("#popup").html("<div style='text-align:center'>Request Unsuccesful</div>");
                }
                setTimeout(()=>destroyPopup(),2000);   
            });
        }
        fileReader.readAsArrayBuffer(currentFile);
    });
}
