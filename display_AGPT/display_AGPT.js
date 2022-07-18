const express = require("express");
const mysql = require('mysql2');
const app = express();
const backend = require('./display_backend_AGPT');
const PORT = 5000;

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(require('path').resolve(__dirname, '.') + "/public"));
app.engine('html', require('ejs').renderFile);

let previous_value_of_plot_parameter = 0;

//data used for display_agpt database connection
let dbConfig = {
    host: 'db_disp_agpt', //change to localhost for local usage
    //host: 'localhost',
    port: 3306, //3306 or 3307
    //port: 3307,
    user: 'root',
    password: '',
    database: 'display_agpt',
    dateStrings : true
}

//data used for user_management database connection
let dbConfig_for_users = {
    //host: 'localhost',
    host: 'db_disp_agpt',
    //port: 3307,
    port: 3306,
    user: 'root',
    password: '',
    database: 'user_management'
}

//connect to database
function connectToDatabase(dbConn) {
    dbConn.connect((err) => {
        if(err) {
            console.log(err);
        }
        else {
            console.log("Connected to database!")
        }
    })
}

//disconnect from database
function disconnectFromDatabase(dbConn) {
    dbConn.end((err) => {
        if(err) {
            console.log(err);
        }
        else {
            console.log("Connection closed!");
        }
    })
}

//get aggregate generation per type data
app.get("/getData", (req, res) => {
    //get url parameters
    let requested_date = req.query.date;
    let requested_country = req.query.country;
    let requested_production_type = req.query.production_type;
    let sql = `SELECT actualGenerationOutput, dateTime, resolutionCode FROM generation WHERE \`dateTime\` >= \'${requested_date}\' and MapCode = \'${requested_country}\' and productionType = \'${requested_production_type}\' ORDER BY \`dateTime\` ASC`;
    console.log(sql);

    //connect to database
    let our_dbConn = mysql.createConnection(dbConfig);
    connectToDatabase(our_dbConn);
    //execute query
    let query = our_dbConn.query(sql, (err, results) => {
        if(err) console.log(err);
        res.json(results);
        console.log(results);
    })
    //disconnect from database
    disconnectFromDatabase(our_dbConn);
});

//get countries
app.get("/getCountries", (req, res) => {
    let sql = "SELECT Country, MapCode FROM country ORDER BY Country ASC";
    console.log(sql);

    let our_dbConn = mysql.createConnection(dbConfig);
    connectToDatabase(our_dbConn);
    let query = our_dbConn.query(sql, (err, results) => {
        if(err) console.log(err);
        res.json(results);
        console.log(results);
    })
    disconnectFromDatabase(our_dbConn);
});

//get parameter in order to know if new data came
app.get("/getPlotBoolean", (req, res) => {
    const {plot_parameter} = require('./display_backend_AGPT.js');
    // console.log(plot_parameter);
    // console.log(previous_value_of_plot_parameter);
    if(previous_value_of_plot_parameter != plot_parameter)
    {
        res.json({"plot_parameter": "1"});
        previous_value_of_plot_parameter = plot_parameter;
    }
    else{
        res.json({"plot_parameter": "0"});
        //previous_value_of_plot_parameter = plot_parameter;
    }
    //plot_parameter = 0;
});

//get production types
app.get("/getProductionTypes", (req, res) => {
    let sql = 'SELECT ProductionType FROM productionkinds ORDER BY ProductionType ASC';

    let our_dbConn = mysql.createConnection(dbConfig);
    connectToDatabase(our_dbConn);
    let query = our_dbConn.query(sql, (err, results) => {
        if(err) console.log(err);
        res.json(results);
        console.log(results);
    })
    disconnectFromDatabase(our_dbConn);
})

let token = " ";
app.get("/", (req, res) => {
    res.render( require('path').resolve(__dirname) + "/display_AGPT.html", { token: token}); //redirect to agpt load page
});

//get token
app.post("/", (req, res) => {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:10000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods',  'POST');
    res.setHeader("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");

    token = req.body.token;

    res.writeHead(200 );
    res.end();
});

//check if user is in database
app.post("/checkUser", (req, res) => {
    let requested_email = req.body.email;
    // let requested_first_name = req.body.first_name;
    // let requested_last_name = req.body.last_name;

    let sql = `SELECT * FROM users WHERE email = \'${requested_email}\'`;
    console.log(sql);

    let our_dbConn2 = mysql.createConnection(dbConfig_for_users);
    connectToDatabase(our_dbConn2);
    let query = our_dbConn2.query(sql, (err, results) => {
        if(err) console.log(err);
        res.json(results);
        console.log(results);
    })
    disconnectFromDatabase(our_dbConn2);
});

app.listen(PORT, () => {
    console.log(`Server Started on port: ${PORT}`);
})

backend.run().catch(console.error);