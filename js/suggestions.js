
var iNumber;

function generateNumber() {
    return Math.floor(Math.random() * 10000);
}

$(document).ready(function() {
    $("header").load('Header.html', loadHeader);
    $("footer").load('Footer.html');
    $("#emailBody").elastic();
    
    generateCaptcha();
    
    if(document.documentMode || /Edge/.test(navigator.userAgent)) {
        $('#emailBody').css('width', '15em');
    }

    $("#sendEmail").click(function () {
        if ($("#captchaInput").val() != iNumber) {
            $('#emailResult').text('Numar de verificare incorect!');
        }
        else {
            setCaptchaValidCookie();
            sendMail();
        }  

        generateCaptcha();
    });
});

function setCaptchaValidCookie() {
    var in1Minute = 1;
    Cookies.set('suggestionsCaptcha', { IsValid: true }, { expires: new Date(new Date().getTime() + in1Minute * 60 * 1000); });
}

function sendMail() {
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    var email = $('#email').val();
    var subject = $('#subject').val();
    var emailBody = $('#emailBody').val();
    var postUrl = "/emailadmin?firstname=" + firstname + "&lastname=" + lastname +
        "&email=" + email + "&subject=" + subject;
    
    var jsonBody = JSON.stringify({ emailBody: emailBody } );

    $.ajax({
        url: postUrl,
        type: 'POST',
        data: jsonBody,
        contentType: 'application/json',
        error: function(jqXHR, textStatus, errorThrown ) {
            console.log('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
            $('#emailResult').text('Trimitere esuata! Contactati administratorul.');
            $('#emailResult').css('color', 'red');
        },
        complete: function() {
            $('#emailResult').text('Mesaj expediat!');
            $('#emailResult').css('color', 'green');
        }
    });

    $('#captchaInput').val('');
    setTimeout(function() {
        window.location.href = window.location.href;
    }, 5000);
}

function generateCaptcha() {
    iNumber = generateNumber();
    $("#sendEmail").prop("disabled", true);
    $("#divGenerateRandomValues").html("<input id='txtNewInput'></input>");            
    $("#divGenerateRandomValues").css({ "background-image": 'url(../images/captcha.png)', 'width': '100px', 'height': '50px' });  
    $("#txtNewInput").css({ 'background': 'transparent', 'font-family': 'Arial', 'font-style': 'bold', 'font-size': '40px' });
    $("#txtNewInput").css({ 'width': '100px', 'border': 'none', 'color': 'black' });
    $("#txtNewInput").val(iNumber);
    $("#txtNewInput").prop('disabled', true);

    Cookies.set('suggestionsCaptcha', { IsValid: false }, { expires: new Date(Date.now()) });

    var wrongInput = function () {  
        if ($("#captchaInput").val() != iNumber) {  
            return true;
        }  
        else {  
            return false;
        }  
    };

    $("#captchaInput").bind('input', function () {                  
        $("#sendEmail").prop('disabled', wrongInput);  
    });  
}