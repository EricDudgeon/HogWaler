#!/usr/bin/env node
const http = require('http');
const app = require('./src/app');
//require('./src/database');
require('./src/templates');
const port = 8081;

const reload = require('reload');

app.listen(port, function(){
    console.log("Server is listening on port " + port);
});
//test1

reload(app);