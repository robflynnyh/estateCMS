class client{
    constructor(){
        this.socket =  io("/user");
        this.siteData=undefined;
    }
    getProperties(toReturn){ //returens property list
        this.socket.emit("sendProps");
        this.socket.off("props");
        this.socket.on("props",data=>{
            toReturn(data);
        });
    }
    getSiteData(callback){ //fetches siteInfo json file
        $.get("siteInfo",(data,success)=>{
            if(success)this.siteData=data,callback(this.siteData);
            else console.error(success);
        }).fail(e=>{
            console.error(e.status);
        });
    }
}