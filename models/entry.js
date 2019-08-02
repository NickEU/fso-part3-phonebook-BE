require("dotenv").config();
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const url = process.env.MONGODB_URL;

console.log("Connecting to the database: ", url);

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch(error => {
    console.log("error connecting to MongoDB:", error.message);
  });

const NAME_MIN_LENGTH = 3;
const NUMBER_MIN_LENGTH = 8;

const numberValidatorFnc = val => {
  let charArr = val.split("");
  let digitsCount = 0;
  charArr.forEach(char => {
    if (Number.isInteger(Number(char))) digitsCount++;
  });
  return digitsCount >= 8;
};

const numberValidator = [
  numberValidatorFnc,
  `Error! phonenumber must be at least ${NUMBER_MIN_LENGTH} digits long`
];

const entrySchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [
      NAME_MIN_LENGTH,
      `Error! Persons name must be at least ${NAME_MIN_LENGTH} letters long`
    ],
    required: [true, "Error! Each phonebook entry must have a name"],
    unique: true
  },
  number: {
    type: String,
    validate: numberValidator,
    required: [true, "Error! Each phonebook entry must have a number"]
  }
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
