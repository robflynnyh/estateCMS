const fs = require("fs");
const path = require("path");

class userLogs{
    constructor(user,action){
        this.user = user;
        this.action = action;
        this.date = new Date().toDateString().split(" ").join("_");
        this.logs=[];
        this.propPath = path.join(__dirname,"/../Logs/"+this.date+".json");
    }
    check(done){
        fs.readFile(this.propPath,(er,Data)=>{
            if(er){
                done();
            }
            else{
                var data = JSON.parse(Data);
                this.logs=data;
                done();
            }
        });
    }
    add(){
        this.check(()=>{
            var newLog = {
                user:this.user,
                action:this.action,
                time: new Date()
            }
            this.logs.push(newLog);
            fs.writeFile(this.propPath,JSON.stringify(this.logs),"utf8",err=>{
                if(err)console.error("Unable to save to logs");
                else{
                    console.log("Saved to logs:");
                    console.log(newLog);
                }
            })
        });
    }
}
module.exports = userLogs;