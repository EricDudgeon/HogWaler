//COMMAND to recreate database : 
//    node ./db_postgresql_scripts/insert-fake-data.js
const postdb = require('../src/postgres-connection');

async function recreateData() {
    console.log("starting");
    await postdb.recreateDatabase(); console.log("recreate DONE");
    await insertSomeFakeData(); console.log("recreate DONE");
}

recreateData();

async function insertSomeFakeData() {  
    const saltRounds = 10;
    var plaintextPassword = "admin123";
    //var hash = await bcrypt.hashSync(plaintextPassword, saltRounds);
    const hash = await bcrypt.hash(plaintextPassword, saltRounds); //built in await
    //UserData
    var firstN = ["Dave","John","Greg"];
    var lastN = ["Miller","Doe","Shaw"];
    var email = ["dave@ksu.edu","jd@ksu.edu","gs@ksu.edu"];
    var is_admin = [1,0,0];
    for(let i = 0; i < firstN.length; i++) {
        var userResult = await postdb.insertNewUser(firstN[i], lastN[i], email[i], hash, is_admin[i]); //returns .user_data_id
        //console.log(userResult);
        await postdb.insertNewTestingAB(userResult.user_data_id, "site-A.css");
    }
    
    //var month = Math.floor(Math.random() * 100) + 1; //get random month between 1-12 (to change the month of created_on)
    //var newDate = '2022-2-'+ day;
    for(let day = 1; day < 10; day++) {
        var newDate = '2022-2-'+ day;
        var carcass = Math.floor(Math.random() * 1000) + 1;
        var carcass = Math.floor(Math.random() * 1000) + 1;
        await postdb.insertDailyCutActual()
    }
}