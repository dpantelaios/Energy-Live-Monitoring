var fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv');
//const kafka = require('node-rdkafka');
const { Kafka } = require('kafkajs')

//CSV filter to filter out the csv files
//in the directory
const filtercsvFiles = (filename) => {
    return filename.split('_')[0] != '.';
};

//Hard coded directory has been used.
//Put your path here...
//const currDir = path.join(__dirname + '/../../data/AGPT/'); /* for local run without containers */
const currDir = '/input/';
let typesSeen = new Set();
// Function to get the filenames present
// in the directory
const readdir = (dirname) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, (error, filenames) => {
            if (error) {
                reject(error);
            } else {
                resolve(filenames);
            }
        });
    });
};

const kafka = new Kafka({
    allowAutoTopicCreation: true,
    clientId: 'split-producer-agpt',
    //brokers: ['localhost:9092']
    brokers: ['kafka:29090'] //change kafka:29090 to localhost:9092 to run locally
})

const producer = kafka.producer()
const topic = 'split_to_pop_agpt';
const topic_type = 'split_to_pop_type_agpt';

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

const produceTypeMessage = async (value) => {
    try {
        console.log(value);
        await producer.send({
            topic: topic_type,
            messages: [
                { value },
            ],
        })
        console.log(`${value} written to kafka!`);
    } catch (error) {
        console.log(error);
    }
}



/* debug */
// const names = filtercsvFiles ;
// console.log(names[0]);

readdir(currDir).then(async (filenames) => {//read files with a certain interval
    filenames = filenames.filter(filtercsvFiles);

    await producer.connect();
    let i=0;
    let intervalID = setInterval(()=> {

        //for (let i = 0; i < 6; i++) { //should be filenames.length to read all files
            let currFilePath = currDir + filenames[i];
            console.log(currDir);
            console.error(filenames[i]);

            //Use fast-csv to parse the files
            let csvData = [];
            let csvString = "";

            let filename_split = filenames[i].split('_');
            let new_file_name = filename_split[0]+'_'+ filename_split[1]+'_'+ filename_split[2]+'_'+ filename_split[3]+'_'+
                'AGPTcorrected.csv';//name of file that will be stored on shared volume to be read from the populate microservice (we keep the date from the original file).

            fastcsv
                .parseFile(currFilePath)
                .on('data',  (row) => {
                    let new_row = JSON.stringify(row);

                    /* ... filter data to keep only area code =  "CTY"  records ...*/
                    let areaCode = new_row.split('\\t')[3];
                    let prodType = new_row.split('\\t')[6];



                    if (areaCode === "CTY") {
                        csvData.push(row);
                        csvString += row + "\r\n";

                        if(!typesSeen.has(prodType)) {
                            typesSeen.add(prodType);
                            //console.log(prodType);
                            produceTypeMessage(prodType); //maybe await
                        }
                    }
                    /*..............................................................*/
                    //console.log(areaCode);
                })
                .on('end', async (rowCount) => {

                    //const pathToFile = path.join(__dirname + '/corrected_data/' + new_file_name); //for local run
                    const pathToFile = '/data_split_pop/' + new_file_name;
                   console.log(pathToFile);
                    await fs.writeFile(pathToFile, csvString, err => {
                        if (err) {
                            console.error(err);
                        }
                        // file written successfully
                    });

                    await produceMessage(pathToFile);
                    //console.log(csvString);
                });
            i++;
            if(i===filenames.length) {
                clearInterval(intervalID);
            }
            /*.........................................................................................*/
        //}
    }, 30000) //interval between file reads. For realistic operation it should be 1 hour
})
