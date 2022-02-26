const templates = require('../templates');

const serveError = require('../serve-error');

//const postdb = require('../postgres-connection');

//sets up the loricaSimulation template
/** @function loricaSimulation 
 * 
 * @param {http.IncomingMessage} req - the request object 
 * @param {http.ServerResponse} res - the response object 
 */
async function loricaSimulation(req, res) {
  
  
  var ins_1 = "LORICA Geography Simulation Optimization";
  var ins_2 = templates["lorica-simulation.html"]({});
  var ins_3;
  var ins_4;
  var ins_5;
  var ins_6;
  var ins_7;
  var ins_8;
  var ins_9;
  var ins_10;
  
  

  
  //Main Template :
  var html = templates["layout-home-page.html"]({
    Insertion_1 : ins_1,
    Insertion_2 : ins_2,
    Insertion_3 : ins_3,
    Insertion_4 : ins_4,
    Insertion_5 : ins_5,
    Insertion_6 : ins_6,
    Insertion_7 : ins_7,
    Insertion_8 : ins_8,
    Insertion_9 : ins_9,
    Insertion_10 : ins_10
  });

  //lets use template injection instead of serving up the whole entire template right away

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-Length", html.length);
  res.end(html);
}
module.exports = loricaSimulation