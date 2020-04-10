var cli = new client();
var properties = [];



function buildHtml(filters, toReturn){
    var str = "<div id='houses'>";
    var props = properties;
    props = props.filter(el=>{
        if(nlp(el["address"]).has(filters["address"]) || filters["address"].length==0){
            if(nlp(el["postCode"]).has(filters["postCode"]) || filters["postCode"].length==0){
                if(nlp(el["city"]).has(filters["city"]) || filters["city"].length==0){
                    if(el["beds"]==filters["beds"] || filters["beds"].length==0){
                        if(el["bathrooms"]==filters["bathrooms"] || filters["bathrooms"].length==0){
                            return el;
                        }
                    }
                }
            }
        }
    });
    props.forEach(el=>{
        str += `
            <div id="house${el.houseID}" data-id="${el.houseID}">
            <div class="imgCont">
                <img src="images/houses/${el.houseID}">
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
}

cli.getProperties(result=>{
    if(result!=false){
        properties = result;
        console.log(properties);
    }
});

$(document).ready(()=>{
    $("#searchBtn").click(event=>{
        let filter = {
            address: $("#addrSrch").val(),
            postCode: $("#pcSrch").val(),
            city: $("#citySrch").val(),
            beds: $("#bedNum").val(),
            bathrooms: $("#bathNum").val(),
        }
    
        if(Object.values(filter).some(el=>el.length !=0) == true){
            buildHtml(filter,html=>{
                $("#properties").html(html);
            });
        }else{
            $("#properties").html("");
            alert("No filters entered");
        }

    });
});