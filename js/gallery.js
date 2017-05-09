$(document).ready(function() {
   

    $("header").load('header.html', loadHeader);
    $("footer").load('footer.html');

   
    $('#freeLinks').elastic();

    loadLinks();
    loadPhotos();

    $('#galleryLinks button').click(function() {
        alert('saving links!');
        // todo: save links text if admin is logged-in
    });

    $('#uploadPhoto').click(function() {
        // todo: redirect if admin is logged-in
        
        var redirectUrl = "FileUpload.html?type=gallery";
        window.location.href = redirectUrl;
    });
    
});

function loadLinks() {
    // todo: load links and make editable + show/hide save button, if admin is logged-in

}

function loadPhotos() {
    // todo: get current photos paths from server
    
}