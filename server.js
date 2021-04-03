// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 2100;
const MongoClient = require('mongodb').MongoClient
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

var db

// let rouletteGame = {
//   player:{
//    betColor: "betColor", //Need an option for the player to select the color they are betting their money on will update with client side team this will correspond to the data-values on the index.ejs file
//    betNumber: "betNumber",
//    betAmount: "betAmount"//Storing the amount of money the player is betting
//   },
//
//   casino:{
//     total: 0, //net profits
//     losses: "losses",
//     wins: "wins",
//     amountLost: 0,
//     amountWon: 0
//   }
// }//object casino and player info


//this function picks randomly between 2 options red or black can expand on this later

// function randomColor(){
//   let random = Math.floor(Math.random())
//   if(random <= .5){
//     return "red"
//   }else{
//     return "black"
//   }
// }
//
//
// function winnerComparison(){
//   colorPicker = randomColor()
//   playerBet = rouletteGame.player.betColor//unsure of the syntax here, unable to test
//
//   if(colorPicker === playerBet){
//     //let playerBank = bet * 10  -->pseudo code to add winnings to player's bank that they'll be able to "witdraw"
//     //total = total - playerBank -->pseudo that subracts the winnings from the casino total
//     console.log("player wins");//don't know what will happen when wins occur just yet
//   }else{
//     console.log("casino wins");//don't know what will happen when wins occur just yet
//   }
// }



// configuration ===============================================================
mongoose.connect(configDB.url, (err, database) => {
  if (err) return console.log(err)
  db = database
  require('./app/routes.js')(app, passport, db);
}); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'rcbootcamp2021a', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// launch ======================================================================
app.listen(port);
console.log('The house always wins on ' + port);
