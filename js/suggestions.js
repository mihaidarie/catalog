$(document).ready(function() {
    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    $('#sendEmail').click(function() {
        // todo: make some captcha

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
    });
});