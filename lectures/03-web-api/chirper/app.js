// these imports is possible because of the "type": "module" in package.json
import express from "express";
import bodyParser from "body-parser";

export const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("static"));

// this is a middleware function that logs the incoming request
app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

const Chirp = (function () {
  let id = 0;
  return function item(chirp) {
    this.id = id++;
    this.content = chirp.content;
    this.authorId = chirp.authorId;
  };
})();

// in memory collection of chirps
const chirps = [];

app.get("/authors/:id/chirps", function (req, res) {
  const authorChirps = chirps.filter(function (chirp) {
    return chirp.authorId === +req.params.id;
  });
  if (authorChirps.length === 0) {
    return res
      .status(404)
      .json({ error: `user id: ${req.params.id} has no chirps` });
  }
  return res.json(authorChirps);
});

app.post("/chirps", function (req, res) {
  const chirp = new Chirp(req.body);
  chirps.unshift(chirp);
  return res.json(chirp);
});

app.get("/chirps", function (req, res) {
  return res.json({
    total: chirps.length,
    chirps,
  });
  // anti-pattern: do not return array
  // return res.json(chirps);
});

app.patch("/chirps/:id", function (req, res) {
  const index = chirps.findIndex(function (chirp) {
    return chirp.id === +req.params.id;
  });
  if (index === -1) {
    return res
      .status(404)
      .json({ error: `chirp id: ${req.params.id} does not exist` });
  }
  const chirp = chirps[index];
  chirp.content = req.body.content;
  return res.json(chirp);
});

app.delete("/chirps/:id", function (req, res) {
  const index = chirps.findIndex(function (chirp) {
    return chirp.id === +req.params.id;
  });
  if (index === -1) {
    return res
      .status(404)
      .json({ error: `chirp id: ${req.params.id} does not exist` });
  }
  const chirp = chirps[index];
  chirps.splice(index, 1);
  return res.json(chirp);
});

const PORT = 3000;

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
