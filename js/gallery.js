$(document).ready(function() {
    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    $('#freeLinks').elastic();

    loadLinks();
    loadPhotos();

    var isAdminUserLoggedIn = isAdminLoggedIn();

    if(isAdminUserLoggedIn == true) {
        $('#photoButtons').show();

        $('#uploadPhoto').click(function() {
            var isAdminUserLoggedIn = isAdminLoggedIn();
            if(isAdminUserLoggedIn == true) {
                var redirectUrl = "FileUpload.html?type=gallery";
                window.location.href = redirectUrl;
            }
        });
        
        $('#removePhoto').click(function() {
            var isAdminUserLoggedIn = isAdminLoggedIn();
            if(isAdminUserLoggedIn == true) {
                var imageName = $('ul.pxs_thumbnails li.selected img').attr('src').split('/').pop();

                $.post("/removephoto?photoName=" + imageName, function() {
                    window.location.href = window.location.href;
                });
            }
        });
    } else {
        $('#photoButtons').hide();
    }
});

function loadLinks() {
    $.getJSON("/getLinks", function(data) {
        $('#freeLinks').val(data.AllLinks);

        var isAdminUserLoggedIn = isAdminLoggedIn();
        if(isAdminUserLoggedIn == true) {
            $('#freeLinks').removeAttr('readonly');
            $('#btnSaveLinks').show();

            
            $('#galleryLinks button').click(function() {
                var isAdminUserLoggedIn = isAdminLoggedIn();
                if(isAdminUserLoggedIn == true) {
                    var linksValue = $('#freeLinks').val();

                    var data = { AllLinks : linksValue };
                    $.ajax({
                        type: "POST",
                        url: "/saveLinks",
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function(r) {
                            loadLinks();
                        }
                    });
                }
            });
        } else {
            $('#freeLinks').attr('readonly', 'readonly');
            $('#btnSaveLinks').hide();
        }
    });
}

function loadPhotos() {
    // get current photos paths from server

    $.getJSON("/gallery", function(data) {
        
        var thumbnailsArray = [];
        $.each( data, function(key, val) {
            thumbnailsArray.push('<li><img src="' + val + '" alt="" /><</li>');
        });
        
        var items = [];
        $.each( data, function(key, val) {
            items.push('<li><a data-lightbox="roadtrip" href="' + val + '"><img src="' + val + '" alt="" /></a><</li>');
        });
        
        var images = items.join( "" );
        $('<ul />', {
            "class": "pxs_slider",
            "id": "pxs_thumbnails",
            html: images
        }).appendTo( "#allPhotos" );

        $('<div class="pxs_navigation"><span class="pxs_next"></span><span class="pxs_prev"></span></div>')
        .appendTo( "#allPhotos" );

        var thumbnails = thumbnailsArray.join("");
        $('<ul />', {
            "class": "pxs_thumbnails",
            html: thumbnails
        }).appendTo( "#allPhotos" );
        
        loadPhotosSlider();
    });
    
}