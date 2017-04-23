$(document).ready(function(){
    $(".promotion button").click(function(){
        var className = this.firstChild.data;
        loadClass(className);
    });
});