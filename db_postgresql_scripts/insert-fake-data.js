//COMMAND to recreate database : 
//    node ./db_postgresql_scripts/insert-fake-data.js
const postdb = require('../src/postgres-connection');

async function recreateData() {
    console.log("starting");
    await postdb.recreateDatabase(); console.log("recreate DONE");
    await insertSomeFakeData(); console.log("recreate DONE");
}

recreateData();
//avg_cutout_carcass, avg_cutout_loin, avg_cutout_butt, avg_cutout_picnic, avg_cutout_rib, avg_cutout_ham, avg_cutout_belly, pounds, price_date
async function insertSomeFakeData() {  
    
    //var month = Math.floor(Math.random() * 100) + 1; //get random month between 1-12 (to change the month of created_on)
    //var newDate = '2022-2-'+ day;
    var ndate = Date()  
    for(let day = 1; day < 29; day++) {
        var carcass = Math.floor(Math.random() * 1000) + 1;
        var loin = Math.floor(Math.random() * 1000) + 1;
        var butt = Math.floor(Math.random() * 1000) + 1;
        var picnic = Math.floor(Math.random() * 1000) + 1;
        var rib = Math.floor(Math.random() * 1000) + 1;
        var ham = Math.floor(Math.random() * 1000) + 1;
        var belly = Math.floor(Math.random() * 1000) + 1;
        var pounds = Math.floor(Math.random() * 1000) + 1;
        var newDate = '2022-2-'+ day;
        await postdb.insertDailyCutActual(carcass,loin,butt,picnic,rib,ham,belly,pounds,newDate);
    }
    for(let day = 1; day < 29; day++) {
        var carcass = Math.floor(Math.random() * 1000) + 1;
        var loin = Math.floor(Math.random() * 1000) + 1;
        var butt = Math.floor(Math.random() * 1000) + 1;
        var picnic = Math.floor(Math.random() * 1000) + 1;
        var rib = Math.floor(Math.random() * 1000) + 1;
        var ham = Math.floor(Math.random() * 1000) + 1;
        var belly = Math.floor(Math.random() * 1000) + 1;
        var pounds = Math.floor(Math.random() * 1000) + 1;
        var newDate = '2022-2-'+ day;
        await postdb.insertDailyCutPredicted(carcass,loin,butt,picnic,rib,ham,belly,pounds,newDate);
    }
    for(let day = 1; day < 29; day += 7) {
        var carcass = Math.floor(Math.random() * 1000) + 1;
        var loin = Math.floor(Math.random() * 1000) + 1;
        var butt = Math.floor(Math.random() * 1000) + 1;
        var picnic = Math.floor(Math.random() * 1000) + 1;
        var rib = Math.floor(Math.random() * 1000) + 1;
        var ham = Math.floor(Math.random() * 1000) + 1;
        var belly = Math.floor(Math.random() * 1000) + 1;
        var pounds = Math.floor(Math.random() * 1000) + 1;
        var newDate = '2022-2-'+ day;
        await postdb.insertWeeklyCutActual(carcass,loin,butt,picnic,rib,ham,belly,pounds,newDate);
    }
    for(let day = 1; day < 29; day++) {
        var carcass = Math.floor(Math.random() * 1000) + 1;
        var loin = Math.floor(Math.random() * 1000) + 1;
        var butt = Math.floor(Math.random() * 1000) + 1;
        var picnic = Math.floor(Math.random() * 1000) + 1;
        var rib = Math.floor(Math.random() * 1000) + 1;
        var ham = Math.floor(Math.random() * 1000) + 1;
        var belly = Math.floor(Math.random() * 1000) + 1;
        var pounds = Math.floor(Math.random() * 1000) + 1;
        var newDate = '2/'+day+'/2022';
        await postdb.insertWeeklyCutPredicted(carcass,loin,butt,picnic,rib,ham,belly,pounds,newDate);
    }
}