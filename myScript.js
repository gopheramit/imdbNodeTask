const mysql = require("mysql");
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");

var app = express();
app.use(cors());
//Configuring express server
app.use(bodyparser.json());

var mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Admin@123",
  database: "IMDB",
  multipleStatements: true,
});

mysqlConnection.connect((err) => {
  if (!err) console.log("Connection Established Successfully");
  else console.log("Connection Failed!" + JSON.stringify(err, undefined, 2));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));
app.get("/actors", (req, res) => {
  mysqlConnection.query("CALL getAllActors();", (err, rows, fields) => {
    if (!err) res.send(rows);
    else console.log(err);
  });
});

app.get("/movies/:id", (req, res) => {
  let learner = req.body;
  var sql = "set @movieId = ?; CALL getMovieById(@movieId); ";
  mysqlConnection.query(sql, [req.params.id], (err, rows, fields) => {
    if (!err) res.send(rows);
    else console.log(err);
  });
});

app.get("/producers", (req, res) => {
  mysqlConnection.query("CALL getAllProducers();", (err, rows, fields) => {
    if (!err) res.send(rows);
    else console.log(err);
  });
});

app.get("/movies", (req, res) => {
  var sql = "CALL getAllMOvies();";
  mysqlConnection.query(sql, (err, rows, fields) => {
    if (!err) res.send(rows);
    else console.log(err);
  });
});

app.post("/movies", (req, res) => {
  let movie = req.body;
  let movieId = 0;
  var sql =
    "SET @_Name = ?;SET @_YearOfRelease = ?;SET @_Plot = ?;SET @_Poster = ?;SET @_ProducerId = ?; CALL addMovie(@_Name,@_YearOfRelease,@_Plot,@_Poster,@_ProducerId);";
  mysqlConnection.query(
    sql,
    [
      movie.name,
      movie.yearOfRelease,
      movie.plot,
      movie.poster,
      movie.producerId,
    ],
    (err, rows, fields) => {
      if (!err) {
        //console.log(rows)
        rows.forEach((element) => {
          if (element.constructor == Array) {
            movieId = element[0].movieId;
          }
        });
        var sql2 =
          "SET @_id = ?; SET @_actorId = ?; CALL addMovieDetails(@_id, @_actorId);";
        movie.actors.forEach((element) => {
          mysqlConnection.query(
            sql2,
            [movieId, element],
            (err, rows, fields) => {
              if (!err) console.log(movieId);
              else console.log(err);
            }
          );
        });
        res.send("Suceess");
      } else console.log(err);
    }
  );
});

app.post("/actors", (req, res) => {
  let actor = req.body;
  console.log(actor);
  let actorId = 0;
  var sql =
    "SET @_Name = ?;SET @_Gender = ?;SET @_Bio = ?; CALL addActor(@_Name,@_Gender,@_Bio);";
  mysqlConnection.query(
    sql,
    [actor.Name, actor.Gender, actor.Bio],
    (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            actorId = element[0].actorId;
          }
        });
        res.send(actorId.toString());
      } else console.log(err);
    }
  );
});

app.post("/producers", (req, res) => {
  let producer = req.body;
  let producerId = 0;
  var sql =
    "SET @_Name = ?;SET @_Gender = ?;SET @_Bio = ?; CALL addProducer(@_Name,@_Gender,@_Bio);";
  mysqlConnection.query(
    sql,
    [producer.Name, producer.Gender, producer.Bio],
    (err, rows, fields) => {
      if (!err) {
        rows.forEach((element) => {
          if (element.constructor == Array) {
            producerId = element[0].producerId;
          }
        });
        res.send(producerId.toString());
      } else console.log(err);
    }
  );
});

app.put("/movies", (req, res) => {
  let movie = req.body;
  let movieId = movie.id;
  console.log(movie, "movie");
  var sql =
    "SET @_MovieId=?; SET @_Name = ?; SET @_YearOfRelease = ?;SET @_Plot = ?;SET @_Poster = ?;SET @_ProducerId = ?; CALL editMovie(@_MovieId,@_Name,@_YearOfRelease,@_Plot,@_Poster,@_ProducerId);";
  mysqlConnection.query(
    sql,
    [
      movie.movieId,
      movie.name,
      movie.yearOfRelease,
      movie.plot,
      movie.poster,
      movie.producerId,
    ],
    (err, rows, fields) => {
      if (!err) {
        console.log(rows);
      } else {
        console.log(err);
      }
    }
  );

  var sqlDelete = "SET @_id = ?; CALL deleteMovieDetails(@_id);";
  mysqlConnection.query(sqlDelete, [movie.movieId], (err, rows, fields) => {
    if (!err) {
      console.log(rows);
    }
  });
  console.log(movieId, "movieid");
  var sql2 =
    "SET @_id = ?; SET @_actorId = ?; CALL addMovieDetails(@_id, @_actorId);";
  movie.actors.forEach((element) => {
    mysqlConnection.query(sql2, [movieId, element], (err, rows, fields) => {
      if (!err) console.log("sucess");
      else console.log(err);
    });
  });
  res.send("Suceess");
});
