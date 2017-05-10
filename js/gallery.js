$(document).ready(function() {
    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

    $('#freeLinks').elastic();

    loadLinks();
    loadPhotos();

    // todo: hide upload and remove photos buttons if admin not logged in

    $('#galleryLinks button').click(function() {
        alert('saving links!');
        // todo: save links text if admin is logged-in
    });

    $('#uploadPhoto').click(function() {
        // todo: redirect if admin is logged-in
        
        var redirectUrl = "FileUpload.html?type=gallery";
        window.location.href = redirectUrl;
    });
    
    $('#removePhoto').click(function() {
        // todo: validate if admin is logged-in
        
        var imageName = $('ul.pxs_thumbnails li.selected img').attr('src').split('/').pop();

        $.post("/removephoto?photoName=" + imageName, function() {
            window.location.href = window.location.href;
        });
    });
});

function loadLinks() {
    // todo: load links and make editable + show/hide save button, if admin is logged-in

}

function loadPhotos() {
    // get current photos paths from server

    $.getJSON("/gallery", function(data) {
        var items = [];
        $.each( data, function(key, val) {
            items.push('<li><img src="' + val + '" alt="" /></li>');
        });
        
        var images = items.join( "" );
        $('<ul />', {
            "class": "pxs_slider",
            "id": "pxs_thumbnails",
            html: images
        }).appendTo( "#allPhotos" );

        $('<div class="pxs_navigation"><span class="pxs_next"></span><span class="pxs_prev"></span></div>')
        .appendTo( "#allPhotos" );

        $('<ul />', {
            "class": "pxs_thumbnails",
            html: images
        }).appendTo( "#allPhotos" );
        
        loadPhotosSlider();
    });
    
}