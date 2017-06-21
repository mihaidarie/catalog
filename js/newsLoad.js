$(document).ready(function() {
    loadNews();
   
})

function loadNews() {
    
    var newsFileName = "database/news/news.json";

    $.getJSON(newsFileName, {_: new Date().getTime()}, function(data) {
    
        var items = [];
        var sorted = data.sort(SortById);
        $.each(data, function(index, newsDetails) {
            if(newsDetails.Id && newsDetails.Id != '' && newsDetails.Description && newsDetails.Description != '') {
                items.push( "<li id=news_" + newsDetails.Id + "><textarea readonly>" + newsDetails.Description + "</textarea></li>" );
            }
        });
        
        var allNews = items.join("");
        $(allNews).appendTo("#newsList");
        $('#newsList textarea').autogrow({vertical : true, horizontal : false});
    });
}

function SortById(a, b){
  var aName = a.Id;
  var bName = b.Id; 
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}