// Requirements
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server

// Request included as a back-up
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("./models");

// Port settings
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://scrapingnews:TimesUK@ds163705.mlab.com:63705/heroku_rzvphpj3";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});


// Routes

// Index-Main Page route
app.get("/", function (req, res) {
  db.Article.find({})
    .then(function (data) {
      var hbsObject = {
        Article: data
      };
      res.render("index", hbsObject)

    })
    .catch(function (err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.thetimes.co.uk/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    var results = [];

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.Item.T-3.Theme--news").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children().find("h3.Item-headline.Headline--s").text();
      result.link = $(this).children().children().attr("href");
      result.summary = $(this).children().children().children().find("noscript").text().slice(165, 400).split("alt=");

      // result.summary = $(this).children().find("div.ArticleLabel-container").text();
      // result.summary = $(this).children().children().children().children();

    // Finding a headline article with summary

    // $("div.Item.L-4.Theme--news" || "Item.NL-1.Theme--news").each(function(i, element) {

    //   var result = {};

    //   result.link = $(this).children().find("a.Item-cta.Link--primary.js-tracking").attr("href");
    //   result.title = $(this).children().find("h3.Item-headline.Headline--xl").text();
    //   result.summary = $(this).children().find("p.Dip.Item-dip").find("span.u-showOnWide").text();

      console.log("result", result);

      // Create a new Article using the `result` object built from scraping
      $(".article-container").empty();


      db.Article.create(result)
      .then(function(dbArticle) {
        // View the added result in the console
        console.log("database" + dbArticle)
        results.push(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        return res.json(err);
      });
    });

    // If we were able to successfully scrape and save an Article, 
    // render a message to the client on a splash page which informs them of the status of the scrape
    res.render("scrape");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for deleting an Article's associated Note
app.delete("/articles/:id", function(req, res) {
  // Create a new note with no contents and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was deleted successfully, find one Article with an `_id` equal to `req.params.id`. 
      // Update the Article to be no longer associated with the new Note. { new: true } tells the query 
      // that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saved articles page
app.get("/saved", function (req, res) {
  db.Article.find({})
    .then(function (data) {
      var hbsObject = {
        Article: data
      };
      res.render("saved", hbsObject)

    })
    .catch(function (err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Route for saving articles according to id
app.put("/saved-articles/:id", function (req, res) {
  db.Article.update({ _id: req.params.id }, {$set: { saved: true }})
  .then(function (dbArticle) {
    res.redirect("/")
  })
  .catch(function (err) {
    res.json(err);
  })
});

// Route for unsaving articles
app.put("/articles/:id", function (req, res) {
  db.Article.update({ _id: req.params.id }, {$set: { saved: false }})
  .then(function (dbArticle) {
    res.redirect("/")
  })
  .catch(function (err) {
    res.json(err);
  })
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});