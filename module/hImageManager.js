const fs = require("fs");
const path = require("path");
class imageManager{
    constructor(id,writeFromBuffer){
        this.id = id;
        this.propPath = path.join(__dirname,"/../images/houses/house"+id);
        this.images = [];
        if(writeFromBuffer)this.writeFromBuffer = writeFromBuffer;
    }
    init(){
        if(fs.existsSync(this.propPath)){
            this.removeDir(this.propPath);
        }
    }
    getImagesData(callback){
        fs.readFile(this.propPath+"/images.json",(err,data)=>{
            if(err)callback({outcome:false}),console.log("Error reading json "),console.error(err);
            else{
                this.images = JSON.parse(data).images;
                callback({outcome:true,data:this.images});
            }
        });
    }
    removeDir(dir){
        var files = fs.readdirSync(dir);
        if(files.length>0){
            files.forEach(el=>{
                if(fs.statSync(dir+"/"+el).isDirectory()){
                    this.removeDir(dir+"/"+el);
                }else{
                    fs.unlinkSync(dir+"/"+el);
                }
            });
            fs.rmdirSync(dir);
        }else{
            fs.rmdirSync(dir)
        };
    }
    newProperty(callback){
        if(fs.existsSync(this.propPath)){
            callback({outcome:false,reason:"propertyExists"})
        }else{
            fs.mkdirSync(this.propPath);
            let json = {
                images: []
            }
            fs.writeFile(this.propPath+"/images.json", JSON.stringify(json),"utf8",err=>{
                if(err)callback({outcome:false,reason:"errorWritingJSON"});
                else{
                    callback({outcome:true});
                }
            });
        }
    }
    addImage(image,callback){
        fs.readFile(this.propPath+"/images.json",(err,data)=>{
            if(err)callback({outcome:false,reason:"errorReadingJSON"});
            else{
                this.images = JSON.parse(data).images;
                var thisImage = "image-"+this.images.length;
                this.writeFromBuffer(this.propPath+"/"+thisImage,image,error=>{
                    if(error)callback({outcome:false,reason:"errorSavingImage"});
                    else{
                        this.images.push(thisImage);
                        fs.writeFile(this.propPath+"/images.json", JSON.stringify({images:this.images}),"utf8",err=>{
                            if(err)callback({outcome:false,reason:"errorWritingJSON"});
                            else{
                                callback({outcome:true});
                            }
                        });
                    }
                });
            }
        });
    }
}

module.exports = imageManager;