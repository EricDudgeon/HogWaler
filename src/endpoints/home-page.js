const templates = require('../templates');
const postdb = require('../postgres-connection');
const serveError = require('../serve-error');

//sets up the homepage template
/** @function homePage 
 * 
 * @param {http.IncomingMessage} req - the request object 
 * @param {http.ServerResponse} res - the response object 
 */
async function homePage(req, res) {
  
  
  var ins_1 = "Morning Hog Wallow";
  var ins_2 = templates["home-page.html"]({});
  var ins_3 = templates["display-graph-setup.html"]({});
  var ins_4;
  var ins_5;
  var ins_6;
  var ins_7;
  var ins_8;
  var ins_9;
  var ins_10;

  var weeklyPredictedQuery = await postdb.getGraphWeeklyPredictedCutPricesCarcass();
  var weeklyActualQuery = await postdb.getGraphWeeklyActualCutPricesCarcass();
  if(weeklyPredictedQuery == undefined) return serveError(req, res, 500, "could not grab from database'");
  if(weeklyActualQuery == undefined) return serveError(req, res, 500, "could not grab from database'");
  //console.log(weeklyPredictedQuery);
  //console.log(weeklyActualQuery);
  weeklyPredictedQuery.forEach((elem) => {
    elem.x = Number(elem.x - elem.current_week);
    elem.y = elem.y / 100;
  });
  weeklyActualQuery.forEach((elem) => {
    elem.x = Number(elem.x - elem.current_week);
    elem.y = elem.y / 100;
  });

  console.log(weeklyPredictedQuery);
  console.log(weeklyActualQuery);


  ins_4 = templates["display-graph-sales-sums.html"]({
    graph_title : "Weekly Cut Price Prediction " + 2022,
    weekly_predicted : weeklyPredictedQuery,
    weekly_actual : weeklyActualQuery,
  });


  
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
module.exports = homePage