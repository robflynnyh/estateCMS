var hImagesManager = require("./hImageManager");
class page{
    constructor(html,data,callback){
        this.html = html;
        this.data = data;
        this.callback = callback;
        this.images = [];
        this.buildPage();
    }   
    buildPage(){
        var thishouse = new hImagesManager(this.data.houseID);
        thishouse.getImagesData(result=>{
            console.log(result);
            if(result.outcome){
                this.images = result.data;
                this.html = this.html.replace("//[IMAGELIST]//",JSON.stringify({images:this.images}));
                this.html = this.html.replace("//[IMGDIR]//","'images/houses/house"+this.data.houseID+"/'");
                this.callback(this.html);
            }else{
                this.html = this.html.replace("//[IMAGELIST]//","{images:[]}")
            }
        });
    }

}
module.exports = page;