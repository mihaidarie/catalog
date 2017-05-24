
var in3Minutes30Seconds = 1/192;

$(document).ready(function() {
    var isUserLoggedIn = checkCookie();
    if(isUserLoggedIn == true) {
        wireupSessionTimer();
    }
});

function wireupSessionTimer() {
    // binds timer to document, 3 minutes

    $.idleTimer(
        {
            timeout: 3 * 60 * 1000,
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

function logout() {
    removeLoginCookie();
    isUserLoggedIn = checkCookie();
    setLoginButtonText(isUserLoggedIn);
}

function wireupHeaderButtons() {
     $(".promotion button").click(function() {
        var className = this.firstChild.data;
        window.location.href = "class.html?name=" + className;
    });

    $('#loginReset').click(function() {
        logout();
        location.href = "PasswordReset.html";
    });

    $("#loginOK").click(function() {
        var isUserLoggedIn = checkCookie();
        if(isUserLoggedIn == true) {
            logout();
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
                alert("User inexistent sau parola incorecta! Folositi butonul Reset pt a seta o parola noua, in caz ca ati uitat-o.");
            }
        }
    });
}

function resetResultMessage() {
    setTimeout(function() {
        $('#result').text('');
    }, 5000);
}

function removeLoginCookie() {
    Cookies.remove('login');
    logout();
}

function scrollToResult() {
    var scrollTo = $('#result');
    var scrollTopPosition = scrollTo.position().top;
    $('html, body').animate({
        scrollTop: scrollTopPosition },
        2000
    );
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

function isAdminLoggedIn() {
    var isUserLoggedIn = checkCookie();

    if(isUserLoggedIn == false) {
        return false;
    }

    var cookieValue = Cookies.getJSON('login');
    var loggedInUserId = cookieValue.UserId;

    var isAdmin = false;

    $.ajax({
        type: 'POST',
        url: '/isAdmin',
        dataType: 'json',
        success: function(data) {
            isAdmin = data.IsAdmin;
         },
        data: { userId : loggedInUserId },
        async: false
    });

    return isAdmin;
}