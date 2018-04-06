/**
 * This file is based on Facebook's version of server.js, included in the
 * download for this tutorial: https://facebook.github.io/react/docs/tutorial.html
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var COMPANY_FILE = path.join(__dirname, 'company.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/company', function(req, res) {
  fs.readFile(COMPANY_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});

app.post('/api/company', function(req, res) {
  fs.readFile(COMPANY_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var companyname = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes.
    var newCompany = {
      id: Date.now(),
      companyname: req.body.companyname,
      amount: req.body.amount,
      comment: req.body.comment
    };
    company.push(newCompany);
    fs.writeFile(COMPANY_FILE, JSON.stringify(companyname, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(companyname);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
