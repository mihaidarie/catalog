$(document).ready(function() {
    loadNews();
   
})

function loadNews() {
    
    var newsFileName = "database/news/news.json";

    $.getJSON(newsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, newsDetails) {
            if(newsDetails.Id && newsDetails.Id != '' && newsDetails.Description && newsDetails.Description != '') {
                items.push( "<li id=news_'" + newsDetails.Id + "'>" + newsDetails.Description + "</li>" );
            }
        });
        
        var allProjects = items.join("");
        $(allProjects).appendTo("#newsList");

        hookProjectsClick();
    });
}

function hookProjectsClick() {
     $("ul[id^='project_']").click(function(e) {
        // todo: navigate to project details page
        alert('certain news clicked');
     });
}