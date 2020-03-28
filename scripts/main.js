var socket = io("/admin");

function PdbDetails(template){
    console.log(template);
    $("#content").html(template);
}

socket.on("connectClient",response=>{
    switch(response.code){
        case 0:
            PdbDetails(response.template);
            break;
        case 1:
            break;
        case 2:
            break;
    }
});