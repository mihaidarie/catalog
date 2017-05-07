
var in3Minutes30Seconds = 1/192;

$(document).ready(function() {
    var isUserLoggedIn = checkCookie();
    if(isUserLoggedIn == true) {
        wireupSessionTimer();
    }

    $('#loginReset').click(function() {
        alert('reset login');

        // todo: generate new password and send via email
    });
});

function wireupSessionTimer() {
    // binds timer to document, 3 minutes

    $.idleTimer(
        {
            timeout: 10 * 1000,
        });

    $(document).on("idle.idleTimer", function(event, elem, obj){
        var isUserLoggedIn = checkCookie();

        if(isUserLoggedIn == true) {
            // function you want to fire when the user goes idle

            $('#alert-session').show();
            
            // $('html, body').animate({
            //     scrollTop: $("body").offset().top
            // }, 1000);

            // 10 seconds timeout till we logout
            setTimeout(function () {
                
                var isIdle = $.idleTimer("isIdle");
                if(isIdle) {

                    // remove login cookie
                    removeLoginCookie();
    
                    // stop the timer, removes data, removes event bindings
                    // to come back from this you will need to instantiate again
                    // returns: jQuery
                    $.idleTimer("destroy");

                    window.location.href = "index.html";
                }
            }, 8 * 1000);
        }
    });

    $(document).on("active.idleTimer", function(event, elem, obj, triggerevent) {
        var isIdle = $.idleTimer("isIdle");
        if(isIdle == false) {
            $('#alert-session').hide();

            // function you want to fire when the user becomes active again
            // refresh login cookie
            refreshLoginCookie();
            
            // restore initial idle state, and restart the timer
            // returns: jQuery
            $.idleTimer("reset");
            
            // starts timer with remaining time
            // returns: jQuery
            $(document).idleTimer("resume");
        }
    });
}

function loadHeader() {

    var isUserLoggedInLoad = checkCookie();
    setLoginButtonText(isUserLoggedInLoad);
    wireupHeaderButtons();
}

function refreshLoginCookie() {
    var isUserLoggedIn = checkCookie();
    var cookieValue = Cookies.getJSON('login');
    if(cookieValue && cookieValue.UserId) {
        setLoginCookie(cookieValue);
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
            window.location.href = "index.html";
        }
        else {
            var username = $("#username").val();
            var password = $("#password").val();
            var loginDetails = validateCredentials(username, password);

            if(loginDetails.IsLoginOk === true) {
                setLoginCookie(loginDetails);

                isUserLoggedIn = checkCookie();
                setLoginButtonText(isUserLoggedIn);
                wireupSessionTimer();
                window.location.href = window.location.href;
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
    Cookies.set('login', { UserId: loginDetails.UserId, Class: loginDetails.Class }, { expires: in3Minutes30Seconds });
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

    if(cookieValue && cookieValue.UserId) {
        return true;
    }

    return false;
}