window.onload = () => {
    let cli = new client();
    cli.getSiteData(result=>{
        console.log(result);
        $("#title").text(result.name);  
        $("#homeText").text(result.homeText);
    });
    cli.getProperties(result=>{ 
        getImageList(result).then(hData=>addSlider(hData)); //creates a array of data for the slider
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
