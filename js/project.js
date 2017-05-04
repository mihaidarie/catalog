$(document).ready(function() {
    $("header").load('header.html', loadHeader);
    
    $("#btnSave").click(function() {
        // todo: save project details to file
    });

    $("#btnCancel").click(function() {
        window.location.href = window.location.href;
    });
})