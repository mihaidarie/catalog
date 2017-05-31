URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

function kickoffTokenValidationTimer() {
    setInterval(function() {
        var uri = URI(window.location.href);
        var token = uri.getParameter('token');
        var isTokenValid = validateToken(token);
        
        if(isTokenValid == false) {
            location.href = "Index.html";
        }
    }, 30 * 1000);
}

function validateToken(token) {
    var postUrl = "/validateResetPasswordToken";
    var isTokenValid = false;        
    var jsonBody = JSON.stringify({ token: token } );

    $.ajax({
        url: postUrl,
        type: 'POST',
        data: jsonBody,
        contentType: 'application/json',
        success: function(result) {
            result = JSON.parse(result);
            if(result.success == false) {
                isTokenValid = false;
            } else {
                if(result.success && result.success == true) {
                    isTokenValid = true;
                } else {
                    isTokenValid = false;
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown ) {
            console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
            isTokenValid = false;
        },
        complete: function() {
            console.log("completed!");
        },
        async: false
    });

    return isTokenValid;
}

$(document).ready(function() {
    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');
    logout();
    
    var uri = URI(window.location.href);
    var token = uri.getParameter('token');

    if(token && token != '') {
        // validate token expiration

        var isTokenValid = validateToken(token);
        if(isTokenValid === true) {
            $('#performPasswordReset').show();
            $('#startPasswordReset').hide();

            kickoffTokenValidationTimer();

            $("#btnSave").click(function () {
                var password1 = $('#password1').val();
                var password2 = $('#password2').val();

                if(password1 != password2) {
                    $('#result').text('Parolele nu coincid, va rugam reintroduceti.');
                    $('#result').css('color', 'red');
                    scrollToResult();
                } else {
                    // has token, try to reset

                    var postUrl = "/resetPassword";
                    
                    var jsonBody = JSON.stringify({ token: token, newPassword: password1 } );

                    $.ajax({
                        url: postUrl,
                        type: 'POST',
                        data: jsonBody,
                        contentType: 'application/json',
                        success: function(result) {
                            result = JSON.parse(result);
                            if(result.success == false) {
                                $('#result').text(result.message);
                                $('#result').css('color', 'red');
                                scrollToResult();
                                if(result.message.indexOf('Token-ul a expirat') > -1) {
                                    setTimeout(function() {
                                        location.href = "PasswordReset.html";
                                    }, 10 * 1000);
                                }
                            } else {
                                if(result.success && result.success == true) {
                                    $('#result').text('Parola salvata! Incercati sa va logati, dupa 5 secunde.');
                                    $('#result').css('color', 'green');
                                    $('#password1').text('');
                                    $('#password2').text('');
                                    scrollToResult();
                                    setTimeout(function() {
                                        location.href = "index.html";
                                    }, 5 * 1000);
                                } 
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown ) {
                            console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                            $('#result').text('Salvare esuata! Contactati administratorul.');
                            $('#result').css('color', 'red');
                            scrollToResult();
                        },
                        complete: function() {
                            console.log("completed!");
                        }
                    });
                }
            });
        } else {
            location.href = "index.html";
        }
        
    } else {
        // don't have token, start reset process

        $('#performPasswordReset').hide();
        $('#startPasswordReset').show();

        $("#btnReset").click(function () {
            var email = $('#email').val();
            var className= $('#className').val();

            var postUrl = "/sendResetPassword";
            
            var jsonBody = JSON.stringify({ email: email, className: className } );

            $.ajax({
                url: postUrl,
                type: 'POST',
                data: jsonBody,
                contentType: 'application/json',
                success: function(result) {
                    result = JSON.parse(result);
                    if(result.isValid == false) {
                        $('#result').text(result.message);
                        $('#result').css('color', 'red');
                        scrollToResult();
                    } else {
                        if(result.isValid && result.isValid == true) {
                            $('#result').text('Verificati email-ul si urmati link-ul pt resetarea parolei. Link-ul este valid doar 5 minute!');
                            $('#result').css('color', 'green');
                            scrollToResult();
                        } 
                    }
                },
                error: function(jqXHR, textStatus, errorThrown ) {
                    console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                    $('#result').text('Trimitere esuata! Contactati administratorul.');
                    $('#result').css('color', 'red');
                    scrollToResult();
                },
                complete: function() {
                    console.log("completed!");
                }
            });
        });
    }    
});