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
$(".saveArticle").on("click", function() {
    var articleId = $(this).attr("data-id");
    console.log(articleId);
    $.ajax({
        method: "POST",
        url: "/articles/save/" + articleId
    }).done(function(data) {
        window.location = "/"
    })
});
//When click on Delete on an Article
$(".deleteArticle").on("click", function(){
    var articleId = $(this).attr("data-id");
    $.ajax({
        method:"POST",
        url:"/articles/delete/"+ articleId
    }).done(function(data){
        window.location = "/"
    })
})
$(".deleteSavedArticle").on("click", function(){
    var articleId = $(this).attr("data-id");
    $.ajax({
        method:"POST",
        url:"/articles/delete/"+ articleId
    }).done(function(data){
        window.location = "/saved"
    })
})
//When Click on View Add a note
$(".addNote").on("click", function() {
    var thisId = $(this).attr("data-id");
    if (!$("#noteText" + thisId).val()) {
        alert("please enter a note to save")
    }else {
      $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
                text: $("#noteText" + thisId).val()
            }
          }).done(function(data) {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#noteText" + thisId).val("");
              $(".modalNote").css("aria-hidden","false");
              window.location = "/saved"
          });
    }
});

//When click on Delete an Article Note
$(".deleteArticleNote").on("click", function() {
    var noteId = $(this).attr("data-note-id");
    var articleId = $(this).attr("data-article-id");
    $.ajax({
        method: "DELETE",
        url: "/notes/delete/" + noteId + "/" + articleId
    }).done(function(data) {
        console.log(data)
        $(".modalNote").css("aria-hidden","false");
        window.location = "/saved"
    })
});

//When click on deleteAll
$("#deleteAll").on("click", function() {
   
    $.ajax({
        method: "DELETE",
        url: "/articles/delete/all"
    }).done(function(data) {
        console.log(data);
        window.location = "/"
    })
});
  