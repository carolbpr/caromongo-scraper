//When click on New Scrape button
$("#newScrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        window.location = "/"
    })
});
//Handle Save Article button
$(".save").on("click", function() {
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data) {
        window.location = "/"
    })
});