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

morgan.token("post-body", function(req) {
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

app.post("/api/people", (req, res, next) => {
  const body = req.body;

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

app.put("/api/people/:id", (req, res, next) => {
  const id = req.params.id;
  const body = req.body;

  const updatedEntry = {
    name: body.name,
    number: body.number
  };

  Entry.findByIdAndUpdate(id, updatedEntry, {
    new: true,
    runValidators: true,
    context: "query"
  })
    .then(savedEntry => {
      res.json(savedEntry.toJSON());
    })
    .catch(error => next(error));
});

app.get("/api/info", (req, res, next) => {
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

app.get("/api/people", (req, res, next) => {
  Entry.find({})
    .then(entries => {
      console.log(entries);
      res.json(entries.map(entry => entry.toJSON()));
    })
    .catch(error => next(error));
});

app.get("/api/people/:id", (req, res, next) => {
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

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  } else if (error.codeName === "DuplicateKey") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
