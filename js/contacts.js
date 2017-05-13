$(document).ready(function() {
    $("header").load('header.html', renderControls);
    $("footer").load('footer.html');

    renderControls();
});

function renderControls() {
    loadHeader();

    loadContacts();

    var isAdminUserLoggedIn = isAdminLoggedIn();
    if(isAdminUserLoggedIn == true) {
        $('#btnSave').show();
        $('.contacts input').removeAttr('readonly');

        $('#btnSave').click(function() {
                var postedContacts = {
                    "PhoneRomania" : $('#phoneNumberRO').val(),
                    "EmailRomania" : $('#emailRO').val(),
                    "PhoneEngland" : $('#phoneNumberEN').val(),
                    "EmailEngland" : $('#emailEN').val()
                };
                
                var postedData = JSON.stringify(postedContacts);

                var postUrl = "/saveContacts";
                $.ajax({
                    url: postUrl,
                    type: 'POST',
                    data: postedData,
                    contentType: 'application/json',
                    error: function(jqXHR, textStatus, errorThrown ) {
                        alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                        //$('#emailResult').text('Trimitere esuata! Contactati administratorul.');
                    },
                    success: function() {
                        console.log("success!");         
                    },
                    complete: function() {
                        console.log("completed!");         
                    }
                });
        });
    } else {
        $('#btnSave').hide();
        $('.contacts input').attr('readonly', 'readonly');
    }
}

function loadContacts() {
    var contactsFileName = "database/contacts/contacts.json";
    $.getJSON(contactsFileName, function( data ) {
        $('#phoneNumberRO').val(data.PhoneRomania);
        $('#emailRO').val(data.EmailRomania);
        $('#phoneNumberEN').val(data.PhoneEngland);
        $('#emailEN').val(data.EmailEngland);
    });
}