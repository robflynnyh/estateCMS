var RUSERSETUP = {
    submitNewUser: ()=>{
        if(dbAccess==1){
            var username = $("#uName").val();
            var password = $("#pass").val(); //encrypt here?
            let data = {
                user: username,
                pass: password,
                permissions:"root"
            } 
            socket.emit("newUser",data);
        }
    }
}
