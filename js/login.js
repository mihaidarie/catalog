$(document).ready(function() {
    console.log( "ready!" );
    $("#loginOK").click(function() {
        var username = $("#username").val();
        var password = $("#password").val();
        var isLoginOk = validateCredentials(username, password);
        if(isLoginOk === true) {
             alert("go!");
             // todo: set session or move this validate to the profile page
        } else {
            alert("invalid");
        }
    });
});