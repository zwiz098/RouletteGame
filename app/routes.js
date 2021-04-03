module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================


    app.get('/profile', function(req, res) {

      let findAllDocuments = db.collection('profits').find().toArray()
  
      let findAddProfits =  db.collection('profits').aggregate(
          [
            {$match: {// match acts as a filter to find all of the documents with the conditions below
              winner: 'casino'//these are said conditions, in this case we are filtering all docs where winner is the casino
              }
            },
            {$group: {_id: null,// group puts all of the returned matches in one group
                      total: { $sum: '$betAmount'}}// this code sets the total property to the sum of all of the bet amounts in the group
            }
          ]).toArray()

      let findLosses = db.collection('profits').aggregate(
        [
          {$match: {
            winner: 'player'
            }
          },
          {$group: {_id: null,
                    total: {$sum : '$betAmountNegative' }        
          }}
        ]
      ).toArray()

      let findWinnerCasino = db.collection('profits').countDocuments({winner: 'casino'})
      let findWinnerPlayer = db.collection('profits').countDocuments({winner: 'player'})
  
      Promise.all([findAllDocuments, findAddProfits, findLosses, findWinnerCasino, findWinnerPlayer]).then((values) => {
        
        
        let [findAllDocuments, findAddProfitsResults, findLossesValues, findWinnerCasinoResults, findWinnerPlayerResults] = values;

        console.log('Hi')
        console.log(findLossesValues)

        findLossesValues = findLossesValues.length === 0 ? findLossesValues[0].total = 0 : findLossesValues[0].total

        console.log(findLossesValues)
        console.log(findWinnerPlayerResults)
  
        res.render('profile.ejs', {
          user: req.user,
          documents: findAllDocuments,
          addProfits: findAddProfitsResults,
          subtractProfits: findLossesValues,
          winnerCasino: findWinnerCasinoResults,
          playerCasino: findWinnerPlayerResults
        })
        console.log(subtractProfits)
      }).catch((error) => {
        console.log(error)
      });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/profile', (req, res) => {
      console.log(req.body);
      db.collection('profits').save(
        {winner: req.body.winner,
        betAmount: req.body.betAmount, betAmountNegative: (req.body.betAmount * -1)}, (err, result) => {
             if (err) return console.log(err)
            console.log('saved to database')
      })
      })
    //   db.collection('profits').aggregate(
    //     [
    //       {$match: {// match acts as a filter to find all of the documents with the conditions below
    //         winner: 'casino',//these are said conditions, in this case we are filtering all docs where winner is the casino
    //         }
    //       },
    //       {$group: {_id: null,// group puts all of the returned matches in one group
    //                 total: { $sum: '$betAmount'}}// this code sets the total property to the sum of all of the bet amounts in the group
    //       }
    //     ]).toArray().then((result) => {
    //       console.log(result)
    //   }
    //

    var ObjectId = require('mongodb').ObjectId;

    // app.put('/profile', (req, res) => {
    //   db.collection('profits')
    //   .findOneAndUpdate({_id: ObjectId(req.body.docId)}, {
    //     $set: {
    //       thumbUp:req.body.thumbUp + 1
    //     }
    //   }, {
    //     sort: {_id: -1},
    //     upsert: true
    //   }, (err, result) => {
    //     if (err) return res.send(err)
    //     res.send(result)
    //   })
    // })
    app.put('/thumbDown', (req, res) => { // add to our thumbs up
      db.collection('messages') //refers to the mongodb that holds user information
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
