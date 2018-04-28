// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "<br />" + data[i].summary + "</p>");
  }
});

// Whenever someone clicks .add to add and see notes
$(document).on("click", ".add", function() {
    // Empty the notes from the note section
    $("#"+thisId+"notes").empty();
    // Save the id from the .add tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
        $("#"+thisId+"notes")
        // The title of the article
        .append("<h4>" + data.title + "</h4>" +
        // An input to enter a new title 
        "<h5>Note Title<h5>" +
        "<input id='titleinput' name='title' ></input>" +
        // A textarea to add a new note body 
        "<h5>Note Text<h5>" +
        "<textarea id='bodyinput' name='body'></textarea>" +
        // A button to submit a new note, with the id of the article saved to it 
        "<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
    });
});
  
// When you click the savenote button
$(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#"+thisId+"notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#"+thisId+"titleinput").val("");
    $("#"+thisId+"bodyinput").val("");
});

// When you click the save button to save articles
$(document).on("click", ".save", function () {

  // Grab the id from the .save tag
  var thisId = $(this).attr("data-id");
  
  // Run a PUT request to change the location of the article from the main page 
  // to the saved page, using what's entered in the inputs
  $.ajax({
    url: "/saved-articles/" + thisId,
    type: "PUT",
    data: thisId,
  });
});

//When you click the unsave button to unsave articles
$(document).on("click", ".unsave", function () {

  // Grab the id from the .unsave tag
  var thisId = $(this).attr("data-id");

  // Run a PUT request to change the location of the article from the save page 
  // back to the main page, using what's entered in the inputs
  $.ajax({
    url: "/articles/" + thisId,
    type: "PUT",
    data: thisId,
  });
});

// Whenever someone clicks the delete tag to delete notes
$(document).on("click", ".delete", function() {
    // Empty the notes from the note section
    $("#"+thisId+"notes").empty();
    // Save the id from the delete tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "DELETE",
      url: "/articles/" + thisId
    })
      // With that done, delete the note information from the page
      .then(function(data) {
        console.log(data);
    +   
        $("#"+thisId+"notes")
        // The title of the article
        .append("<h4>" + data.title + "</h4>" +
        // An input to enter a new title 
        "<h5>Note Title<h5>" +
        "<input id='titleinput' name='title' ></input>" +
        // A textarea to add a new note body 
        "<h5>Note Text<h5>" +
        "<textarea id='bodyinput' name='body'></textarea>" +
        // A button to submit a new note, with the id of the article saved to it 
        "<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
    });
});