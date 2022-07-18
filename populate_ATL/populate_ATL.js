const mysql = require('mysql2/promise');
//const Kafka = require("node-rdkafka");
const fastcsv = require('fast-csv');
const { Kafka } = require('kafkajs')
//const path = require("path");
const fs = require("fs");

let dbConfig = {
    //host: 'localhost',
    host: 'db_pop_atl', //change to localhost for local usage
    //port: 3307,
    port:3306,
    user: 'root',
    //password: '12345',
    database: 'populate_actual_total_load' //actual database name
}

/*............ kafka producer ..................*/



/* listen to kafka topic ATL and update when needed*/

async function updateDatabase(URI) {
    return new Promise (async(resolve, reject) => {

        /* every time we have an update :
         * step 1: delete all the existing records
         * step 2: insert the new records
        */

        let URIparts = URI.toString().split('/');
        let filename = URIparts[URIparts.length - 1];
        //console.log(filename);

        let filename_split = filename.split('_');
        let new_file_name = filename_split[0] + '_' + filename_split[1] + '_' + filename_split[2] + '_' + filename_split[3] + '_' +
            'dataForDisplay.csv';
        //console.log(new_file_name);

        let currentYearMonth = filename_split[0] + '-' + filename_split[1] + '-01 00:00:00.000'

        let our_dbConn = await mysql.createConnection(dbConfig);
        //connectToDatabase(our_dbConn);

        let clear = `DELETE FROM actualtotalload WHERE \`DateTime\` >= \'${currentYearMonth}\' `;
        //console.log(clear);

        let result = await our_dbConn.execute(clear);
        //console.log(result);

        let resetIndex = 'ALTER TABLE actualtotalload AUTO_INCREMENT = 0;';
        result = await our_dbConn.execute(resetIndex);
        //console.log(result);

        let csvString = "";

        //console.log(typeof URI);


        //console.log(new_file_name);

        fastcsv
            .parseFile(URI)
            .on('data', async (row) => {
                let row_split = JSON.stringify(row).split('\\t');

                let dateTime = row_split[0].substring(2); //maybe cut off miliseconds from dateTime
                let updateDateTime = row_split[7].slice(0, -2);
                let resolutionCode = row_split[1].match(/\d+/g)[0];
                let mapCode = row_split[5];
                let totalLoadValue = row_split[6];


                let sql = `INSERT INTO actualtotalload (totalLoadValue, updateDateTime, dateTime, resolutionCode, Mapcode)` +
                    ` VALUES(${totalLoadValue}, \'${updateDateTime}\', \'${dateTime}\', ${resolutionCode}, \'${mapCode}\') `;
                // console.log(sql);

                let new_row = dateTime + '\t' + mapCode + '\t' + totalLoadValue + '\t' + resolutionCode;
                csvString += new_row + "\r\n";

                result = our_dbConn.query(sql);
                //  console.log(result);

            })
            .on('end', async (rowCount) => {
                await result;
                console.log(`Parsed ${rowCount} rows`);

                /*Debugging*/
                // let sql = 'SELECT * FROM actualtotalload'
                // let result = await our_dbConn.query(sql);
                // console.log(result[0].length);
                /*End of Debugging*/
                our_dbConn.destroy();

                //const pathToFile = path.join(__dirname + '/data_for_display/' + new_file_name);
                const pathToFile = '/data_pop_disp/' + new_file_name;
                //console.log(pathToFile);


                await fs.writeFile(pathToFile, csvString, err => { //for debug only!!!!!!!
                    if (err) {
                        console.log(err);
                    }
                    console.log("File Saved!");
                    // file written successfully
                });

                await produceMessage(pathToFile); //change to produce kafka messaging commented out for debugging
                resolve('done');
                //console.log("File Saved 2!");
                //disconnectFromDatabase(our_dbConn);
            });
    })
}



/*............ kafka consumer ..................*/
const kafka_cons = new Kafka({
    clientId: 'my-consumer',
    //brokers: ['localhost:9092']
    brokers: ['kafka:29090'] //change kafka:29090 to localhost:9092 to run locally
});
const consumer = kafka_cons.consumer({ groupId: 'split-to-pop-atl-group', sessionTimeout: 3500000 });
const topic_cons = 'split_to_pop_ATL';

const run = async () => {
    // Consuming
    await consumer.connect();
    await producer.connect();

    await consumer.subscribe({ topic: topic_cons });

    await consumer.run({
        eachMessage: async ({ partition, message }) => {
            // console.log({
            //     partition,
            //     offset: message.offset,
            //     value: message.value.toString(),
            // })
            console.log(`received message: ${message.value}`);
            await updateDatabase(message.value);
        },
    })
}

const kafka_prod = new Kafka({
    clientId: 'pop-producer',
    //brokers: ['localhost:9092']
    brokers: ['kafka:29090'] //change kafka:29090 to localhost:9092 to run locally
})

const producer = kafka_prod.producer()
const topic_prod = 'pop_to_disp_ATL';

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

run().catch(console.error);


