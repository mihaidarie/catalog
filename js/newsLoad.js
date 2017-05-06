$(document).ready(function() {
    loadNews();
   
})

function loadNews() {
    
    var newsFileName = "database/news/news.json";

    $.getJSON(newsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, newsDetails) {
            if(newsDetails.Id && newsDetails.Id != '' && newsDetails.Description && newsDetails.Description != '') {
                items.push( "<li id=news_" + newsDetails.Id + ">" + newsDetails.Description + "</li>" );
            }
        });
        
        var allNews = items.join("");
        $(allNews).appendTo("#newsList");

        hookNewsClick();
    });
}

function hookNewsClick() {
     $("ul li[id^='news_']").click(function(e) {
        // navigate to news details page
        var newsId = this.id;
        var newnewsId = newsId.replace("news_", ""); 
        window.location.href = "news.html?id=" + newnewsId;
     });
}