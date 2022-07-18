const express = require("express");
const mysql = require('mysql2/promise');
const {Kafka} = require("kafkajs");
const app = express();
const PORT = 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(require('path').resolve(__dirname, '.') + "/public"));

/*Users database configuration*/
let dbConfig = {
    host: 'db_users', //change to localhost for local usage
    //host: 'localhost',
    port: 3306, //change to 3306-3307
    //port: 3307,
    user: 'root',
    password: '',
    database: 'user_management'
}

/*producer definition*/
const kafka = new Kafka({
    clientId: 'split-producer',
    /*container and port where kafka broker is listenting*/
    //brokers: ['localhost:9092']
    brokers: ['kafka:29090'] //change kafka:29090 to localhost:9092 to run locally
})

const producer = kafka.producer()
const topic = 'users_topic'; //topic to write messages for all display Microservices to update their users

/*function that produces messages to kafka topic*/
const produceMessage = async (value) => {
    try {
        console.log(value);
        await producer.send({
            topic,
            messages: [
                { value },
            ],
        })
        console.log("Message written to kafka!")
    } catch (error) {
        console.log(error);
    }
}

//endpoint to add a new user to the database
app.post("/choose_display/addUser", async (req, res) => {
    /*get user parameters from the body of the request*/
    let requested_email = req.body.email;
    let requested_first_name = req.body.first_name;
    let requested_last_name = req.body.last_name;
    let results1 = " ";

    /*check if user already exists*/
    let sql = `SELECT * FROM users WHERE email = \'${requested_email}\'`;
    console.log(sql);

    /*create connection to database*/
    let our_dbConn = await mysql.createConnection(dbConfig);
    /*execute the query and wait for it to finish*/
    let [rows, fields] = await our_dbConn.query(sql);
    console.log(rows);
    results1 = rows;

    /*if user already exists just update his last login field*/
    if(rows.length != 0){
        /*get the expiration date to use the same on the Update query so that the dafault currentTimestamp() value will not be used*/
        let rec_date = new Date(rows[0].license_expiration_date);
        rec_date.setMonth(rec_date.getMonth() + 1);
        let expiration_date = rec_date.getFullYear() + "-";

        if(rec_date.getMonth() < 10){
            expiration_date += "0" + rec_date.getMonth() + "-";
        }
        else{ expiration_date += rec_date.getMonth() + "-"; }

        if(rec_date.getDate() < 10){
            expiration_date += "0" + rec_date.getDate() + " ";
        }
        else{ expiration_date += rec_date.getDate() + " "; }

        if(rec_date.getHours() < 10){
            expiration_date += "0" + rec_date.getHours() + ":";
        }
        else{ expiration_date += rec_date.getHours() + ":"; }

        if(rec_date.getMinutes() < 10){
            expiration_date += "0" + rec_date.getMinutes() + ":";
        }
        else{ expiration_date += rec_date.getMinutes() + ":"; }

        if(rec_date.getSeconds() < 10){
            expiration_date += "0" + rec_date.getSeconds();
        }
        else{ expiration_date += rec_date.getSeconds(); }

        /*Update the user and wait for the query to complete*/
        sql = `UPDATE users SET last_login = current_timestamp(), license_expiration_date = \'${expiration_date}' WHERE email = \'${requested_email}\'`;
        console.log(sql);

        let query = await our_dbConn.query(sql);
        res.json(query);
        //destroy the connection to the database
        our_dbConn.destroy();

        /*once the MS's own database has been updated notify the display MSs via kafka to update the last login value of that user*/
        let kafka_message = 'update' + '/' + expiration_date + '/' + requested_email;
        produceMessage(kafka_message);

    }
    /*if the user does not already exist create a new user based on the characteristics given*/
    else{
        //console.log(2);
        sql = `INSERT INTO users (email, first_name, last_name, license_expiration_date , last_login) VALUES (\'${requested_email}\', \'${requested_first_name}\', \'${requested_last_name}\', DATE_ADD(current_timestamp(), INTERVAL 30 DAY) , current_timestamp())`;
        console.log(sql);
        let result = await our_dbConn.query(sql);
        res.json(result);
        //disconnectFromDatabase(our_dbConn);
        our_dbConn.destroy();

        /*notify the display MSs via kafka to update their user databases by also inserting the new user*/
        let kafka_message = 'insert'+ '/' + requested_email + '/' + requested_first_name + '/' + requested_last_name;
        produceMessage(kafka_message);
    }

});

/*endpoint to extend user license*/
app.post("/updateUser", async (req, res) => {
    /*get all user info from POST request body*/
    let requested_email = req.body.email;
    let requested_first_name = req.body.first_name;
    let requested_last_name = req.body.last_name;
    let days_left = req.body.days_left;
    let days_extend = req.body.days_extend;

    /*check if user exists first*/
    let sql = `SELECT * FROM users WHERE email = \'${requested_email}\'`;
    console.log(sql);

    /*create database connection and execute the query*/
    let our_dbConn = await mysql.createConnection(dbConfig);
    let [rows, fields] = await our_dbConn.query(sql);
    res.json(rows);
    console.log(rows);

    /*if user exists*/
    if(rows.length != 0){
        /*get the expiration date to use the same on the Update query so that the dafault currentTimestamp() value will not be used*/
        let rec_date = new Date(rows[0].license_expiration_date);
        rec_date.setMonth(rec_date.getMonth() + 1);
        let expiration_date = rec_date.getFullYear() + "-";

        if(rec_date.getMonth() < 10){
            expiration_date += "0" + rec_date.getMonth() + "-";
        }
        else{ expiration_date += rec_date.getMonth() + "-"; }

        if(rec_date.getDate() < 10){
            expiration_date += "0" + rec_date.getDate() + " ";
        }
        else{ expiration_date += rec_date.getDate() + " "; }

        if(rec_date.getHours() < 10){
            expiration_date += "0" + rec_date.getHours() + ":";
        }
        else{ expiration_date += rec_date.getHours() + ":"; }

        if(rec_date.getMinutes() < 10){
            expiration_date += "0" + rec_date.getMinutes() + ":";
        }
        else{ expiration_date += rec_date.getMinutes() + ":"; }

        if(rec_date.getSeconds() < 10){
            expiration_date += "0" + rec_date.getSeconds();
        }
        else{ expiration_date += rec_date.getSeconds(); }

        console.log(expiration_date);
        /*if user has a valid license extend his previous expiration date by the requested amount*/
        if(days_left>0) {
            console.log(2)
            sql = `UPDATE users SET license_expiration_date = DATE_ADD(\'${expiration_date}\', INTERVAL \'${days_extend}\' DAY) WHERE email = \'${requested_email}\'`;
            let kafka_message = 'updateExists'+ '/' + expiration_date + '/' + days_extend + '/' + requested_email;
            /*notify the display MSs that we extended the license of a user with a valid license*/
            produceMessage(kafka_message);
        }
        /*otherwise give him a new license starting now for the duration he requested*/
        else{
            sql = `UPDATE users SET license_expiration_date = DATE_ADD(current_timestamp(), INTERVAL \'${days_extend}\' DAY) WHERE email = \'${requested_email}\'`;
            let kafka_message = 'updateNotExists' + '/' + days_extend + '/' + requested_email;
            /*notify the display MSs that we grant a license to a user with an expired one*/
            produceMessage(kafka_message);
        }
        console.log(sql);
        /*wait for the query to complete*/
        [rows, fields] = await our_dbConn.query(sql);
        console.log(rows);
    }
    /*if user doesn't exist just log it*/
    else{
        console.log(2);
    }
    /*destroy connection to database*/
    our_dbConn.destroy();
});

/*endpoint to fetch data for a user given his email*/
app.post("/choose_display/checkUser", async (req, res) => {
    let requested_email = req.body.email;

    /*select all users with the given email (will be only one since email is the primary key for the users table)*/
    let sql = `SELECT * FROM users WHERE email = \'${requested_email}\'`;
    console.log(sql);

    /*create connection to database*/
    let our_dbConn2 = await mysql.createConnection(dbConfig);
    let [rows, fields] = await our_dbConn2.query(sql);

    /*return user data*/
    res.json(rows);
    console.log(rows);
    console.log('user checked');
    /*destroy connection to database*/
    our_dbConn2.destroy();
});

/*endpoints to serve the appropriate html page to the client based on his request*/
app.get("/extendProgram", (req, res) => {
    //res.sendFile( require('path').resolve(__dirname) + "/extend_program.html", { token: token});
    res.sendFile( require('path').resolve(__dirname) + "/extend_program.html");
});

app.get("/choose_display/", (req, res) => {
    res.sendFile( require('path').resolve(__dirname, '.') + "/welcome.html");
});

app.post("/choose_display/", (req, res) => {
    res.sendFile( require('path').resolve(__dirname, '.') + "/welcome.html");
});

app.get("/", (req, res) => {
    res.sendFile( require('path').resolve(__dirname, '.') + "/signin2.html");
});

app.post("/", (req, res) => {
    res.sendFile( require('path').resolve(__dirname, '.') + "/signin2.html");
});

/*start the server on the given PORT that will be mapped to a host port via the docker-compose.yml configuration and connect the producer*/
app.listen(PORT, async () => {
    console.log(`Server Started on port: ${PORT}`);
    await producer.connect();
})