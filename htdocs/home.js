var contactToggle = false;
window.onload = () => {
    let cli = new client();
    cli.getSiteData(result=>{
        console.log(result);
        $("#title").text(result.name);  
        $("#homeText").text(result.homeText);
        contactBtn(result);
    });
    cli.getProperties(result=>{ 
        getImageList(result).then(hData=>addSlider(hData)); //creates a array of data for the slider
    });
}
function contactBtn(siteData){
    if(siteData.num == undefined && siteData.email == undefined)$("#contactButton").hide();
    let num ="";
    let email ="";
    if(siteData.num!=undefined)num="<b>Phone Number:</b> "+siteData.num;
    if(siteData.email!=undefined)email="<b>Email: </b>"+siteData.email;
    $("#contactButton").click(e=>{
        switch(contactToggle){
            case false:
                let html = `
                <span>Contact Details</span>
                <hr />
                <div id="cDetails">
                <div>${num}</div>
                <div>${email}</div>
                </div>
                `;
                $("#contactButton").html(html);
                $("#contactButton").animate({bottom:"0px",height:"200px"}, "medium");
                contactToggle=true;
                break;
            case true:
                $("#contactButton").html("<span>Contact Details</span>");
                $("#contactButton").animate({bottom:"0px",height:"20px"}, "medium");
                contactToggle=false;
                break;
        }
    });
}
function addSlider(data){
    if(data.images.length!=0){
        var dir = data.dir;
        var images = data.images;
        var addresses = data.address;
        var cities = data.city;
    
        var imgI = 0;
        $("#slideIMG").attr("src",dir[imgI]+images[imgI]);
        $("#hAddress").text(addresses[imgI]+" - "+cities[imgI]);
        document.getElementById("rSlide").addEventListener("click",()=>{
            if(imgI<images.length-1){
                imgI++;
            }
            $("#slideIMG").attr("src",dir[imgI]+images[imgI]);
            $("#hAddress").text(addresses[imgI]+" - "+cities[imgI]);
        });
        document.getElementById("lSlide").addEventListener("click",()=>{
            if(imgI!=0){
                imgI--;
            }
            $("#slideIMG").attr("src",dir[imgI]+images[imgI]);
            $("#hAddress").text(addresses[imgI]+" - "+cities[imgI]);
        });
        $("#houseSlider").show();
    }   
}

function getImageList(h){
    return new Promise(resolve=>{
        var houses = h;
        var obj = {
            images: [],
            dir: [],
            address: [],
            city: []
        }
        houses.forEach(el=>{
            let houseDir = "/images/houses/house"+el.houseID+"/";
            obj.dir.push(houseDir);
            obj.images.push(el.image);
            obj.address.push(el.address);
            obj.city.push(el.city);
        });
        resolve(obj);
    });
}
