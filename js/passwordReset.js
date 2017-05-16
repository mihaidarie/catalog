URI.prototype.getParameter = function(key) {
    var paramValue = this.query(true)[key];
    return paramValue;
};

function validateToken(token) {
    var postUrl = "/validateResetPasswordToken";
                    
    var jsonBody = JSON.stringify({ token: token } );

    $.ajax({
        url: postUrl,
        type: 'POST',
        data: jsonBody,
        contentType: 'application/json',
        success: function(result) {
            result = JSON.parse(result);
            if(result.success == false) {
                return false;
            } else {
                if(result.success && result.success == true) {
                    return true;
                } 
            }
        },
        error: function(jqXHR, textStatus, errorThrown ) {
            alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
        },
        complete: function() {
            console.log("completed!");
        },
        async: false
    });
}

$(document).ready(function() {
    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');
    
    var uri = URI(window.location.href);
    var token = uri.getParameter('token');

    if(token && token != '') {
        // validate token expiration

        var isTokenValid = validateToken(token);
        if(isTokenValid === true) {
            $('#performPasswordReset').show();
            $('#startPasswordReset').hide();

            $("#btnSave").click(function () {
                var password1 = $('#password1').val();
                var password2 = $('#password2').val();

                if(password1 != password2) {
                    $('#result').text('Parolele nu coincid, va rugam reintroduceti.');
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
                                setTimeout(function() {
                                    location.href = "PasswordReset.html";
                                }, 3000);
                            } else {
                                if(result.success && result.success == true) {
                                    $('#result').text('Parola salvata! Incercati sa va logati, dupa 3 secunde.');
                                    $('#password1').text('');
                                    $('#password2').text('');
                                    setTimeout(function() {
                                        location.href = "index.html";
                                    }, 3000)
                                } 
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown ) {
                            alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
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
                    } else {
                        if(result.isValid && result.isValid == true) {
                            $('#result').text('Verificati email-ul si urmati link-ul pt resetarea parolei. Link-ul este valid doar 1 minut!');
                        } 
                    }
                },
                error: function(jqXHR, textStatus, errorThrown ) {
                    alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                },
                complete: function() {
                    console.log("completed!");         
                }
            });
        });
    }

    
});