var LOGIN = {
    submitLogin:()=>{
        var username = $("#uName").val();
        var password = $("#pass").val();
        let data = {
            username:username,
            password:password        //encrypt here?
        }; 
        socket.emit("loginUser",data);
    }
}