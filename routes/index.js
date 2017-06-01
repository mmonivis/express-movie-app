var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');

// console.log(config);

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

/* GET home page. */
router.get('/', function(req, res, next) {
    request.get(nowPlayingUrl,(error, response, movieData)=>{
        var movieData = JSON.parse(movieData);
        res.render('index', {
            movieData: movieData.results,
            imageBaseUrl: imageBaseUrl,
            titleHeader: 'Now Playing'
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

module.exports = router;
