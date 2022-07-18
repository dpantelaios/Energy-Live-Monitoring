const mysql = require('mysql2/promise');
const fastcsv = require('fast-csv');
const { Kafka } = require('kafkajs')
const fs = require("fs");

/*Database configuration for aggregation generation per type data*/
let dbConfig = {
    //host: 'localhost',
    host: 'db_pop_agpt', //change to localhost for local usage
    //port: 3307,
    port:3306,
    user: 'root',
    //password: '12345',
    database: 'populate_aggr_generation_per_type' //actual database name
}

/* listen to kafka topic ff and update when needed (this function will be called when MS receives a message from kafka that data is available.*/
async function updateDatabase(URI) {
    /* every time we have an update :
     * step 1: delete all the existing records
     * step 2: insert the new records
    */
    /*wrap everything in a promise to make sure this function has finished execution before we begin handling the next message received*/
    return new Promise (async(resolve, reject) => {

        let URIparts = URI.toString().split('/');
        let filename = URIparts[URIparts.length - 1]; //keep only filename from path

        let filename_split = filename.split('_');
        let new_file_name = filename_split[0] + '_' + filename_split[1] + '_' + filename_split[2] + '_' + filename_split[3] + '_' +
            'dataForDisplay.csv'; //filename for the file that will be shared (via shared volume) with display ms (we keep the date from the original file).

        let currentYearMonth = filename_split[0] + '-' + filename_split[1] + '-01 00:00:00.000' //keep the year and month this csv is about to delete appropriate entries.

        /*we create a connection with the database*/
        let our_dbConn = await mysql.createConnection(dbConfig);

        /*delete tuples referencing the same month as the file we received since they will be re-inserted (maybe even fill in gaps that existed)*/
        let clear = `DELETE FROM generation WHERE \`DateTime\` >= \'${currentYearMonth}\' `;

        let result = await our_dbConn.execute(clear);

        /*reset the auto increment table_index so that it will not get very large with deletes and re-insertions. We wait for the previous queries to finish their execution before issuing the next and the inserts*/
        let resetIndex = 'ALTER TABLE generation AUTO_INCREMENT = 0;';
        result = await our_dbConn.execute(resetIndex);

        let csvString = "";


        fastcsv
            .parseFile(URI)
            .on('data', async (row) => { //for each row of the csv file
                let row_split = JSON.stringify(row).split('\\t'); //seperate the different fileds and store them inside variables

                let dateTime = row_split[0].substring(2); //maybe cut off miliseconds from dateTime
                let updateDateTime = row_split[row_split.length - 1].slice(0, -2);
                let resolutionCode = row_split[1].match(/\d+/g)[0];
                let MapCode = row_split[5];
                let productionType = row_split[6];
                let generation = row_split[7];
                if (generation === '') {
                    generation = 0.0;
                }

                /*enter the data into the database*/
                /*First we prepare the sql query with the values we read from the csv*/
                let sql = `INSERT INTO generation (ActualGenerationOutput, updateDateTime, dateTime, resolutionCode, MapCode, ProductionType)` +
                    ` VALUES(${generation}, \'${updateDateTime}\', \'${dateTime}\', ${resolutionCode}, \'${MapCode}\', \'${productionType}\') `;

                /*we also prepare the csv that we will write to the shared volume to pass it to display MS*/
                /*Display MS has no use for the field UpdateDateTime*/
                let new_row = dateTime + '\t' + resolutionCode + '\t' + MapCode + '\t' + productionType + '\t' + generation;
                csvString += new_row + "\r\n";

                /*then we execute the query without blocking and waiting for each individual query to finish*/
                result = our_dbConn.query(sql);

            })
            .on('end', async (rowCount) => { //once all data in the csv has been read
                await result; //wait for the last query to the database to finish so that we are sure all data has been inserted
                console.log(`Parsed ${rowCount} rows`);

                /*Debugging*/
                // let sql = 'SELECT * FROM actualtotalload'
                // let result = await our_dbConn.query(sql);
                // console.log(result[0].length);
                /*End of Debugging*/

                our_dbConn.destroy(); //destroy the connection to the database

                //const pathToFile = path.join(__dirname + '/data_for_display/' + new_file_name);
                const pathToFile = '/data_pop_disp/' + new_file_name; //path to save the file (will be mapped to the volume shared with display MS in the docker-compose.yml file)

                /*Save the file*/
                await fs.writeFile(pathToFile, csvString, err => {
                    if (err) {
                        console.log(err);
                    }
                    console.log("File Saved!");
                    // file written successfully
                });

                /*Write the path to file to kafka to notify the display MS*/
                await produceMessage(pathToFile);
                /*Then we can resolve the promise so that our consumer waiting for it is ready to consume the next message*/
                resolve('done')
            });
    });
}



/*............ kafka consumer ..................*/
/* ... populate consumes the message from split microservice ... */
/* the message is the URI where from the populate microservice will get the new data */
/*..........................................................................................*/
const kafka_cons = new Kafka({
    clientId: 'pop-consumer-AGPT',
    /*container and port where kafka broker is listenting*/
    //brokers: ['localhost:9092']
    brokers: ['kafka:29090'] //change kafka:29090 to localhost:9092 to run locally
});
/*we need a large sessionTimeout because for huge data insertions to database the consumer will block for a long time and we cannot have it being removed from kafka group*/
const consumer = kafka_cons.consumer({ groupId: 'split-to-pop-AGPT-group', sessionTimeout: 3500000 });
const topic_cons = 'split_to_pop_agpt'; //topic for messages between split and populate MSs for aggregation generation per type datasets.
const topic_cons_type = 'split_to_pop_type_agpt'; //topic to share newly found production types from split MS to update the table productionkinds which is a foreign key to the main data table

const run = async () => {
    // Consuming
    /*connect both producer (for messages to display) and consumer (for messages from split)*/
    await consumer.connect();
    await producer.connect();

    /*consumer subscribes to both beforementioned topics*/
    await consumer.subscribe({ topics: [topic_cons, topic_cons_type] });

    /*for every message about new actual data the consumer receives it waits for the database to be updated before it reads another message*/
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if(topic === topic_cons) {
                console.log(`received message: ${message.value}`);
                await updateDatabase(message.value);

            }
            /*for every generation type it receives*/
            else if (topic == topic_cons_type) {
                /*attempt to insert it into the table*/
                let sql = `INSERT INTO productionkinds (ProductionType) VALUES (\'${message.value}\')`;
                console.log(sql);
                /*while at it stop consuming messages for actual data because there is a chance that due to a race condition a foreign key constraint might fail*/
                consumer.pause([{topic: topic_cons}]);
                /*create a connection with the database*/
                let our_dbConn2 = await mysql.createConnection(dbConfig);
                try {
                    let result = await our_dbConn2.query(sql);
                    await produceMessageType(message.value); //once and only if production type was succesfuly inserted in populate_database it can be propagated to display ms
                }
                /*there is a chance that the production type already exists in the database and the split MS sent it again because it crashed and lost its memory. We must handle this case*/
                catch(err) {
                    console.log(`Duplicate entry for type ${message.value}. Split probably faced a crash and forgot what it has already sent`);
                }
                finally {
                    /*destroy the connection with the database*/
                    our_dbConn2.destroy();
                }
                /*at last restart consuming from the actual data topic*/
                consumer.resume([{topic: topic_cons}]);
            }
        },
    })
}

/*producer definition*/
const kafka_prod = new Kafka({
    clientId: 'pop-producer-AGPT',
    /*container and port where kafka broker is listening*/
    //brokers: ['localhost:9092']
    brokers: ['kafka:29090'] //change kafka:29090 to localhost:9092 to run locally
})

const producer = kafka_prod.producer()
const topic_prod = 'pop_to_disp_agpt'; //topic to write actual data messages for display MS
const topic_prod_type = 'pop_to_disp_type_agpt'; //topic to write production type messages to display MS

/*function that produces messages to kafka actual data topic*/
const produceMessage = async (value) => {
    try {
        //console.log(value);
        await producer.send({
            topic: topic_prod,
            messages: [
                { value },
            ],
        })
        console.log("Message written to kafka!")
    } catch (error) {
        console.log(error);
    }
}

/*function that produces messages to kafka production type topic*/
const produceMessageType = async (value) => {
    try {
        //console.log(value);
        await producer.send({
            topic: topic_prod_type,
            messages: [
                { value },
            ],
        })
        console.log(`${value} written to kafka!`);
    } catch (error) {
        console.log(error);
    }
}

/*start the Microservice*/
run().catch(console.error);