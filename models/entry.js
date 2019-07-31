require("dotenv").config();
const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;
console.log("Connecting to the database: ", url);

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(result => {
    console.log("connected to MongoDB");
  })
  .catch(error => {
    console.log("error connecting to MongoDB:", error.message);
  });

const entrySchema = new mongoose.Schema({
  name: String,
  number: String
});

entrySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Entry", entrySchema, "entries");
