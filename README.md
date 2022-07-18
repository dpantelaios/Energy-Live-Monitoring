# EnergyLive2022
### Contributors
SaaS *team 21*
- Alexandros Moiras
- Vasiliki Efthymiou
- Dimitris Pantelaios
## Features

- Sign in with Google
- Choose between actual total load, generation per type and physical flows as well as other parameters (dates, region, ..)
- Get results depicted into diagrams updated on real time.
- Download diagram's data as csv, json or image 
- Find out the days that are left into your subscription and extend it if you wish


## Tech
EnergyLive2022 uses a number of open source projects to work properly:

- [node.js] - evented I/O for the backend
- [Docker] - Package Software into Standardized Units for Development, Shipment and Deployment
- [javascript] -  the programming language of the Web
- [Kafka]- distributed event streaming platform
- [kafkajs] - KafkaJS is a modern Apache Kafka client for Node.js.
- [HTML]
- [css]


And of course Dillinger itself is open source with a [public repository][dill]
on GitHub.

## Installation

Project runs entirely on docker containers. All it requires is building and uploading!

In order to do that for every microservice all you need to do is navigate in its folder and run the following commands:

```sh
docker-compose build
docker-compose up
```
### Important notes:

* Since the microservices are dependent on each other they need to be started in a certain sequence.
  * Kafka
  * LoginAndChooseDisplay microservice, Display microservices, Populate microservices (wait until the MySQL databases running along them report that they are ready for connections)
  * Split microservices (that simulate downloading of data and begin the chain)
* CSV files containing the original data, based on the current configuration in the docker-compose.yml of the split microservices, MUST be located in the directories ../../data/ATL, ../../data/FF, ../../data/AGPT respectively (relative to the folder of each microservice because this folder will be mapped to the volume of the microservice so that it can read data
* Data, in a real world scenario, will be received by our split microservices every hour via ftp, but for simulation reasons we read one CSV file every 5 minutes. This can be changed by altering the interval in the split_ATL.js, split_FF.js, split_AGPT.js files. Setting the interval too low is expected to cause issues if the insertions to the database take longer than the interval between file reads since the databases will always be in a transitive state and never in a stable one.
* In case you need to restart all the microservices it is recommended that you run 
```sh
docker-compose down -v
```
first in order to delete the volumes, databases and kafka message queue
* The application runs on port 10000 and can be accessed from the browser (port configurable via the docker-compose.yml in login_and_choose_display) and the display microservices on ports 20001, 20002, 20003 -configurable via the docker-compose.yml files in display_ATL, display_FF, display_AGPT- although they are not directly accessible (they require a login token and without it they will redirect back to login and choose display MS). 
For production environments...

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


[git-repo-url]: <https://github.com/joemccann/dillinger.git>

[Docker]: <https://www.docker.com/>
[node.js]: <http://nodejs.org>
[javascript]: < https://www.javascript.com/>
[jQuery]: <http://jquery.com>
[@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
[express]: <http://expressjs.com>
[kafkajs]: <https://kafka.js.org/>
[Kafka]: <https://kafka.apache.org/>

