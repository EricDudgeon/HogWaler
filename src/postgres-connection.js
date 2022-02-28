//test
//make sure database password is hidden from files
//need to client connections for the other server

//node ./db_postgresql_scripts/insert-data-database.js (recreate command)

//still figuring out different between pool and client but just use Pool for the moment
const { Pool, Client } = require('pg');
var fs = require('fs'); //reading in .sql files
const os = require('os');
const linuxUser = os.userInfo();
console.log(linuxUser.username);

//https://www.youtube.com/watch?v=ENrzD9HAZK4

//console.log(process.env.USER) //also works for getting running user or other stuff

const credentials_local = {
  host: '127.0.0.1',
  user: linuxUser.username,
  password: 'DatabasePassword6969', //need in a secret file !!! (not secure here)
  database: 'hogwaler',
  port: '5432'
};

//connects to other remote database server potentially (if setup)
const credentials_server = {
  host: '192.168.86.42',
  user: linuxUser.username,
  password: 'DatabasePassword6969', //need in a secret file !!! (not secure here)
  database: 'hogwaler',
  port: '5432'
}; 

var credentials;
console.log(os.hostname());
if (os.hostname() == "Jumpgate") //checks if running on Jumpgate server
{
  credentials = credentials_server;
}
else {
  credentials = credentials_local;
}


//remember results get returned into an array that must be looped 
// or get [0] for single results returned
async function sendMultiQuery(text, values) {
  //const pool = new Pool(credentials_local);
  const pool = new Pool(credentials);
  //console.log("pool error :" + pool);
  //console.log("query");
  const results = await pool.query(text, values);
  //console.log("promise resolved pool.query()");
  await pool.end();
  //console.log("promise resolved pool.end()");
  //console.log(results.rows);
  if (results.rows == undefined) return undefined;
  //console.log(results.rows.length);
  if (results.rows.length == 0) {
    //console.log("return undefined");
    return []; //return empty list
  }
  
  return results.rows;
}

//used if you are expecting a query with a single return result
//...this is important since return object expects an array for multiple results
async function sendSingleQuery(text, values) {
  const pool = new Pool(credentials);
  const results = await pool.query(text, values);
  await pool.end();
  if (results.rows == undefined) return undefined;
  if (results.rows.length == 0) {
    //console.log("return undefined");
    return false;
  }
  
  return results.rows[0];
}

async function getMultiQuery(text, values) {
  try {
    const results = await sendMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log(arguments.callee.name + " Failed : " + error); //testing this out
    console.log(arguments.callee.caller.name + " Failed : " + error);
    return undefined;
  }
}
async function getSingleQuery(text, values) {
  try {
    const results = await sendSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log(arguments.callee.name + " Failed : " + error); //testing this out
    console.log(arguments.callee.caller.name + " Failed : " + error);
    return undefined;
  }
}

//Tables :
//market.daily_cut_predicted;
//market.daily_cut_actual;
//market.weekly_cut_predicted;
//market.weekly_cut_actual;

//SELECT :
async function getAllWeeklyPredictedCutPrices() {
  const text = `
  SELECT * 
  FROM market.weekly_cut_predicted
  ` ;
  const values = []; const results = await getMultiQuery(text, values);
  return results;
}
async function getAllWeeklyActualCutPrices() {
  const text = `
  SELECT * 
  FROM market.weekly_cut_Actual
  ` ;
  const values = []; const results = await getMultiQuery(text, values);
  return results;
}
async function getAllDailyPredictedCutPrices() {
  const text = `
  SELECT * 
  FROM market.daily_cut_predicted
  ` ;
  const values = []; const results = await getMultiQuery(text, values);
  return results;
}
async function getAllDailyActualCutPrices() {
  const text = `
  SELECT * 
  FROM market.daily_cut_actual
  ` ;
  const values = []; const results = await getMultiQuery(text, values);
  return results;
}

//SELECT individual cuts for Graphing
async function getGraphWeeklyPredictedCutPricesCarcass() { //Carcass Predicted
  const text = `
  SELECT EXTRACT(WEEK FROM price_date) as x, avg_cutout_carcass as y, EXTRACT(WEEK FROM CURRENT_DATE) as current_week
  FROM market.weekly_cut_predicted
  WHERE price_date BETWEEN (CURRENT_DATE - interval '5 weeks') AND (CURRENT_DATE + interval '5 weeks')
  GROUP BY x, y
  ORDER BY x
  ` ;
  const values = []; const results = await getMultiQuery(text, values);
  return results;
}
async function getGraphWeeklyActualCutPricesCarcass() {  //Carcass Actual
  const text = `
  SELECT EXTRACT(WEEK FROM price_date) as x, avg_cutout_carcass as y, EXTRACT(WEEK FROM CURRENT_DATE) as current_week
  FROM market.weekly_cut_actual
  WHERE price_date BETWEEN (CURRENT_DATE - interval '5 weeks') AND (CURRENT_DATE + interval '5 weeks')
  GROUP BY x, y
  ORDER BY x
  ` ;
  const values = []; const results = await getMultiQuery(text, values);
  return results;
}
async function getGraphWeeklyPredictedCutPricesLoin() { //Loin Predicted
  const text = `
  SELECT EXTRACT(WEEK FROM price_date) as x, avg_cutout_loin as y, EXTRACT(WEEK FROM CURRENT_DATE) as current_week
  FROM market.weekly_cut_predicted
  WHERE price_date BETWEEN (CURRENT_DATE - interval '5 weeks') AND (CURRENT_DATE + interval '5 weeks')
  GROUP BY x, y
  ORDER BY x
  ` ;
  const values = []; const results = await getMultiQuery(text, values);
  return results;
}
async function getGraphWeeklyActualCutPricesLoin() { //Loin Actual
  const text = `
  SELECT EXTRACT(WEEK FROM price_date) as x, avg_cutout_loin as y, EXTRACT(WEEK FROM CURRENT_DATE) as current_week
  FROM market.weekly_cut_actual
  WHERE price_date BETWEEN (CURRENT_DATE - interval '5 weeks') AND (CURRENT_DATE + interval '5 weeks')
  GROUP BY x, y
  ORDER BY x
  ` ;
  const values = []; const results = await getMultiQuery(text, values);
  return results;
}
/*
const text = `
  SELECT EXTRACT(MONTH FROM created_on) as x, SUM(purchase_quantity) as y
  FROM store.product_purchase
  WHERE extract(year from created_on) = $1
  GROUP BY x
  ` ;
  */

//INSERT
async function insertWeeklyCutPredicted(avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date) {
  const text = `
    INSERT INTO market.weekly_cut_predicted (avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING weekly_cut_predicted_id
  `;
  const values = [avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date];
  const results = await getSingleQuery(text, values);
  return results;
}
async function insertWeeklyCutActual(avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date) {
  const text = `
    INSERT INTO market.weekly_cut_actual (avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING weekly_cut_actual_id
  `;
  const values = [avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date];
  const results = await getSingleQuery(text, values);
  return results;
}
async function insertDailyCutPredicted(avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date) {
  const text = `
    INSERT INTO market.daily_cut_predicted (avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING daily_cut_predicted_id
  `;
  const values = [avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date];
  const results = await getSingleQuery(text, values);
  return results;
}
async function insertDailyCutActual(avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date) {
  const text = `
    INSERT INTO market.daily_cut_actual (avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING daily_cut_actual_id
  `;
  const values = [avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date];
  const results = await getSingleQuery(text, values);
  return results;
}

module.exports = { //INSERT Statements
  recreateDatabase : recreateDatabase,
  //SELECT
  getAllWeeklyPredictedCutPrices,
  getAllWeeklyActualCutPrices,
  getAllDailyPredictedCutPrices,
  getAllDailyActualCutPrices,
  getGraphWeeklyPredictedCutPricesCarcass, //Carcass
  getGraphWeeklyActualCutPricesCarcass,
  getGraphWeeklyPredictedCutPricesLoin, //Loin
  getGraphWeeklyActualCutPricesLoin,
  //INSERT
  insertWeeklyCutPredicted,
  insertWeeklyCutActual,
  insertDailyCutPredicted,
  insertDailyCutActual
  //DELETE
};

//testing :
async function testQuery() {
  const results = await getAllUserLogs();
  console.log(results);
  const other = await updateUserLogsOut(1);
  console.log(other);
}


//reads in .sql file and submits that as a query
var sqlfile = fs.readFileSync('./db_postgresql_scripts/recreate-db.sql').toString();
//recreate database :
async function recreateDatabase() {
  //const results = await getAllUsers();
  //console.log(results);
  try {
    const results = await getMultiQuery(sqlfile, null);
    return results;
  }
  catch (error) {
    console.log("recreateDatabase Failed : " + error);
    return undefined;
  }
}


/*
//product SELECT
async function getAllProducts() {
  const text = 'SELECT * FROM store.product';
  const values = null;
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllProducts Failed : " + error);
    return undefined;
  }
}

//product_purchase SELECT
async function getSingleProductPurchasedById(product_purchase_id) {
  const text = `
  SELECT * FROM store.product_purchase
  WHERE product_purchase_id = $1
  ` ;
  const values = [product_purchase_id];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleProductsPurchasedById Failed : " + error);
    return undefined;
  }
}
async function getAllProductsPurchasedByUserId(user_data_id) {
  const text = `
  SELECT * FROM store.product P
  LEFT JOIN store.product_purchase PP ON PP.product_id = P.product_id
  WHERE PP.user_data_id = $1
  ` ;
  const values = [user_data_id];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllProductsPurchasedByUserId Failed : " + error);
    return undefined;
  }
}
async function getSingleSumProductsPurchased() {
  const text = `
  SELECT SUM(purchase_quantity) 
  FROM store.product_purchase
  ` ;
  const values = [];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleSumProductsPurchased Failed : " + error);
    return undefined;
  }
}
async function getSingleSumProductsPurchasedByAUsers() {
  const text = `
  SELECT SUM(purchase_quantity) 
  FROM store.product_purchase SPP
  LEFT JOIN application.user_data AUD ON AUD.user_data_id = SPP.user_data_id
  LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
  WHERE ATA.test_type = 'site-A.css'
  ` ;
  const values = [];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleSumProductsPurchasedByAUsers Failed : " + error);
    return undefined;
  }
}
async function getSingleSumProductsPurchasedByBUsers() {
  const text = `
  SELECT SUM(purchase_quantity) 
  FROM store.product_purchase SPP
  LEFT JOIN application.user_data AUD ON AUD.user_data_id = SPP.user_data_id
  LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
  WHERE ATA.test_type = 'site-B.css'
  ` ;
  const values = [];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleSumProductsPurchasedByBUsers Failed : " + error);
    return undefined;
  }
}
//now sums based on months
async function getAllSumProductsPurchasedMonthlyByYear(year) { //redundant
  const text = `
  SELECT EXTRACT(MONTH FROM created_on) as x, SUM(purchase_quantity) as y
  FROM store.product_purchase
  WHERE extract(year from created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllSumProductsPurchasedMonthlyByYear Failed : " + error);
    return undefined;
  }
}
async function getAllSumProductsPurchasedMonthlyByAUsersByYear(year) { //redundant
  const text = `
  SELECT EXTRACT(MONTH FROM SPP.created_on) as x, SUM(SPP.purchase_quantity) as y
  FROM store.product_purchase SPP
  LEFT JOIN application.user_data AUD ON AUD.user_data_id = SPP.user_data_id
  LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
  WHERE ATA.test_type = 'site-A.css'
      AND extract(year from SPP.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllSumProductsPurchasedMonthlyByAUsersByYear Failed : " + error);
    return undefined;
  }
}
async function getAllSumProductsPurchasedMonthlyByBUsersByYear(year) { //redundant
  const text = `
  SELECT EXTRACT(MONTH FROM SPP.created_on) as x, SUM(SPP.purchase_quantity) as y
  FROM store.product_purchase SPP
  LEFT JOIN application.user_data AUD ON AUD.user_data_id = SPP.user_data_id
  LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
  WHERE ATA.test_type = 'site-B.css'
      AND extract(year from SPP.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllSumProductsPurchasedMonthlyByBUsersByYear Failed : " + error);
    return undefined;
  }
}
async function getAllAverageSumProductsPurchasedMonthlyByYear(year) { //total users
  const text = `
  SELECT EXTRACT(MONTH FROM created_on) as x, SUM(purchase_quantity) as y,
      COUNT(*) as users
  FROM store.product_purchase
  WHERE extract(year from created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllAverageSumProductsPurchasedMonthlyByYear Failed : " + error);
    return undefined;
  }
}
async function getAllAverageSumProductsPurchasedMonthlyByAUsersByYear(year) { //site-A users
  const text = `
  SELECT EXTRACT(MONTH FROM SPP.created_on) as x, SUM(SPP.purchase_quantity) as y,
      COUNT(*) as users
  FROM store.product_purchase SPP
  LEFT JOIN application.user_data AUD ON AUD.user_data_id = SPP.user_data_id
  LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
  WHERE ATA.test_type = 'site-A.css'
      AND extract(year from SPP.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllAverageSumProductsPurchasedMonthlyByAUsersByYear Failed : " + error);
    return undefined;
  }
}
async function getAllAverageSumProductsPurchasedMonthlyByBUsersByYear(year) { //site-B users
  const text = `
  SELECT EXTRACT(MONTH FROM SPP.created_on) as x, SUM(SPP.purchase_quantity) as y,
      COUNT(*) as users
  FROM store.product_purchase SPP
  LEFT JOIN application.user_data AUD ON AUD.user_data_id = SPP.user_data_id
  LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
  WHERE ATA.test_type = 'site-B.css'
      AND extract(year from SPP.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllAverageSumProductsPurchasedMonthlyByBUsersByYear Failed : " + error);
    return undefined;
  }
}
//Profit by Month
async function getAllAverageProfitProductsPurchasedMonthlyByYear(year) { //total users
  const text = `
  SELECT EXTRACT(MONTH FROM SPP.created_on) as x, SUM((SPP.purchase_quantity * SP.price)/100) as y,
      COUNT(*) as users
  FROM store.product_purchase SPP
      LEFT JOIN store.product SP ON SP.product_id = SPP.product_id
  WHERE extract(year from SPP.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllAverageSumProductsPurchasedMonthlyByYear Failed : " + error);
    return undefined;
  }
}
async function getAllAverageProfitProductsPurchasedMonthlyByAUsersByYear(year) { //site-A users
  const text = `
  SELECT EXTRACT(MONTH FROM SPP.created_on) as x, SUM((SPP.purchase_quantity * SP.price)/100) as y,
      COUNT(*) as users
  FROM store.product_purchase SPP
      LEFT JOIN store.product SP ON SP.product_id = SPP.product_id
      LEFT JOIN application.user_data AUD ON AUD.user_data_id = SPP.user_data_id
      LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
  WHERE ATA.test_type = 'site-A.css'
      AND extract(year from SPP.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllAverageSumProductsPurchasedMonthlyByYear Failed : " + error);
    return undefined;
  }
}
async function getAllAverageProfitProductsPurchasedMonthlyByBUsersByYear(year) { //site-B users
  const text = `
  SELECT EXTRACT(MONTH FROM SPP.created_on) as x, SUM((SPP.purchase_quantity * SP.price)/100) as y,
      COUNT(*) as users
  FROM store.product_purchase SPP
      LEFT JOIN store.product SP ON SP.product_id = SPP.product_id
      LEFT JOIN application.user_data AUD ON AUD.user_data_id = SPP.user_data_id
      LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
  WHERE ATA.test_type = 'site-B.css'
      AND extract(year from SPP.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllAverageSumProductsPurchasedMonthlyByYear Failed : " + error);
    return undefined;
  }
}











//product_category SELECT
async function getAllCategories() {
  const text = 'SELECT * FROM store.category';
  const values = null;
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllCategories Failed : " + error);
    return undefined;
  }
}

//product + product_category SELECT
async function getAllCategoryProducts(category_id) {
  const text = `
  SELECT * FROM store.product P
  LEFT JOIN store.product_category C ON C.product_id = P.product_id
  WHERE C.category_id = $1
  ` ;
  const values = [category_id];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllCategoryProducts Failed : " + error);
    return undefined;
  }
}
















//user_data SELECT
async function getAllUsers() {
  const text = 'SELECT * FROM application.user_data';
  const values = null;
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllUsers Failed : " + error);
    return undefined;
  }
}
async function getCountAllUserTypes() {
  const text = `
  SELECT (SELECT COUNT(*) FROM application.user_data) as total,
      (SELECT COUNT(*) 
      FROM application.user_data AUD
      LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
      WHERE ATA.test_type = 'site-A.css') as total_a,
      (SELECT COUNT(*) 
      FROM application.user_data AUD
      LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
      WHERE ATA.test_type = 'site-B.css') as total_b
  ` ;
  const values = [];
  try { 
    const results = await getSingleQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("getCountAllUserTypes Failed : " + error);
    return undefined;
  }
}
        //Count new users joined monthly total, A, and B users
async function getAllAverageSumUsersJoinedMonthlyByYear(year) { //All users
  const text = `
  SELECT EXTRACT(MONTH FROM AUD.created_on) as x, COUNT(*) as y
  FROM application.user_data AUD
      WHERE extract(year from AUD.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try { 
    const results = await getMultiQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("getAllAverageSumUsersJoinedMonthlyByYear Failed : " + error);
    return undefined;
  }
}
    async function getAllAverageSumUsersJoinedMonthlyByAUsersByYear(year) { //site-A users
      const text = `
      SELECT EXTRACT(MONTH FROM AUD.created_on) as x, COUNT(*) as y
      FROM application.user_data AUD
      LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
      WHERE ATA.test_type = 'site-A.css'
          AND extract(year from AUD.created_on) = $1
      GROUP BY x
      ` ;
      const values = [year];
      try { 
        const results = await getMultiQuery(text, values); 
        return results;
      }
      catch (error) {
        console.log("getAllAverageSumUsersJoinedMonthlyByAUsersByYear Failed : " + error);
        return undefined;
      }
    }
    async function getAllAverageSumUsersJoinedMonthlyByBUsersByYear(year) { //site-B users
      const text = `
      SELECT EXTRACT(MONTH FROM AUD.created_on) as x, COUNT(*) as y
      FROM application.user_data AUD
      LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
      WHERE ATA.test_type = 'site-B.css'
          AND extract(year from AUD.created_on) = $1
      GROUP BY x
      ` ;
      const values = [year];
      try { 
        const results = await getMultiQuery(text, values); 
        return results;
      }
      catch (error) {
        console.log("getAllAverageSumUsersJoinedMonthlyByBUsersByYear Failed : " + error);
        return undefined;
      }
    }
        //Count total user_logs monthly (can do average as well. Maybe clicks next?)
async function getAllAverageCountUserLogsMonthlyByYear(year) { //All users
  const text = `
  SELECT EXTRACT(MONTH FROM AUL.created_on) as x, COUNT(*) as y, COUNT(DISTINCT AUL.user_data_id) as users
  FROM application.user_logs AUL
      WHERE extract(year from AUL.created_on) = $1
  GROUP BY x
  ` ;
  const values = [year];
  try { 
    const results = await getMultiQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("getAllAverageCountUserLogsMonthlyByYear Failed : " + error);
    return undefined;
  }
}
    async function getAllAverageCountUserLogsMonthlyByAUsersByYear(year) { //site-A users
      const text = `
      SELECT EXTRACT(MONTH FROM AUL.created_on) as x, COUNT(*) as y, COUNT(DISTINCT AUL.user_data_id) as users
      FROM application.user_logs AUL
      LEFT JOIN application.user_data AUD ON AUD.user_data_id = AUL.user_data_id
      LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
      WHERE ATA.test_type = 'site-A.css'
          AND extract(year from AUL.created_on) = $1
      GROUP BY x
      ` ;
      const values = [year];
      try { 
        const results = await getMultiQuery(text, values); 
        return results;
      }
      catch (error) {
        console.log("getAllAverageCountUserLogsMonthlyByAUsersByYear Failed : " + error);
        return undefined;
      }
    }
    async function getAllAverageCountUserLogsMonthlyByBUsersByYear(year) { //site-B users
      const text = `
      SELECT EXTRACT(MONTH FROM AUL.created_on) as x, COUNT(*) as y, COUNT(DISTINCT AUL.user_data_id) as users
      FROM application.user_logs AUL
      LEFT JOIN application.user_data AUD ON AUD.user_data_id = AUL.user_data_id
      LEFT JOIN application.testing_ab ATA ON ATA.user_data_id = AUD.user_data_id
      WHERE ATA.test_type = 'site-B.css'
          AND extract(year from AUL.created_on) = $1
      GROUP BY x
      ` ;
      const values = [year];
      try { 
        const results = await getMultiQuery(text, values); 
        return results;
      }
      catch (error) {
        console.log("getAllAverageCountUserLogsMonthlyByBUsersByYear Failed : " + error);
        return undefined;
      }
    }


//product_visits SELECT  (analytics)
async function getAllMostViewedProductsMonthlyByYear(year) { //most visited product monthly
  const text = `
  WITH Visits_CTE (month, count, name, category)
  AS
  (
      SELECT EXTRACT(MONTH FROM SPV.created_on) as x, COUNT(SP.name) as y, SP.name,  SC.category_name
          FROM store.product_visits SPV
          LEFT JOIN store.product_category SPC ON SPC.product_id = SPV.product_id
          LEFT JOIN store.product SP ON SP.product_id = SPC.product_id
          LEFT JOIN store.category SC ON SC.category_id = SPC.category_id
              WHERE extract(year from SPV.created_on) = $1
      GROUP BY x, SP.name, SC.category_name
      ORDER BY x ASC, y DESC
  )
      SELECT CTE.month, b.counts, CTE.name, b.category
      FROM Visits_CTE CTE
      INNER JOIN (
          SELECT CTEE.month, CTEE.category, Max(CTEE.count) as counts
          FROM Visits_CTE CTEE
          GROUP BY CTEE.category, CTEE.month
          Having CTEE.category = 'Computers'
      ) b on CTE.month = b.months AND CTE.category = b.category AND CTE.count = b.counts
      GROUP BY CTE.month
  ` ;
  const values = [year];
  try { 
    const results = await getMultiQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("getAllMostViewedProductsMonthlyByYear Failed : " + error);
    return undefined;
  }
}
async function getAllMostViewedComputerProductsMonthlyByYear(year) { //most visited product monthly
  const text = `
    
    SELECT DISTINCT ON (x) x,
        cot,
        nam
    FROM (
      SELECT EXTRACT(month FROM SPV.created_on) as x, 
          Count(*) as cot
          , SP.name as nam
          FROM store.product_visits SPV
          LEFT JOIN store.product_category SPC ON SPC.product_id = SPV.product_id
          LEFT JOIN store.product SP ON SP.product_id = SPC.product_id
          LEFT JOIN store.category SC ON SC.category_id = SPC.category_id
              WHERE extract(year from SPV.created_on) = $1
                AND SC.category_name = 'Computers'
      GROUP BY x, SP.name
      ORDER BY x ASC
    ) testTable
    ORDER BY x ASC, cot DESC
  ` ;
  const values = [year];
  try { 
    const results = await getMultiQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("getAllMostViewedComputerProductsMonthlyByYear Failed : " + error);
    return undefined;
  }
}
async function getAllMostViewedMonitorProductsMonthlyByYear(year) { //most visited product monthly
  const text = `
    
    SELECT DISTINCT ON (x) x,
        cot,
        nam
    FROM (
      SELECT EXTRACT(month FROM SPV.created_on) as x, 
          Count(*) as cot
          , SP.name as nam
          FROM store.product_visits SPV
          LEFT JOIN store.product_category SPC ON SPC.product_id = SPV.product_id
          LEFT JOIN store.product SP ON SP.product_id = SPC.product_id
          LEFT JOIN store.category SC ON SC.category_id = SPC.category_id
              WHERE extract(year from SPV.created_on) = $1
                AND SC.category_name = 'Monitors'
      GROUP BY x, SP.name
      ORDER BY x ASC
    ) testTable
    ORDER BY x ASC, cot DESC
  ` ;
  const values = [year];
  try { 
    const results = await getMultiQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("getAllMostViewedMonitorProductsMonthlyByYear Failed : " + error);
    return undefined;
  }
}
async function getAllMostViewedKeyboardProductsMonthlyByYear(year) { //most visited product monthly
  const text = `
    
    SELECT DISTINCT ON (x) x,
        cot,
        nam
    FROM (
      SELECT EXTRACT(month FROM SPV.created_on) as x, 
          Count(*) as cot
          , SP.name as nam
          FROM store.product_visits SPV
          LEFT JOIN store.product_category SPC ON SPC.product_id = SPV.product_id
          LEFT JOIN store.product SP ON SP.product_id = SPC.product_id
          LEFT JOIN store.category SC ON SC.category_id = SPC.category_id
              WHERE extract(year from SPV.created_on) = $1
                AND SC.category_name = 'KeyBoards'
      GROUP BY x, SP.name
      ORDER BY x ASC
    ) testTable
    ORDER BY x ASC, cot DESC
  ` ;
  const values = [year];
  try { 
    const results = await getMultiQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("getAllMostViewedKeyboardProductsMonthlyByYear Failed : " + error);
    return undefined;
  }
}









//user_logs SELECT 
async function getAllUserLogs() {
  const text = 'SELECT * FROM application.user_logs';
  const values = null;
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getAllProducts Failed : " + error);
    return undefined;
  }
}

//product SELECT
async function getSingleProductById(product_id) {
  const text = 'SELECT * FROM store.product WHERE product_id = $1';
  const values = [product_id];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleProductById Failed : " + error);
    return undefined;
  }
}
//user_data SELECT
async function getSingleUserByEmail(email) {
  const text = 'SELECT * FROM application.user_data WHERE email = $1';
  const values = [email];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleUserByEmail Failed : " + error);
    return undefined;
  }
}
//user_data SELECT
async function getSingleUserById(user_data_id) {
  const text = 'SELECT * FROM application.user_data WHERE user_data_id = $1';
  const values = [user_data_id];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleUserById Failed : " + error);
    return undefined;
  }
}

//testing_ab SELECT
async function getSingleUserTestTypeById(user_data_id) {
  const text = 'SELECT * FROM application.testing_ab WHERE user_data_id = $1 ORDER BY testing_ab_id DESC Limit 1';
  const values = [user_data_id];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleUserTestTypeById Failed : " + error);
    return undefined;
  }
}
async function getSingleSumABUsers() {
  const text = `SELECT 
        COUNT(*) as sum_total,
        SUM(CASE WHEN test_type = 'site-A.css' THEN 1 ELSE 0 END) as sum_a,
        SUM(CASE WHEN test_type = 'site-B.css' THEN 1 ELSE 0 END) as sum_b
      FROM 
        application.testing_ab
      `;
  const values = null;
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("getSingleSumABUsers Failed : " + error);
    return undefined;
  }
}

//testing_ab UPDATE
async function updateResetABUsers(testType) {
  const text = `
    UPDATE application.testing_ab SET test_type = $1
    RETURNING testing_ab_id
  `;
  const values = [testType];
  try {
    const results = await getMultiQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("updateResetABUsers Failed : " + error);
    return undefined;
  }
}
async function updateNewABSession(testType, numBUsers) {
  const text = `
    UPDATE application.testing_ab SET test_type = $1
    WHERE testing_ab_id BETWEEN 1 AND $2
    RETURNING testing_ab_id
  `;
  const values = [testType, numBUsers];
  try {
    const results = await getMultiQuery(text, values); //returns multiple entries
    return results;
  }
  catch (error) {
    console.log("updateNewABSession Failed : " + error);
    return undefined;
  }
}



//user_data INSERT
async function insertNewUser(first_name, last_name, email, crypted_password, is_admin) {
  const text = `
      INSERT INTO application.user_data (first_name, last_name, email, crypted_password, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_data_id
    `;
  const values = [first_name, last_name, email, crypted_password, is_admin];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewUser Failed : " + error);
    return undefined;
  }
}
//user_data UPDATE
async function updateUser(user_data_id, first_name, last_name, email, is_admin) {
  const text = `
    UPDATE application.user_data SET first_name = $2, last_name = $3, email = $4, is_admin = $5, updated_on = CURRENT_TIMESTAMP 
    WHERE user_data_id = $1 
    RETURNING user_data_id
  `;
  const values = [user_data_id, first_name, last_name, email, is_admin];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("updateUser Failed : " + error);
    return undefined;
  }
}

//product INSERT
async function insertNewProduct(name, description, price, picture_path) {
  const text = `
      INSERT INTO store.product (name, description, price, picture_path)
      VALUES ($1, $2, $3, $4)
      RETURNING product_id
    `;
  const values = [name, description, price, picture_path];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewProduct Failed : " + error);
    return undefined;
  }
}

//category INSERT
async function insertNewCategory(category_name) {
  const text = `
    INSERT INTO store.category (category_name)
    VALUES ($1)
    RETURNING category_id
  `;
  const values = [category_name];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewCategory Failed : " + error);
    return undefined;
  }
}

//product_category INSERT
async function insertNewProductCategory(product_id, category_id) {
  const text = `
    INSERT INTO store.product_category (product_id, category_id)
    VALUES ($1, $2)
    RETURNING category_id
  `;
  const values = [product_id, category_id];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewProductCategory Failed : " + error);
    return undefined;
  }
}

//testing_ab INSERT
async function insertNewTestingAB(user_data_id, test_type) {
  const text = `
    INSERT INTO application.testing_ab (user_data_id, test_type)
    VALUES ($1, $2)
    RETURNING user_data_id
  `;
  const values = [user_data_id, test_type];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewTestingAB Failed : " + error);
    return undefined;
  }
}

//product_purchase INSERT
async function insertNewProductPurchase(product_id, user_data_id, purchase_quantity, purchase_status) {
  const text = `
    INSERT INTO store.product_purchase (product_id, user_data_id, purchase_quantity, purchase_status)
    VALUES ($1, $2, $3, $4)
    RETURNING product_purchase_id
  `;
  const values = [product_id, user_data_id, purchase_quantity, purchase_status];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewProductPurchase Failed : " + error);
    return undefined;
  }
}

//user_logs INSERT
async function insertNewUserLog(user_data_id) {
  const text = `
    INSERT INTO application.user_logs (user_data_id)
    VALUES ($1)
    RETURNING user_logs_id
  `;
  const values = [user_data_id];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewUserLog Failed : " + error);
    return undefined;
  }
}
//https://stackoverflow.com/questions/36739012/how-to-update-latest-record-using-postgresql
//user_logs UPDATE
async function updateUserLogsOut(user_data_id) {
  const text = `
    UPDATE application.user_logs SET updated_on = CURRENT_TIMESTAMP 
    WHERE user_logs_id = (
      SELECT max(user_logs_id) 
      FROM application.user_logs
      WHERE user_data_id = $1
    )
    RETURNING user_logs_id
  `;
  const values = [user_data_id];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("updateUserLogsOut Failed : " + error);
    return undefined;
  }
}

//user_clicks INSERT
async function insertNewCoordinates(user_data_id, location_x, location_y, screen_width, screen_height, navigate_to) {
  const text = `
    INSERT INTO application.user_clicks (user_data_id, location_x, location_y, screen_width, screen_height, navigate_to)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING user_data_id
  `;
  const values = [user_data_id, location_x, location_y, screen_width, screen_height, navigate_to];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewCoordinates Failed : " + error);
    return undefined;
  }
}

//product_visits INSERT
async function insertNewProductVisit(product_id, user_data_id) {
  const text = `
    INSERT INTO store.product_visits (product_id, user_data_id)
    VALUES ($1, $2)
    RETURNING product_visits_id
  `;
  const values = [product_id, user_data_id];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("insertNewProductVisit Failed : " + error);
    return undefined;
  }
}

//DEBUG Queries
//Product_Purchase UPDATE Month
async function debugUpdateProductPurchaseDate(product_purchase_id, month) { //retains the timestamp hour,min,sec
  const text = `
    UPDATE store.product_purchase SET created_on = $2::timestamp + 
                    EXTRACT(HOUR FROM created_on) * INTERVAL '1 HOUR' +
                    EXTRACT(MINUTE FROM created_on) * INTERVAL '1 MINUTE' +
                    EXTRACT(SECOND FROM created_on) * INTERVAL '1 SECOND'
    WHERE product_purchase_id = $1 
    RETURNING created_on
  `;
  const values = [product_purchase_id, month];
  try {
    const results = await getSingleQuery(text, values);
    return results;
  }
  catch (error) {
    console.log("debugUpdateProductPurchaseDate Failed : " + error);
    return undefined;
  }
}
//user_data UPDATE Month
async function debugUpdateUserCreatedDate(user_data_id, month) { //retains the timestamp hour,min,sec
  const text = `
    UPDATE application.user_data SET created_on = $2::timestamp + 
                    EXTRACT(HOUR FROM created_on) * INTERVAL '1 HOUR' +
                    EXTRACT(MINUTE FROM created_on) * INTERVAL '1 MINUTE' +
                    EXTRACT(SECOND FROM created_on) * INTERVAL '1 SECOND'
    WHERE user_data_id = $1 
    RETURNING created_on
  `;
  const values = [user_data_id, month];
  try { 
    const results = await getSingleQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("debugUpdateUserCreatedDate Failed : " + error);
    return undefined;
  }
}
async function debugUpdateUserLogsCreatedDate(user_logs_id, month) { //retains the timestamp hour,min,sec
  const text = `
    UPDATE application.user_logs SET created_on = $2::timestamp + 
                    EXTRACT(HOUR FROM created_on) * INTERVAL '1 HOUR' +
                    EXTRACT(MINUTE FROM created_on) * INTERVAL '1 MINUTE' +
                    EXTRACT(SECOND FROM created_on) * INTERVAL '1 SECOND'
    WHERE user_logs_id = $1 
    RETURNING created_on
  `;
  const values = [user_logs_id, month];
  try { 
    const results = await getSingleQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("debugUpdateUserLogCreatedDate Failed : " + error);
    return undefined;
  }
}
async function debugUpdateProductVisitCreatedDate(product_visits_id, month) {
  const text = `
    UPDATE store.product_visits SET created_on = $2::timestamp + 
                    EXTRACT(HOUR FROM created_on) * INTERVAL '1 HOUR' +
                    EXTRACT(MINUTE FROM created_on) * INTERVAL '1 MINUTE' +
                    EXTRACT(SECOND FROM created_on) * INTERVAL '1 SECOND'
    WHERE product_visits_id = $1 
    RETURNING created_on
  `;
  const values = [product_visits_id, month];
  try { 
    const results = await getSingleQuery(text, values); 
    return results;
  }
  catch (error) {
    console.log("debugUpdateUserLogCreatedDate Failed : " + error);
    return undefined;
  }
}
*/


//https://www.postgresql.org/docs/9.1/sql-update.html
//RETURNING can return multiple values !!
/*
UPDATE weather SET temp_lo = temp_lo+1, temp_hi = temp_lo+15, prcp = DEFAULT
  WHERE city = 'San Francisco' AND date = '2003-07-03'
  RETURNING temp_lo, temp_hi, prcp;
*/

//https://www.thisdot.co/blog/connecting-to-postgresql-with-node-js


//https://stackoverflow.com/questions/19903279/postgresql-fast-way-to-update-the-latest-inserted-row/19903399

/** @module postgres-connections
 * A module providing access to all the methods for SELECT, INSERT, UPDATE, etc. 
 */
/*
module.exports = { //INSERT Statements
  recreateDatabase : recreateDatabase,
  insertNewUser : insertNewUser,
  insertNewProduct : insertNewProduct,
  insertNewProductPurchase : insertNewProductPurchase,
  insertNewUserLog : insertNewUserLog,
  insertNewCoordinates : insertNewCoordinates,
  insertNewCategory : insertNewCategory,
  insertNewProductCategory : insertNewProductCategory,
  insertNewTestingAB : insertNewTestingAB,
  insertNewProductVisit : insertNewProductVisit,
  getAllProducts : getAllProducts,
  getAllCategories : getAllCategories,
  getAllCategoryProducts : getAllCategoryProducts,
  getAllUsers : getAllUsers,
  getAllProductsPurchasedByUserId : getAllProductsPurchasedByUserId,
  getAllUserLogs : getAllUserLogs,
  getSingleProductById : getSingleProductById,
  getSingleProductPurchasedById : getSingleProductPurchasedById,
  getSingleUserByEmail : getSingleUserByEmail,
  getSingleUserById : getSingleUserById,
  getSingleUserTestTypeById : getSingleUserTestTypeById,
  getSingleSumABUsers : getSingleSumABUsers,
  getSingleSumProductsPurchased : getSingleSumProductsPurchased,
  getSingleSumProductsPurchasedByAUsers : getSingleSumProductsPurchasedByAUsers,
  getSingleSumProductsPurchasedByBUsers : getSingleSumProductsPurchasedByBUsers,
  getAllSumProductsPurchasedMonthlyByYear : getAllSumProductsPurchasedMonthlyByYear,
  getAllSumProductsPurchasedMonthlyByAUsersByYear : getAllSumProductsPurchasedMonthlyByAUsersByYear,  
  getAllSumProductsPurchasedMonthlyByBUsersByYear : getAllSumProductsPurchasedMonthlyByBUsersByYear,
  getAllAverageSumProductsPurchasedMonthlyByYear : getAllAverageSumProductsPurchasedMonthlyByYear, //Sum product_purchase
  getAllAverageSumProductsPurchasedMonthlyByAUsersByYear : getAllAverageSumProductsPurchasedMonthlyByAUsersByYear,
  getAllAverageSumProductsPurchasedMonthlyByBUsersByYear : getAllAverageSumProductsPurchasedMonthlyByBUsersByYear,
  getAllAverageProfitProductsPurchasedMonthlyByYear : getAllAverageProfitProductsPurchasedMonthlyByYear, //Profit product_purchase
  getAllAverageProfitProductsPurchasedMonthlyByAUsersByYear : getAllAverageProfitProductsPurchasedMonthlyByAUsersByYear,
  getAllAverageProfitProductsPurchasedMonthlyByBUsersByYear : getAllAverageProfitProductsPurchasedMonthlyByBUsersByYear,
  getCountAllUserTypes : getCountAllUserTypes,
  getAllAverageSumUsersJoinedMonthlyByYear : getAllAverageSumUsersJoinedMonthlyByYear, //users joined
  getAllAverageSumUsersJoinedMonthlyByAUsersByYear : getAllAverageSumUsersJoinedMonthlyByAUsersByYear,
  getAllAverageSumUsersJoinedMonthlyByBUsersByYear : getAllAverageSumUsersJoinedMonthlyByBUsersByYear,
  getAllAverageCountUserLogsMonthlyByYear : getAllAverageCountUserLogsMonthlyByYear, //user logs
  getAllAverageCountUserLogsMonthlyByAUsersByYear : getAllAverageCountUserLogsMonthlyByAUsersByYear,
  getAllAverageCountUserLogsMonthlyByBUsersByYear : getAllAverageCountUserLogsMonthlyByBUsersByYear,
  getAllMostViewedProductsMonthlyByYear : getAllMostViewedProductsMonthlyByYear, //product visits
  getAllMostViewedComputerProductsMonthlyByYear : getAllMostViewedComputerProductsMonthlyByYear,
  getAllMostViewedMonitorProductsMonthlyByYear : getAllMostViewedMonitorProductsMonthlyByYear,
  getAllMostViewedKeyboardProductsMonthlyByYear : getAllMostViewedKeyboardProductsMonthlyByYear,
  updateUserLogsOut : updateUserLogsOut,
  updateResetABUsers : updateResetABUsers,
  updateNewABSession : updateNewABSession,
  debugUpdateProductPurchaseDate : debugUpdateProductPurchaseDate,
  debugUpdateUserCreatedDate : debugUpdateUserCreatedDate,
  debugUpdateUserLogsCreatedDate : debugUpdateUserLogsCreatedDate,
  debugUpdateProductVisitCreatedDate : debugUpdateProductVisitCreatedDate
}
*/
/*
//Testing Section:
async function testQuery() {
  const results = await getAllUserLogs();
  console.log(results);
  const other = await updateUserLogsOut(1);
  console.log(other);
}


var sqlfile = fs.readFileSync('./db_postgresql_scripts/test.sql').toString();
//recreate database :
async function recreateDatabase() {
  //const results = await getAllUsers();
  //console.log(results);
  try {
    const results = await getMultiQuery(sqlfile, null);
    return results;
  }
  catch (error) {
    console.log("recreateDatabase Failed : " + error);
    return undefined;
  }
}
//recreateDatabase(); //turn off when not using
//testQuery();
*/
/*
module.exports = { //SELECT Statements
  getAllProducts : getAllProducts,
  getSingleUserByEmail : getSingleUserByEmail,
  getSingleUserTestTypeById : getSingleUserTestTypeById
}
*/

/*
//testing pool
async function poolDemo() {
  const pool = new Pool(credentials);
  const now = await pool.query("SELECT NOW()");
  await pool.end();

  return now;
}
//testing client
async function clientDemo() {
  const client = new Client(credentials);
  await client.connect(); //only difference
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}


(async () => {
  const poolResult = await poolDemo();
  console.log("Time with pool: " + poolResult.rows[0]["now"]);

  const clientResult = await clientDemo();
  console.log("Time with client: " + clientResult.rows[0]["now"]);
})();


async function AllUsers() {
  const pool = new Pool(credentials);
  const text = 'SELECT * FROM application.user_data';
  const values = [personId];
  const results = pool.query(text, values);
  await pool.end();
  return results;
}

async function AllProducts() {
  const pool = new Pool(credentials);
  const text = 'SELECT * FROM store.product';
  const values = null;
  const results = pool.query(text, values);
  await pool.end();
  return results;
}


async function checkTime() {
  const pool = new Pool(credentials);
  console.log("running async checkTime()");
  const text = 'SELECT NOW()';
  const values = null;
  const results = pool.query(text, values);
  await pool.end();
  return results;
}
*/