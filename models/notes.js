var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new notesSchema object
// This is similar to a Sequelize model
var notesSchema = new Schema({
    body: {
        type: String
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: "articles"
    }
});

// This creates our model from the above schema, using mongoose's model method
var notes = mongoose.model("notes", notesSchema);

// Export the notes model
module.exports = notes;