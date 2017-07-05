
var express = require('express');
var bodyParser = require('body-parser');
var xmlparser = require('express-xml-bodyparser');
var routedata = require('./routes/routedata');
var CarFlow = require('./models/Flow.js');
var app = express();

 app.use(bodyParser.json());
// app.use(xmlparser());


app.use('/api/method=get&appkey=436etaq52e57a3cd028ab56b&seckey=sec-mj12Slu12w1Xs1er8ZzmGZqw5qrpFmqw25jHULr13eUZCswA', routedata);

app.set('port', process.env.PORT || 4002);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});