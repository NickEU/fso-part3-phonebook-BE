require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const Entry = require("./models/entry");

app.use(express.static("build"));
app.use(cors());
app.use(bodyParser.json());

morgan.token("post-body", function(req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(function(tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens["post-body"](req, res)
    ].join(" ");
  })
);

app.post("/api/people", (req, res) => {
  const body = req.body;

  if (!body || !body.name || !body.number) {
    return res.status(400).send({
      error: `name or number missing`
    });
  }

  const entry = new Entry({
    name: body.name,
    number: body.number
  });

  entry
    .save()
    .then(savedEntry => {
      res.json(savedEntry.toJSON());
    })
    .catch(error => next(error));
});

app.put("/api/people/:id", (req, res) => {
  const id = req.params.id;
  const body = req.body;

  if (!body || !body.name || !body.number) {
    return res.status(400).send({
      error: `name or number missing`
    });
  }

  const updatedEntry = {
    name: body.name,
    number: body.number
  };

  Entry.findByIdAndUpdate(id, updatedEntry, { new: true })
    .then(savedEntry => {
      res.json(savedEntry.toJSON());
    })
    .catch(error => next(error));
});

app.get("/api/info", (req, res) => {
  Entry.find({})
    .then(entries => {
      console.log(entries);
      const resStr = `Phonebook has info on ${
        entries.length
      } people<br/>${Date()}`;
      res.send(resStr);
    })
    .catch(error => next(error));
});

app.get("/api/people", (req, res) => {
  Entry.find({})
    .then(entries => {
      console.log(entries);
      res.json(entries.map(entry => entry.toJSON()));
    })
    .catch(error => next(error));
});

app.get("/api/people/:id", (req, res) => {
  Entry.findById(req.params.id)
    .then(result => {
      console.log(result);
      res.json(result.toJSON());
    })
    .catch(error => next(error));
});

app.delete("/api/people/:id", (req, res, next) => {
  Entry.findByIdAndRemove(req.params.id)
    .then(result => {
      console.log(result);
      res.status(204).end();
    })
    .catch(error => next(error));
});

//old version of api :

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

const generateNewId = () => {
  let currentIds = entries.map(entry => entry.id);
  do {
    var id = Math.floor(Math.random() * 1000) + 1;
    console.log(id);
  } while (currentIds.indexOf(id) !== -1);

  return id;
};

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
  res.send(`new entry was added to the phonebook`);
});

app.get("/api/persons", (req, res) => {
  res.send(entries);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = entries.find(entry => entry.id === id);
  if (result) {
    res.send(result);
  } else {
    res.status(404).send(`entry with id ${id} was not found!`);
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
    res.status(404).send(`no element with id ${id} was found.`);
  } else {
    entries = newEntries;
    res.send(`delete request for id ${id} was successful`);
  }
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind == "ObjectId") {
    return res.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
