var DBSETUP = {
    submitDB: ()=>{
        if(dbAccess==0){
            var hName = $("#hName").val();
            var uName = $("#uName").val();
            var pass = $("#pass").val();
            var port = $("#port").val();
            var dbName = $("#dbName").val();
            var DBdata = {
                hName:hName,
                uName:uName,
                pass:pass,
                port:port,
                dbName:dbName
            }
            $("#sButton").attr("disabled","true");
            socket.emit("setupDB",DBdata);
        }
    }
}