$(document).ready(function() {
    console.log( "ready!" );
    alert("ready");
    $(".loginOK").click(function() {
        var username = $("#username").val();
        var password = $("#password").val();
        var isLoginOk = performLogin(username, password);
        if(isLoginOk === true) {
             alert("go!");
        } else {
            alert("invalid");
        }


    });
});

function performLogin(username, password){
    if(username == "mihai" && password == "mihai") {
        return true;
    }

    return false;
}