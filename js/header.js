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

    $.idleTimer(5 * 1000);

    $(document).on("idle.idleTimer", function(event, elem, obj){
        // function you want to fire when the user goes idle
        alert('idle!!!');


        // todo: show popup warning
        $( "#dialog-confirm" ).dialog({
            resizable: false,
            height: "auto",
            width: 400,
            modal: true,
            buttons: {
                "Da": function() {
                    $( this ).dialog( "close" );
                    // refresh cookie
                    // function you want to fire when the user becomes active again
                    // refresh login cookie
                    setLoginCookie();

                    // restore initial idle state, and restart the timer
                    // returns: jQuery
                    $( document ).idleTimer("reset");
                },
                "Nu": function() {
                    $( this ).dialog( "close" );
                    // remove login cookie
                    removeLoginCookie(); 
                    // stop the timer, removes data, removes event bindings
                    // to come back from this you will need to instantiate again
                    // returns: jQuery
                    $( document ).idleTimer("destroy");
                }
            }
        });


        // remove login cookie
        removeLoginCookie();

        // stop the timer, removes data, removes event bindings
        // to come back from this you will need to instantiate again
        // returns: jQuery
        $( document ).idleTimer("destroy");
    });

    $(document).on( "active.idleTimer", function(event, elem, obj, triggerevent){
        alert('reactivated');
       
        // function you want to fire when the user becomes active again
        // refresh login cookie
        setLoginCookie();

        // restore initial idle state, and restart the timer
        // returns: jQuery
        $( document ).idleTimer("reset");
    });

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
                setLoginCookie();

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

function setLoginCookie() {
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