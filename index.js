var express = require('express');
var router = require('./config/routes');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
//app.set("views") set templating here is necessary

app.use(router);

app.listen(3000, function(){
  console.log("App listening on port 3000.")
})
