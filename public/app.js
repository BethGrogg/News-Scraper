/* global bootbox */
$(document).ready(function () {

    var articleContainer = $(".article-container");

    $(document).on("click", ".btn.save", articleSave);
    $(document).on("click", ".scrape-new", articleScrape);
    $(document).on("click", ".saved", showSavedArticles);
    $(document).on("click", ".note", showNote);
    $(document).on("click", ".delete-article", deleteArticle);
    $(document).on("click", ".save-note", saveNote);
    $(document).on("click", ".delete-note", deleteNote);


    $.getJSON("/articles", function (data) {

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
                .attr("href", "https://www.entrepreneur.com" + article.link)
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


    function createSavedCard(article) {
        // This function takes in a single JSON object for an article/headline
        // It constructs a jQuery element containing all of the formatted HTML for the
        // article card



        var card = $("<div class='card'>");
        var cardHeader = $("<div class='card-header'>").append(
            $("<h3>").append(
                $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
                .attr("href", "https://www.entrepreneur.com" + article.link)
                .text(article.title),
                $("<br></br>"),
                $("<a class='btn btn-success note float-right' data-toggle='modal' data-id=" + article._id + " data-target='#noteModal'>Add Note</a>"),
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


                window.location = "/"

            });
        });
    };


    function showSavedArticles() {

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
        var noteToSave = $(this)
            .parents(".card")
            .data();
        console.log("noteToSave: " + noteToSave._id);

        $('#hidden-id').attr("data-id", noteToSave._id);

        $.ajax({
                method: "GET",
                url: "/articles/" + noteToSave._id
            })
            // With that done, add the note information to the page
            .then(function (data) {
                console.log("Checking data: " + data);

            });

    };

    function deleteArticle() {


        var articleToDelete = $(this)
            .parents(".card")
            .data();

        // Remove card from page
        $(this)
            .parents(".card")
            .remove();

        articleToDelete.saved = false;
        console.log("articleToDelete: " + articleToDelete._id);
        // Using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "PUT",
            url: "/articles/delete/" + articleToDelete._id,
            data: articleToDelete
        }).then(function (data) {
            // If the data was saved successfully
            if (data.saved) {
                // Run the initPage function again. This will reload the entire list of articles

                showSavedArticles();
            }
        });


    };

    function saveNote() {

        var thisId = $("#hidden-id").attr("data-id");
        console.log("thisId:" + thisId);

        $.ajax({
            method: "POST",
            url: "/notes/save/" + thisId,
            data: {
                title: thisId,
                body: $("#note-body").val()
            }
        }).done(function (data) {
            // Log the response
            console.log("this data: " + data);
            // Empty the notes section
            // $("#note-body").val("");

        });

    };



    function deleteNote() {

        var articleId = ($("#hidden-id").attr("data-id"));

        var Id = ($("#note-id").attr("data-id"));
        $("#note-body").val("");
        $.ajax({
            method: "DELETE",
            url: "/notes/delete/" + articleId + Id,

        }).then(function (data) {
            // If the data was saved successfully

        });
    };

});