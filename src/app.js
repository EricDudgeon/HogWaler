const express = require('express');

//const testing = require('./endpoints/testing.js');
const homePage = require('./endpoints/home-page');
//const loricaSimulation = require('./endpoints/lorica-simulation');
var app = express();


//app.get('/lorica-simulation', loricaSimulation);
//app.use('/lorica-simulation', express.static('static'));

//app.get('/testing', testing);

app.get('/', homePage); //serve homepage 1st
app.use(express.static('static')); //serve 2nd


module.exports = app;