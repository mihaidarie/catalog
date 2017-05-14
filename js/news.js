$(document).ready(function() {
    $("header").load('header.html', renderNewsForm);
    $("footer").load('footer.html');
});
 
function renderNewsForm() {
    loadHeader();
    loadNews();

    // todo: add news button

    $('#saveNews').click(function() {
        var isAdminUserLoggedIn = isAdminLoggedIn();

        if(isAdminUserLoggedIn) {

            var newsList = [];
            $('textarea[id^="news_"]').each(function(index, itemDetails) {
                var newsItem = {};
                var itemId = itemDetails.id.substring(itemDetails.id.indexOf('news_') + 5);
                newsItem.Id = parseInt(itemId);
                newsItem.Description = itemDetails.value;
                newsList.push(newsItem);
            });

            var newsJson = {
                existingData : newsList,
            };

            var newNewsValue = $('#newNews').val();
            if(newNewsValue && newNewsValue.trim() != '') {
                newsJson.newData = newNewsValue;
            }

            var postedNewsJson = JSON.stringify(newsJson);

            var postUrl = "/saveNews";
            $.ajax({
                url: postUrl,
                type: 'POST',
                data: postedNewsJson,
                contentType: 'application/json',
                error: function(jqXHR, textStatus, errorThrown ) {
                    alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                },
                success: function() {
                    console.log("success!");
                    loadNews();     
                },
                complete: function() {
                    console.log("completed!");      
                }
            });
        }
    });
    
    $('#removeNews').click(function() {
        var isAdminUserLoggedIn = isAdminLoggedIn();

        if(isAdminUserLoggedIn) {
            var newsIdsList = [];

            $('input[id^="deletenews_"]:checked').each(function(index, currentItem) {
                var itemId = currentItem.id.substring(currentItem.id.indexOf('deletenews_') + 11);
                newsIdsList.push(itemId);
            });

            var postedData = JSON.stringify(newsIdsList);

            var postUrl = "/removeNews";
            $.ajax({
                url: postUrl,
                type: 'POST',
                data: postedData,
                contentType: 'application/json',
                error: function(jqXHR, textStatus, errorThrown ) {
                    alert('jqXHR: ' + jqXHR + " textStatus: " + textStatus + " errorThrown: " + errorThrown);
                },
                success: function() {
                    console.log("success!");
                    loadNews();
                },
                complete: function() {
                    console.log("completed!");      
                }
            });
        }
    });
}

function loadNews() {
    var newsFileName = "database/news/news.json";
    
    $('#newsList').empty();
    
    $.getJSON(newsFileName, function(data) {
    
        var items = [];
        $.each(data, function(index, newsDetails) {
            if(newsDetails.Id && newsDetails.Id != '' && newsDetails.Description && newsDetails.Description != '') {
                items.push( "<li><textarea readonly id=news_" + newsDetails.Id + ">" + newsDetails.Description + 
                "</textarea><input type='checkbox' id='deletenews_" + newsDetails.Id + "'/>"
                +
                "</li>" );
            }
        });
        
        var allNews = items.join("");
        $(allNews).prependTo("#newsList");

        renderNewNewsElement();

        setupFormMode();
    });
}

function renderNewNewsElement() {
    var newNews = "<li><textarea readonly id=newNews></textarea></li>";
    $(newNews).appendTo("#newsList");
}

function setupFormMode() {
    var isAdminUserLoggedIn = isAdminLoggedIn();

    if(isAdminUserLoggedIn) {

        $('textarea[id^="news_"]').removeAttr('readonly');
        $('textarea[id^="newNews"]').removeAttr('readonly');
        $('#newsEdit').show();
    }
    else {       
        // redirect to root page if not admin
        window.location.href = "index.html";
    }
}