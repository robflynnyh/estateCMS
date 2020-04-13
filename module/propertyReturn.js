class house{
    constructor(connection,propertyID){
        this.connection = connection;
        this.ID = propertyID;
    }
    endConnection(){
        this.connection.end();
    }
    getData(callback){
        let sql="SELECT * FROM houses WHERE houseID='"+this.ID+"'";
        this.connection.query(sql,(err,result)=>{
            if(err)console.error(err),callback({result:false});
            else{
                if(result.length==0)callback({result:false});
                else{
                    callback({result:true,data:result});
                }
            }
        });
    }
}

module.exports = house;
