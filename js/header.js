function loadHeader() {

    var isUserLoggedInLoad = checkCookie();
    setLoginButtonText(isUserLoggedInLoad);
    wireupHeaderButtons();
    setTimeout(function() {
        wireupSessionTimer();
    }, 2000);
}

function wireupSessionTimer() {
    // binds to document, 3 minutes
    //$.idleTimer(3 * 60 * 1000);

    $.idleTimer(15 * 1000);

    $(document).on("idle.idleTimer", function(event, elem, obj){
        var isUserLoggedIn = checkCookie();
            
        alert('idle!!!');

        if(isUserLoggedIn == true) {
            // function you want to fire when the user goes idle

            $('#alert-session').show();

            // 10 seconds timeout till we logout
            setTimeout(function () {
                var isIdle = $(document).idleTimer("isIdle");
                if(isIdle) {
                    // remove login cookie
                    removeLoginCookie();
    
                    // stop the timer, removes data, removes event bindings
                    // to come back from this you will need to instantiate again
                    // returns: jQuery
                    $(document).idleTimer("destroy");

                    window.location.href = "index.html";
                }
            }, 10 * 1000);
        }
    });

    $(document).on("active.idleTimer", function(event, elem, obj, triggerevent) {
        alert('reactivated');
        var isUserLoggedIn = checkCookie();

        if(isUserLoggedIn == false) {
            var isIdle = $(document).idleTimer("isIdle");
            $('#alert-session').hide();

            // function you want to fire when the user becomes active again
            // refresh login cookie
            refreshLoginCookie();

            // restore initial idle state, and restart the timer
            // returns: jQuery
            $(document).idleTimer("reset");
        }
    });
}

function refreshLoginCookie() {
    var isUserLoggedIn = checkCookie();
    var cookieValue = Cookies.getJSON('login');
    if(cookieValue && cookieValue.person) {
        setLoginCookie(cookieValue.person);
    }
}

function wireupHeaderButtons() {
     $(".promotion button").click(function() {
        var className = this.firstChild.data;
        window.location.href = "class.html?name=" + className;
    });

    $("#loginOK").click(function() {
        var isUserLoggedIn = checkCookie();
        if(isUserLoggedIn == true) {
            removeLoginCookie();
            isUserLoggedIn = checkCookie();
            setLoginButtonText(isUserLoggedIn);
        }
        else {
            var username = $("#username").val();
            var password = $("#password").val();
            var loginDetails = validateCredentials(username, password);

            if(loginDetails.IsLoginOk === true) {
                var in3Minutes30Seconds = 1/192;
                setLoginCookie(loginDetails);

                isUserLoggedIn = checkCookie();
                setLoginButtonText(isUserLoggedIn);
            } else {
                // todo: replace with label
                alert("invalid credentials");
            }
        }
    });
}

function removeLoginCookie() {
    Cookies.remove('login');
}

function setLoginCookie(loginDetails) {
    Cookies.set('login', { person: loginDetails.UserId + loginDetails.Class }, { expires: in3Minutes30Seconds });
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