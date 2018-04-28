// Require Mongoose
var mongoose = require("mongoose");

// Saving a reference to the Schema constructor
var Schema = mongoose.Schema;

// Creating a new NoteSchema object via use of the Schema constructor
var NoteSchema = new Schema({
  title: String,
  body: String
});

// This creates our model from the above schema, using mongoose's model method
var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
