var mongoose = require("mongoose");
// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var articlesSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  // `note` is an object that stores a notes id
  // The ref property links the ObjectId to the notes model
  // This allows us to populate the articles with an associated note
  notes: {
    type: Schema.Types.ObjectId,
    ref: "notes"
  }
});

// This creates our model from the above schema, using mongoose's model method
var articles = mongoose.model("articles", articlesSchema);

// Export the articles model
module.exports = articles;
