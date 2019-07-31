const mongoose = require("mongoose");

let printAll = false;

if (process.argv.length === 3) {
  printAll = true;
} else if (process.argv.length !== 5) {
  console.log("Currently supported commands:");
  console.log("add a new entry: node mongo.js password name number");
  console.log("view all entries: node mongo.js password");
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://ivan-grozny:${password}@cluster0-om9p9.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true });

const entrySchema = new mongoose.Schema({
  name: String,
  number: String,
  important: Boolean
});

const Entry = mongoose.model("Entry", entrySchema);

if (printAll) {
  Entry.find({}).then(result => {
    console.log(`phonebook:`);
    result.forEach(entry => {
      console.log(`${entry.name} ${entry.number}`);
    });
    mongoose.connection.close();
  });
} else {
  const name = process.argv[3];
  const number = process.argv[4];

  const entry = new Entry({
    name,
    number
  });

  entry.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}
