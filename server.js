#!/usr/bin/env node
const http = require('http');
const app = require('./src/app');
//require('./src/database');
require('./src/templates');
const port = 8084;
const reload = require('reload');
//test4
app.listen(port, function(){
    console.log("Server is listening on port " + port);
});

reload(app);