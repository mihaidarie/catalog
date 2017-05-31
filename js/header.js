$(document).ready(function() {
    var isUserLoggedIn = checkCookie();
    if(isUserLoggedIn == true) {
        wireupSessionTimer();
    }
    setHeaderMargin();
});

function setHeaderMargin() {
    if(document.documentMode || /Edge/.test(navigator.userAgent)) {
        $('header').css('margin-bottom', '6%');
    }
}

var sessionTimerIdleTimeMinutes = 10;
var cookieExpirationTimespanMinutes = 60;

function wireupSessionTimer() {
    // binds timer to document, 3 minutes

    $.idleTimer(
        {
            timeout: sessionTimerIdleTimeMinutes * 60 * 1000,
        });

    $(document).on("idle.idleTimer", function(event, elem, obj){
        var isUserLoggedIn = checkCookie();

        if(isUserLoggedIn == true) {
            // function you want to fire when the user goes idle

            $('#alert-session').show();
            console.log('User detected as idle');

            // $('html, body').animate({
            //     scrollTop: $("body").offset().top
            // }, 1000);

            // 10 seconds timeout till we logout
            setTimeout(function () {
                
                console.log('Verifying if user became active');
                var isIdle = $.idleTimer("isIdle");
                if(isIdle) {
                    console.log('Still inactive, logging out...');

                    // stop the timer, removes data, removes event bindings
                    // to come back from this you will need to instantiate again
                    // returns: jQuery
                    $.idleTimer("destroy");

                    // remove login cookie
                    logout(true);
                } else {
                    console.log('User became active');
                    refreshLoginCookie();
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
        } else {
            console.log('User still active');
            refreshLoginCookie();
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
    console.log('refreshing cookie if exists');
    if(cookieValue && cookieValue.UserId) {
        setLoginCookie(cookieValue);
    }
}

function logout(shouldRedirect) {
    removeLoginCookie();
    if(shouldRedirect == true) {
        console.log('Redirecting to homepage');
        window.location.href = "index.html";
    }
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
            logout(true);
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

                var currentUrl = window.location.href;
                if(currentUrl.toLowerCase().indexOf("passwordreset.html") >= 0) {
                    currentUrl = "Index.html";
                }

                window.location.href = currentUrl;
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
    console.log('Removed login cookie');
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
    var cookieExpirationMinutes = new Date(new Date().getTime() + cookieExpirationTimespanMinutes * 60 * 1000);
    Cookies.set(
        'login', 
        { 
            UserId: loginDetails.UserId, 
            Class: loginDetails.Class 
        }, 
        { 
            expires: cookieExpirationMinutes 
        });
    console.log('login cookie was set');
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