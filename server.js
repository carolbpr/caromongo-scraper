var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.set('useFindAndModify', false);
mongoose.connect(MONGODB_URI);

// Routes
// ======

//GET requests to render Handlebars pages
app.get("/", function (req, res) {
  db.articles.find({ "saved": false }, function (error, data) {
    var hbsObject = {
      articles: data
    };
    res.render("home", hbsObject);
  });
});

app.get("/saved", function (req, res) {
  db.articles.find({ "saved": true }).populate("note").exec(function (error, articles) {
    console.log(articles)
    var hbsObject = {
      articles: articles
    };
    res.render("saved", hbsObject);
  });
});


// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector

    debugger
    var $ = cheerio.load(response.data);



    // Now, we grab every h2 within an articles tag, and do the following:
    $("article").each(function (i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find("h2").text();
      result.link = "https://www.nytimes.com" + $(this).find("a").attr("href");
      result.summary = $(this).find("p").text().trim();

      // Create a new articles using the `result` object built from scraping
      db.articles.create(result)
        .then(function (dbarticles) {
          // View the added result in the console
          console.log(dbarticles);
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

// Route for getting all articless from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.articles.find({})
    .then(function (dbarticles) {
      // If we were able to successfully find articles, send them back to the client
      res.json(dbarticles);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Save an article
app.post("/articles/save/:id", function (req, res) {
  // Use the article id to find and update its saved boolean
  db.articles.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
    // Execute the above query
    .exec(function (err, doc) {
      // Log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// Delete an article
app.post("/articles/delete/:id", function (req, res) {
  // Use the article id to find and update its saved boolean, it won't appear in the saved articules list
  var Notes = req.params.note;
  db.articles.findByIdAndDelete({ "_id": req.params.id })
    // Execute the above query
    .exec(function (err, doc) {
      // Log any errors
      if (err) {
        console.log(err);
      }
      else {
        // Or send the document to the browser
        res.send(doc);
      }
    });
});

// Create a new note
app.post("/notes/save/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(req.params.id)
  var newNote = new db.notes({
    body: req.body.text,
    article: req.params.id
  });
  console.log(req.body)
  // And save the new note the db
  newNote.save(function (error, notes) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's notes
      console.log(notes.id);
      db.articles.findOneAndUpdate({ "_id": req.params.id }, { $push: { "note": notes.id } })
        // Execute the above query
        .exec(function (err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send(notes);
          }
        });
    }
  });
});

// Delete a note
app.delete("/notes/delete/:note_id/:article_id", function (req, res) {
  // Use the note id to find and delete it
  db.notes.findOneAndRemove({ "_id": req.params.note_id }, function (err) {
    // Log any errors
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {

      db.articles.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "note": req.params.note_id } })
        // Execute the above query
        .exec(function (err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            res.send("Note Deleted");
          }
        });
    }
  });
});

//Delete all articles
app.delete("/articles/delete/all", function (req, res) {
  db.articles.remove({}, function (err) {
    if (err) {
      console.log(err);
      res.send(err);
    }
    else {
      db.notes.remove({}).exec(function (err) {
        if (err) {
          console.log(err);
          res.send(err);
        }
        else {
          // Or send the note to the browser
          res.send("All articles Deleted");
        }
      })
    }
  })
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
