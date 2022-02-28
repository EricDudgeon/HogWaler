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
  
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;

  var ins_1 = "Morning Hog Wallow";
  var ins_2 = templates["home-page.html"]({
    current_date : today
  });
  var ins_3 = templates["display-graph-setup.html"]({});
  var ins_4;
  var ins_5;
  var ins_6;
  var ins_7;
  var ins_8;
  var ins_9;
  var ins_10;

  var weeklyPredictedQueryCarcass = await postdb.getGraphWeeklyPredictedCutPricesCarcass();
  var weeklyActualQueryCarcass = await postdb.getGraphWeeklyActualCutPricesCarcass();
  if(weeklyPredictedQueryCarcass == undefined) return serveError(req, res, 500, "could not grab from database'");
  if(weeklyActualQueryCarcass == undefined) return serveError(req, res, 500, "could not grab from database'");
  weeklyPredictedQueryCarcass.forEach((elem) => {
    elem.x = Number(elem.x - elem.current_week);
    elem.y = elem.y / 100;
  });
  weeklyActualQueryCarcass.forEach((elem) => {
    elem.x = Number(elem.x - elem.current_week);
    elem.y = elem.y / 100;
  });
  //console.log(weeklyPredictedQuery);
  //console.log(weeklyActualQuery);
  ins_4 = templates["display-graph-weekly-carcass.html"]({
    graph_title : "Weekly Carcass Cut Price Prediction " + 2022,
    weekly_predicted : weeklyPredictedQueryCarcass,
    weekly_actual : weeklyActualQueryCarcass,
  });



  
  var weeklyPredictedQueryLoin = await postdb.getGraphWeeklyPredictedCutPricesLoin();
  var weeklyActualQueryLoin = await postdb.getGraphWeeklyActualCutPricesLoin();
  if(weeklyPredictedQueryLoin == undefined) return serveError(req, res, 500, "could not grab from database'");
  if(weeklyActualQueryLoin == undefined) return serveError(req, res, 500, "could not grab from database'");
  weeklyPredictedQueryLoin.forEach((elem) => {
    elem.x = Number(elem.x - elem.current_week);
    elem.y = elem.y / 100;
  });
  weeklyActualQueryLoin.forEach((elem) => {
    elem.x = Number(elem.x - elem.current_week);
    elem.y = elem.y / 100;
  });
  console.log(weeklyPredictedQueryLoin);
  console.log(weeklyActualQueryLoin);
  ins_5 = templates["display-graph-weekly-loin.html"]({
    graph_title : "Weekly Loin Cut Price Prediction " + 2022,
    weekly_predicted : weeklyPredictedQueryLoin,
    weekly_actual : weeklyActualQueryLoin,
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