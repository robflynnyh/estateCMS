class client{
    constructor(){
        this.socket =  io("/user");
    }
    getProperties(toReturn){
        this.socket.emit("sendProps");
        this.socket.off("props");
        this.socket.on("props",data=>{
            toReturn(data);
        });
    }
}