require("dotenv").config();
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const url = process.env.MONGODB_URL;
const NAME_MIN_LENGTH = 3;
const NUMBER_MIN_LENGTH = 8;

console.log("Connecting to the database: ", url);

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(result => {
    console.log("connected to MongoDB");
  })
  .catch(error => {
    console.log("error connecting to MongoDB:", error.message);
  });

const entrySchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: NAME_MIN_LENGTH,
    required: true,
    unique: true
  },
  number: { type: String, minlength: NUMBER_MIN_LENGTH, required: true }
});

entrySchema.plugin(uniqueValidator);

entrySchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Entry", entrySchema, "entries");
