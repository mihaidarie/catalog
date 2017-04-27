function loadHeader() {

    var isUserLoggedInLoad = checkCookie();
    setLoginButtonText(isUserLoggedInLoad);
    wireupHeaderButtons();

    $("#loginOK").click(function() {

        var isUserLoggedIn = checkCookie();
        if(isUserLoggedIn == true) {
            Cookies.remove('login');
            isUserLoggedIn = checkCookie();
            setLoginButtonText(isUserLoggedIn);
        }
        else {
            var username = $("#username").val();
            var password = $("#password").val();
            var loginDetails = validateCredentials(username, password);

            if(loginDetails.IsLoginOk === true) {
                var in30Minutes = 1/48;
                Cookies.set('login', { person: loginDetails.UserId + loginDetails.Class }, { expires: in30Minutes });

                // todo: make automatic logout mechanism + automatic cookie lifetime extension

                isUserLoggedIn = checkCookie();
                setLoginButtonText(isUserLoggedIn);
            } else {
                // todo: replace with label
                alert("invalid credentials");
            }
        }
    });
}

function wireupHeaderButtons() {
     $(".promotion button").click(function() {
        var className = this.firstChild.data;
        window.location.href = "class.html?name=" + className;
    });
}

function setLoginButtonText(isUserLoggedIn) {
    if(isUserLoggedIn == true) {
        $("#loginOK").text('Iesire');
        $("#credentialsInput").css('visibility', 'hidden');
    } 
    else {
        $("#loginOK").text('OK');
        $("#credentialsInput").css('visibility', 'visible');
    }
}

function checkCookie() {
    var cookieValue = Cookies.getJSON('login');

    if(cookieValue && cookieValue.person) {
        return true;
    }

    return false;
}