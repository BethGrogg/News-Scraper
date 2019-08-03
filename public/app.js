/* global bootbox */
$(document).ready(function () {
    // Setting a reference to the article-container div where all the dynamic content will go
    // Adding event listeners to any dynamically generated "save article"
    // and "scrape new article" buttons
    var articleContainer = $(".article-container");

    $(document).on("click", ".btn.save", articleSave);
    $(document).on("click", ".scrape-new", articleScrape);
    $(document).on("click", ".saved", showSavedArticles);
    $(document).on("click", ".note", showNote);
    $(document).on("click", ".delete-article", deleteArticle);
    $(document).on("click", ".save-note", saveNote);
    $(document).on("click", ".delete-note", deleteNote);

    //   $(".clear").on("click", handleArticleClear);
    // function initPage() {
    //   // Run an AJAX request for any unsaved headlines
    //   $.get("/api/headlines?saved=false").then(function(data) {
    //     articleContainer.empty();
    //     // If we have headlines, render them to the page
    //     if (data && data.length) {
    //       renderArticles(data);
    //     } else {
    //       // Otherwise render a message explaining we have no articles
    //       renderEmpty();
    //     }
    //   });
    // }



    $.getJSON("/articles", function (data) {
        // For each one
        // for (var i = 0; i < data.length; i++) {
        //   // Display the apropos information on the page
        //   $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        // }


        articleContainer.empty();
        // If we have headlines, render them to the page
        if (data && data.length) {
            renderArticles(data);
        } else {
            // Otherwise render a message explaining we have no articles
            renderEmpty();
        }
        
    });

   
    function renderArticles(articles) {
console.log("I am here");
        // This function handles appending HTML containing our article data to the page
        // We are passed an array of JSON containing all available articles in our database
        var articleCards = [];
        // We pass each article JSON object to the createCard function which returns a bootstrap
        // card with our article data inside
        for (var i = 0; i < articles.length; i++) {

            articleCards.push(createCard(articles[i]));
        }
        // Once we have all of the HTML for the articles stored in our articleCards array,
        // append them to the articleCards container
        articleContainer.append(articleCards);
    }

    function renderNewArticles(articles) {
        console.log("I am in New Articles");
                // This function handles appending HTML containing our article data to the page
                // We are passed an array of JSON containing all available articles in our database
                var articleCards = [];
                // We pass each article JSON object to the createCard function which returns a bootstrap
                // card with our article data inside
                for (var i = 0; i < articles.length; i++) {
        
                    articleCards.push(createSavedCard(articles[i]));
                }
                // Once we have all of the HTML for the articles stored in our articleCards array,
                // append them to the articleCards container
                articleContainer.append(articleCards);
            }

    function createCard(article) {
        // This function takes in a single JSON object for an article/headline
        // It constructs a jQuery element containing all of the formatted HTML for the
        // article card
        console.log(article);
        var card = $("<div class='card'>");
        var cardHeader = $("<div class='card-header'>").append(
            $("<h3>").append(
                $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
                .attr("href", article.link)
                .text(article.title),
                $("<a class='btn btn-success save float-right'>Save Article</a>")
            )
        );

        var cardBody = $("<div class='card-body'>").text(article.summary);

        card.append(cardHeader, cardBody);
        // We attach the article's id to the jQuery element
        // We will use this when trying to figure out which article the user wants to save
        card.data("_id", article._id);
        // We return the constructed card jQuery element
        return card;
    }
var Id;
    function createSavedCard(article) {
        // This function takes in a single JSON object for an article/headline
        // It constructs a jQuery element containing all of the formatted HTML for the
        // article card
        console.log(article);
        Id = article._id;
        var card = $("<div class='card'>");
        var cardHeader = $("<div class='card-header'>").append(
            $("<h3>").append(
                $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
                .attr("href", article.link)
                .text(article.title),
                $("<a class='btn btn-success note float-right' data-toggle='modal' data-target='#noteModal'>Add Note</a>"),
                $("<a class='btn btn-success delete-article float-right'>Delete Article</a>")
            )
        );

        var cardBody = $("<div class='card-body'>").text(article.summary);

        card.append(cardHeader, cardBody);
        // We attach the article's id to the jQuery element
        // We will use this when trying to figure out which article the user wants to save
        card.data("_id", article._id);
        // We return the constructed card jQuery element
        return card;
    }

    function renderEmpty() {
        // This function renders some HTML to the page explaining we don't have any articles to view
        // Using a joined array of HTML string data because it's easier to read/change than a concatenated string
        var emptyAlert = $(
            [
                "<div class='alert alert-warning text-center'>",
                "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
                "</div>",
                "<div class='card'>",
                "<div class='card-header text-center'>",
                "<h3>What Would You Like To Do?</h3>",
                "</div>",
                "<div class='card-body text-center'>",
                "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
                "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
                "</div>",
                "</div>"
            ].join("")
        );
        // Appending this data to the page
        articleContainer.append(emptyAlert);
    }

    function articleSave() {
        // This function is triggered when the user wants to save an article
        // When we rendered the article initially, we attached a javascript object containing the headline id
        // to the element using the .data method. Here we retrieve that.
        var articleToSave = $(this)
            .parents(".card")
            .data();

        // Remove card from page
        $(this)
            .parents(".card")
            .remove();

        articleToSave.saved = true;
        console.log("article: " + articleToSave.saved);
        console.log(articleToSave._id);
        // Using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "PUT",
            url: "/articles/save/" + articleToSave._id,
            data: articleToSave
        }).then(function (data) {
            // If the data was saved successfully
            if (data.saved) {
                // Run the initPage function again. This will reload the entire list of articles
                //   initPage();
                //renderArticles(data)
                window.location = "/";
            }
        });
    }

    function articleScrape() {
        console.log("we are in the scrape");
        //    $("#articles").empty();
        // run a call to delete the articles
        $.ajax({
            method: "DELETE",
            url: "/articles/deleteAll"
        }).done(function () {
            // This function handles the user clicking any "scrape new article" buttons
            $.get("/scrape").then(function (data) {
                // If we are able to successfully scrape the NYTIMES and compare the articles to those
                // already in our collection, re render the articles on the page
                // and let the user know how many unique articles we were able to save
                //    initPage();
                
                window.location = "/"
         //       bootbox.alert($("<h3 class='text-center m-top-80'>").text(data.message));
            });
        });
    };
    // function handleArticleClear() {
    //   $.get("api/clear").then(function() {
    //     articleContainer.empty();
    //     initPage();
    //   });
    // }

    function showSavedArticles() {
        console.log("blah"); 
    // Route for getting saved article
    $.getJSON("/saved", function (data) {
        articleContainer.empty();
                // If we have headlines, render them to the page
                if (data && data.length) {
                    renderNewArticles(data);
                } else {
                    // Otherwise render a message explaining we have no articles
                    renderEmpty();
                }
            })
          
        };

    function showNote() {
        console.log("i am in the note modal");
        $(document).on("click", "#noteModal", function () { 
        var articleId = Id;
        $(".modal-body #note-body").val(body);
            

            console.log(articleId);
        });
    };

    function deleteArticle() {
        console.log("in delete" + $(this));
            
            var articleToDelete = $(this)
            .parents(".card")
            .data();

        // Remove card from page
        $(this)
            .parents(".card")
            .remove();

        articleToDelete.saved = false;
        console.log("article: " + articleToDelete.saved);
        console.log(articleToDelete._id);
        // Using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "PUT",
            url: "/articles/delete/" + articleToDelete._id,
            data: articleToDelete
        }).then(function (data) {
            // If the data was saved successfully
            if (data.saved) {
                // Run the initPage function again. This will reload the entire list of articles
                //   initPage();
                //renderArticles(data)
                showSavedArticles();
            }
        });
     
        
    };

    function saveNote() {
       
   

        
        $.ajax({
            method: "POST",
            url: "/notes/save/" + noteArticleId,
            data: title
        }).then(function (data) {
            // If the data was saved successfully
           // if (data.saved) {
                // Run the initPage function again. This will reload the entire list of articles
                //   initPage();
                //renderArticles(data)
                showSavedArticles();
          //  }
        });

    };

    function deleteNote() {
        

 
        $.ajax({
            method: "PUT",
            url: "/notes/delete/" + noteToDelete.note_id + noteArticleId,
            data: noteToDelete
        }).then(function (data) {
            // If the data was saved successfully
         //   if (data.saved) {
                // Run the initPage function again. This will reload the entire list of articles
                //   initPage();
                //renderArticles(data)
                showSavedArticles();
         //   }
        });
    };

    });
//************************************* */  
// Grab the articles as a json
//Handle Save Article button
// $(".save").on("click", function() {
//     var thisId = $(this).attr("data-id");
//     $.ajax({
//         method: "POST",
//         url: "/articles/save/" + thisId
//     }).done(function(data) {
//         console.log("data: " + data);
//         window.location = "/"
//     })
// });


//   // Whenever someone clicks a p tag
//   $(document).on("click", "p", function() {
//     // Empty the notes from the note section
//     $("#notes").empty();
//     // Save the id from the p tag
//     var thisId = $(this).attr("data-id");

//     // Now make an ajax call for the Article
//     $.ajax({
//       method: "GET",
//       url: "/articles/" + thisId
//     })
//       // With that done, add the note information to the page
//       .then(function(data) {
//         console.log(data);
//         // The title of the article
//         $("#notes").append("<h2>" + data.title + "</h2>");
//         // An input to enter a new title
//         $("#notes").append("<input id='titleinput' name='title' >");
//         // A textarea to add a new note body
//         $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//         // A button to submit a new note, with the id of the article saved to it
//         $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

//         // If there's a note in the article
//         if (data.note) {
//           // Place the title of the note in the title input
//           $("#titleinput").val(data.note.title);
//           // Place the body of the note in the body textarea
//           $("#bodyinput").val(data.note.body);
//         }
//       });
//   });

//   // When you click the savenote button
//   $(document).on("click", "#savenote", function() {
//     // Grab the id associated with the article from the submit button
//     var thisId = $(this).attr("data-id");

//     // Run a POST request to change the note, using what's entered in the inputs
//     $.ajax({
//       method: "POST",
//       url: "/articles/" + thisId,
//       data: {
//         // Value taken from title input
//         title: $("#titleinput").val(),
//         // Value taken from note textarea
//         body: $("#bodyinput").val()
//       }
//     })
//       // With that done
//       .then(function(data) {
//         // Log the response
//         console.log(data);
//         // Empty the notes section
//         $("#notes").empty();
//       });

//     // Also, remove the values entered in the input and textarea for note entry
//     $("#titleinput").val("");
//     $("#bodyinput").val("");
//   });