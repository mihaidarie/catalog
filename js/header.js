$(document).ready(function(){
   
});

function wireupHeaderButtons() {
     $(".promotion button").click(function() {
        var className = this.firstChild.data;
        window.location.href = "class.html?name=" + className;
    });
}