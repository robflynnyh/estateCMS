var hImagesManager = require("./hImageManager");
class page{
    constructor(html,data,siteInfo,callback){
        this.html = html;
        this.data = data;
        this.callback = callback;
        this.images = [];
        this.buildPage();
        this.siteInfo = siteInfo;
    }   
    buildPage(){
        var thishouse = new hImagesManager(this.data.houseID);
        thishouse.getImagesData(result=>{
            console.log(result);
            if(result.outcome){
                this.images = result.data;
                let data = {
                    images:this.images,
                    dir: "images/houses/house"+this.data.houseID+"/",
                    address:this.data.address,
                    siteInfo:this.siteInfo
                };
                this.html = this.html.replace("//[DATA]//",JSON.stringify(data));
                this.callback(this.html);
            }else{
                let data = {
                    images:[],
                    dir: "images/houses/house"+this.data.houseID+"/",
                    address:this.data.address
                };
                this.html = this.html.replace("//[DATA]//",JSON.stringify(data));
            }
        });
    }

}
module.exports = page;