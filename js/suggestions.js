
var iNumber;

function generateNumber() {
    return Math.floor(Math.random() * 10000);
}

$(document).ready(function() {
    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');
    $("#emailBody").elastic();
    
    generateCaptcha();

    $("#sendEmail").click(function () {
        if ($("#captchaInput").val() != iNumber) {
            $('#emailResult').text('Numar de verificare incorect!');
        }
        else {
            //alert("Correct Input!!!");
            sendMail();
        }  

        generateCaptcha();
    });
});

function sendMail() {
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    var email = $('#email').val();
    var subject = $('#subject').val();
    var emailBody = $('#emailBody').val();
    var postUrl = "/emailadmin?firstname=" + firstname + "&lastname=" + lastname +
        "&email=" + email + "&subject=" + subject + "&emailbody=" + emailBody;

    $.ajax({
        url: postUrl,
        type: 'POST',
        error: function(jqXHR, textStatus, errorThrown ) {
            //alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
            $('#emailResult').text('Trimitere esuata! Contactati administratorul.');
        },
        complete: function() {
            console.log("completed!");
        }
    });
    
    $('#emailResult').text('Trimitere cu succes!');
    $('#captchaInput').val('');
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