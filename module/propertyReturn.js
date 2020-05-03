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
    getID(callback){
        let sql = `SELECT houseID FROM houses WHERE address = "${house.ID}" `;
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
    removeHouse(callback){
        let sql = `DELETE FROM houses WHERE houseID="${this.ID}"`;
        this.connection.query(sql,(err,result)=>{
            if(err)callback({result:false}),console.log(err);
            else{
                callback({result:true});
            }
            this.endConnection();
        });
    }
    updateHouse(data,callback){
        let sql = `
            UPDATE houses
            SET description = "${data['Description']}", bathrooms = "${data['Bathrooms']}",
            beds = "${data['Beds']}", lat = "${data['Latitude']}", lon = "${data['Longitude']}",
            price = "${data['Price']}", status = "${data["Status"]}"
            WHERE houseID = ${this.ID} 
        `;
        this.connection.query(sql,(err,result)=>{
            if(err)callback({result:false}),console.log(err);
            else callback({result:true});
            this.endConnection();
        })
    }
}

module.exports = house;
