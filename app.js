var Uber = require('node-uber');
var express = require('express');
var request = require('request');


var app = express();
app.use(express.static('public'));

app.listen(process.env.PORT || 3000)


var uber = new Uber({
  client_id: 'qfa9685JhoyhkXKToPtOo5ViSHufieac',
  client_secret: '1Ib94U_m02pgWZnL_jmYheKik5t80ytI3eVg32o5',
  server_token: '8dVsmxZH9Xe8KRPBUONd4s4dsyYpgXZf_70Fegpa',
  redirect_uri: 'https://hidden-sea-86580.herokuapp.com/api/callback',
  name: 'RideStats.me',
  language: 'en_US', // optional, defaults to en_US
  sandbox: true // optional, defaults to false
});

app.get('/', function(req, res) {
  res.send("hello from your uber project")
});

app.get('/api/data', function(req, res) {
  res.send("hello from data")
});

app.get('/api/login', function(req, res) {
  var url = uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
  console.log(url)
  res.redirect(url);
});

app.get('/api/callback', function(req, res) {
    console.log(req.query)
    uber.authorization({
      authorization_code: req.query.code
    }, function(err, access_token, refresh_token) {
      if (err) {
        console.error(err);
      } else {
        // store the user id and associated access token
        // redirect the user back to your actual app
        res.redirect('/api/history');
      }
    });
});


app.get('/api/history', function(req, res) {

  function writeDatatoCSV(error, response) {
    if (response.offset + response.limit >= response.count) {
       res.end()
    } else {
      console.log(response.count)
      console.log(response.offset + response.limit)
      res.write(JSON.stringify(response))
      process.nextTick(function(){
        fetchData(response.offset+response.limit,response.limit,writeDatatoCSV)
      })
    }      
  }
  var fetchData = function (offset,limit,func) {
    uber.user.getHistory(offset, limit, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        func(null,result);
      } 
    });
  };

  fetchData(0,50,writeDatatoCSV);

});
