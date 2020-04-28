var cli = new client();
var properties = [];
var map;
var mapItems = [];
function filterProps(filters,callback){
    var props = properties;
    props = props.filter(el=>{
        if(nlp(el["address"]).has(filters["address"]) || filters["address"].length==0){
            if(nlp(el["postCode"]).has(filters["postCode"]) || filters["postCode"].length==0){
                if(nlp(el["city"]).has(filters["city"]) || filters["city"].length==0){
                    if(el["beds"]==filters["beds"] || filters["beds"].length==0){
                        if(el["bathrooms"]==filters["bathrooms"] || filters["bathrooms"].length==0){
                            if(el["price"]>filters["pMin"] || filters["pMin"].length==0){
                                if(el["price"]<filters["pMax"] || filters["pMax"].length==0){
                                    if(el["status"]==$("#sType").val()){
                                        return el;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    callback(props);
}

function buildHtml(filters, toReturn){ 
    filterProps(filters,props=>{
        var str = "<div id='houses'>";
        props.forEach(el=>{
            str += `
                <div id="house${el.houseID}" class="house" data-id="${el.houseID}">
                <div class="imgCont">
                    <img src="images/houses/house${el.houseID}/${el.image}">
                    <div class="bbInfo">
                    <span class="beds">Beds: ${el.beds}</span> <span class="baths">Bathrooms: ${el.bathrooms}</span>
                    </div>
                </div>
                <div class="content">
                    <div class="title">${el.address}</div>
                    <div class="desc">
                        ${el.description}
                    </div>
                </div>
                </div>
            `;
        });
        str+="</div>";
        toReturn(str);
    });
}

function setupMap(props,callback){
    mapItems.forEach(el=>{
        el.remove();
    });
    let lat = props.reduce((a,b)=>a+parseFloat(b.lat),0) / props.length;
    let lon = props.reduce((a,b)=>a+parseFloat(b.lon),0) / props.length; //get average geocordinates
    callback({lat:lat,lon:lon});
}

function buildPropMap(filters){
    filterProps(filters,props=>{
        setupMap(props,d=>{
            map.setView([d.lat,d.lon],9);
            console.log(d);
            mapItems = [];
            props.forEach(el=>{
                let marker = L.marker([el.lat,el.lon]);
                marker.bindPopup("<b>"+el.address+"</b>");
                marker.on("click",e=>{
                    map.setView([el.lat,el.lon],14);
                });
                mapItems.push(marker);
                marker.addTo(map);
            });
        });
    });
}

cli.getProperties(result=>{
    if(result!=false){
        properties = result;
        console.log(properties);
    }
});

function initMap(){
    map = L.map("propMap").setView([0, 0], 1);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoicmZseW5uOTgiLCJhIjoiY2s4dWJsanE3MDR6NDNzcDg3dXVlN3h5eiJ9.EKc6CNR9DIEFipydF_hnfA'
    }).addTo(map);
}

function eventListerners(className,dataField){
    $(className).click(e=>{
        window.location.href = "/property?id="+e.currentTarget.dataset[dataField];
    });
}

function loadSiteData(){
    cli.getSiteData(result=>{
        $("#title").text(result.name);
    });
}

$(document).ready(()=>{
    loadSiteData();
    initMap();
    $("#sType").change(e=>{
        switch($("#sType").val()){
            case "rent":
                $("#minPrice").attr("placeholder","£/M Min");
                $("#maxPrice").attr("placeholder","£/M Max");
                break;
            case "buy":
                $("#minPrice").attr("placeholder","£ Min");
                $("#maxPrice").attr("placeholder","£ Max");
                break;
        }
    });
    $("#searchBtn").click(event=>{
        let filter = {
            address: $("#addrSrch").val(),
            postCode: $("#pcSrch").val(),
            city: $("#citySrch").val(),
            pMin: $("#minPrice").val(),
            pMax: $("#maxPrice").val(),
            beds: $("#bedNum").val(),
            bathrooms: $("#bathNum").val(),
        }
    
        if(Object.values(filter).some(el=>el.length !=0) == true){
            if(!$("#mapCheck").is(":checked")){
                buildHtml(filter,html=>{
                    $("#propMap").hide();
                    $("#properties").html(html);
                    eventListerners(".house","id");
                });
            }else{
                $("#properties").html("");
                $("#propMap").show();
                buildPropMap(filter);
            }
        }else{
            $("#properties").html("");
            $("#propMap").hide();
            alert("No filters entered");
        }

    });
});