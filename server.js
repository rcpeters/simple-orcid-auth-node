var express = require('express'), 
  config = require('./config.js');

var oauth2 = require('simple-oauth2')({ // Initialize the OAuth2 Library
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
  site: config.AUTH_SITE,
  tokenPath: config.TOKEN_PATH
});

var authorization_uri = oauth2.authCode.authorizeURL({ // Build Auth URI
  site: config.AUTH_SITE,
  redirect_uri: config.REDIRECT_URI,
  scope: '/authenticate /activities/update',
  state: '1'
});

var app = express(); // Express is our server
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
  
app.get('/', function(req, res) { // Index page 
  res.render('pages/index', {'authorization_uri': authorization_uri});
});

app.get('/callback', function(req, res) { // redeem code
  oauth2.authCode.getToken({
    code: req.query.code,
    redirect_uri: config.REDIRECT_URI
  }, function(error, result){
    if (error)
      if (req.query.error == 'access_denied') // User denied access
        res.render('pages/access_denied', {
          'error': JSON.stringify(error, null, 2)
        });      
      else // General Error page
        res.render('pages/error', {
          'error': JSON.stringify(error, null, 2)
        });
    else // Show token Page
      res.render('pages/token', {
        'token': JSON.stringify(oauth2.accessToken.create(result), null, 2)
      })
  });
});

app.listen(config.PORT, function () { // Start express
  console.log('server started on ' + config.PORT);
});