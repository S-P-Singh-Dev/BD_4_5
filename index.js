let express = require("express");
let cors = require("cors");
let sqlite3 = require("sqlite3").verbose();
let { open } = require("sqlite");

const app = express();
app.use(cors());
app.use(express.json());

let db;

(async () => {
  db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
})();


async function filterByYearAndActor(releaseYear, actor){
    let query = "SELECT * FROM movies WHERE release_year = ? AND actor = ?";
    let result = await db.all(query, [releaseYear, actor]);
    return {movies: result};
}

async function fetchAwardWinningMovies() {
    let query = "SELECT * FROM movies WHERE rating >= 4.5 ORDER BY rating";
    let result = await db.all(query,[]);
    return {movies: result};
}

async function fetchBlockbusters() {
    let query = "SELECT * FROM movies WHERE box_office_collection >= 100 ORDER BY box_office_collection DESC";
    let result = await db.all(query, []);
    return {movies: result};
}

app.get('/movies/year-actor', async (req, res) => {
    let releaseYear = req.query.releaseYear;
    let actor = req.query.actor;

    try {
        let result = await filterByYearAndActor(releaseYear, actor);
        if (result.movies.length === 0) {
            res.status(404).json({movies: "No movies found"});
        }
        res.status(200).json({movies: result});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/movies/award-winning', async(req, res) => {
    try {
        let result = await fetchAwardWinningMovies();
        if (result.movies.length === 0) {
            res.status(400).json({message: "No movies found"});
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/movies/blockbuster', async (req, res) => {
    try{
        let result = await fetchBlockbusters();
        if (result.movies.length === 0) {
            res.status(404).json({ message: "No movies found" });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
 

app.listen(3000, () => {
  console.log("Express server initialized");
});