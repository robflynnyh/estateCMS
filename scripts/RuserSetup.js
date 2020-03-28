var RUSERSETUP = {
    submitNewUser: ()=>{
        if(dbAccess==1){
            var username = $("#uName").val();
            var password = $("#pass").val();
            let data = [username,password,"root"]; //encrypt here?
            socket.emit("newUser",data);
        }
    }
}
