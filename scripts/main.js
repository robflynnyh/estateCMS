var socket = io("/admin");
var dbAccess;
var template;

function loadScripts(script){
    return new Promise(resolve=>{
        $.getScript(script,(data,textStatus,jqxhr)=>{
            if(jqxhr.status==200){
                resolve();
            }else console.error("SCRIPT ("+script+") NOT LOADING - "+textStatus);
        });
    });
}
function scriptsLoaded(scripts,callback){
    let scriptPromise = [];
    scripts.forEach(el=>{
        scriptPromise.push(loadScripts(el));
    });
    Promise.all(scriptPromise).then(()=>callback());
}

function pageSetup(data){
    template = data.template;
    var scripts = data.scripts;
    scriptsLoaded(scripts,()=>{
        $("#content").html(template);
    });
}

socket.on("connectClient",response=>{
    dbAccess = response.code;
    pageSetup(response);
});


function refreshPage(toAlert){
    if(toAlert){
        alert(toAlert);
    }
    $("#content").html(template);
}
socket.on("refresh",toAlert=>{
    refreshPage(toAlert);
});