const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

let entries = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 2
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 3
  },
  {
    name: "Don Draper",
    number: "081-757-383",
    id: 4
  },
  {
    name: "Jimmy McGill",
    number: "033-456-654",
    id: 5
  }
];

app.post("/api/persons", (req, res) => {
  let body = req.body;
  if (!body || !body.name || !body.number) {
    return res.status(400).send({
      error: `name or number missing`
    });
  }
  if (entries.find(entry => entry.name === body.name)) {
    return res.status(400).send({
      error: `name must be unique`
    });
  }
  let entry = {
    name: body.name,
    number: body.number,
    id: generateNewId()
  };
  console.log(entry);
  entries.push(entry);
  res.send(`New entry was added to the phonebook`);
});

const generateNewId = () => {
  let currentIds = entries.map(entry => entry.id);
  let id;
  do {
    id = Math.floor(Math.random() * 100) + 1;
    console.log(id);
  } while (currentIds.indexOf(id) !== -1);

  return id;
};

app.get("/api/persons", (req, res) => {
  res.send(entries);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = entries.find(entry => entry.id === id);
  if (result) {
    res.send(result);
  } else {
    res.status(404).send(`Entry with id ${id} was not found!`);
  }
});

app.get("/info", (req, res) => {
  const resStr = `Phonebook has info on ${entries.length} people<br/>${Date()}`;
  res.send(resStr);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const newEntries = entries.filter(entry => entry.id !== id);
  console.log(entries.length, newEntries.length);
  if (entries.length === newEntries.length) {
    res.status(404).send(`No element with id ${id} was found.`);
  } else {
    entries = newEntries;
    res.send(`Delete request for id ${id} was successful`);
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
