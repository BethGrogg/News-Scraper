var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://bethgrogg:bigb0081@ds141410.mlab.com:41410/heroku_dvtj0p6h";

mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.entrepreneur.com/topic/coding").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);


        $("h3").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            result.summary = $(this)

                .siblings(".deck")
                .text();
            result.saved = false;



            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log("this: " + dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({
            saved: false
        })
        .then(function (dbArticle) {
            // If any Libraries are found, send them to the client with any associated Books
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

// delete all articles
app.delete("/articles/deleteAll", function (req, res) {
    // Remove all the articles
    db.Article.remove({}).then(function (err) {
        res.json(err);
    })


});

// Route for getting saved article
app.get("/saved", function (req, res) {

    db.Article
        .find({
            saved: true
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.Article.findOne({
            _id: req.params.id
        })
        .populate("note")
        .then(function (dbArticle) {
            // If any Libraries are found, send them to the client with any associated Books
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    console.log("in here, req.body: " + req.body);
    console.log("req.params.id" + req.params.id);

    db.Note.create(req.body)
        .then(function (dbNote) {

            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote_id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            // If the User was updated successfully, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

// Save an article
app.put("/articles/save/:id", function (req, res) {
    // Use the article id to find and update its saved boolean

    db.Article.findOneAndUpdate({
            "_id": req.params.id
        }, {
            "saved": true
        })
        // Execute the above query
        .then(function (dbArticle) {
            res.send(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });

});

// Delete an article
app.put("/articles/delete/:id", function (req, res) {
    // Use the article id to find and update its saved boolean

    db.Article.findOneAndUpdate({
            "_id": req.params.id
        }, {
            "saved": false
        })
        // Execute the above query
        .then(function (dbArticle) {
            console.log("server side delete");
            res.send(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });

});



// Create a new note
app.post("/notes/save/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)

        // And save the new note the db
        .then(function (dbNote) {

            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                $push: {
                    note: dbNote._id
                }
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});



// Use the article id to find and update it's notes

// Delete a note
app.delete("/notes/delete/:article_id/:note_id", function (req, res) {
    // Use the note id to find and delete it
    db.Note.findOneAndRemove({
            "_id": req.params.note_id
        })
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({
                note: req.params.id
            }, {
                $pullAll: [{
                    note: req.params.id
                }]
            });

        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});



// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});