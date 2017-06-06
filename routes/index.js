var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');

// console.log(config);

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: config.sql.host,
    user: config.sql.user,
    password: config.sql.password,
    database: config.sql.database
});
connection.connect();

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

/* GET home page. */
router.get('/', function(req, res, next) {
    request.get(nowPlayingUrl,(error, response, movieData)=>{
        var movieData = JSON.parse(movieData);
        // console.log("================");
        // console.log(req.session);
        // console.log("================");
        res.render('index', {
            movieData: movieData.results,
            imageBaseUrl: imageBaseUrl,
            titleHeader: 'Now Playing',
            sessionInfo: req.session
        });
    });
});

router.get('/search',(req, res)=>{
    res.send("The get search page");
});

router.post('/search',(req, res)=>{
    // req.body is available because of the body-parser module
    // body-parser module was installed when you created the express app
    // req.body is where POSTED data will live
    // res.json(req.body);
    var termUserSearchedFor = req.body.searchString;
    var searchUrl = apiBaseUrl + '/search/movie?query='+termUserSearchedFor+'&api_key='+config.apiKey;
    request.get(searchUrl,(error,response,movieData)=>{
        var movieData = JSON.parse(movieData);
        // res.json(JSON.parse(movieData));
        // console.log(movieData);
        res.render('index', {
            movieData: movieData.results,
            imageBaseUrl: imageBaseUrl,
            titleHeader: 'You searched for: ' + termUserSearchedFor
        });
    });
    // res.send("The post search page");
});

router.get('/movie/:id',(req, res)=>{
    // the route has a :id in it. A : means WILDCARD
    // a wildcard is ANYTHING in that slot.
    // all wildcards in routes are available in req.params
    var thisMovieId = req.params.id;
    // build the URL per the API docs
    var thisMovieUrl = `${apiBaseUrl}/movie/${thisMovieId}?api_key=${config.apiKey}`;
    // Use the request module to make an HTTP request
    request.get(thisMovieUrl,(error, reponse, movieData)=>{
        // Parse the response into JSON
        var movieData = JSON.parse(movieData);
        // First arg: the view file.
        // Second param: obj to send the view file
        res.render('single-movie',{
            movieData: movieData,
            imageBaseUrl: imageBaseUrl
        });

    });
    // res.send(req.params.id);
});

router.get('/login', (req,res)=>{
    res.render('login',{ })
});

router.post('/processLogin', (req,res)=>{
    // res.json(req.body);
    var email = req.body.email;
    var password = req.body.password;
    var selectQuery = "SELECT * FROM users WHERE email = ? AND password = ?";
    connection.query(selectQuery,[email,password],(error,results)=>{
        if(results.length == 1){
            // Match found!
            req.session.loggedin = true;
            req.session.name = results.name;
            req.session.email = results.email;
            req.redirect('/?msg=loggedin');
        }else{
            // no registered user match
            res.redirect('/login?msg=badLogin');
        }
    });
});

router.get('/register', (req,res)=>{
    var message = req.query.msg;
    if(message == 'badEmail'){
        message = "This email is already registered.";
    }
    res.render('register',{ message: message })
});

router.post('/registerProcess', (req,res)=>{
    // res.json(req.body);
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var selectQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(selectQuery,[email],(error,results)=>{
        if(results.length == 0){
            // User is not in the db. Insert them
            var insertQuery = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
            connection.query(insertQuery, [name,email,password], (error,results)=>{
                // Add session vars -- name, email, loggedin, id
                req.session.name = name;
                req.session.email = email;
                req.session.loggedin = true;
                res.redirect('/?msg=registered');
            });
        }else{
            // User is in the db. Send them back to register with error message
            res.redirect('/register?msg=badEmail');
        }
    });
});

module.exports = router;
