// Require Mongoose
var mongoose = require("mongoose");

// Saving a reference to the Schema constructor
var Schema = mongoose.Schema;

// Creating a new NoteSchema object via use of the Schema constructor
var ArticleSchema = new Schema({
  title: {
      type: String,
      required: true
  },
  link: {
      type: String,
      required: true
  },
  summary: {
      type: String,
      required: false
  },
  saved: {
      type: Boolean,
      default: false,
      required: true
  },
  // `note` is an object that stores a Note id
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with an associated Note
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;