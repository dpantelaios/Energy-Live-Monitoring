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

Dillinger requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
cd dillinger
npm i
node app
```

For production environments...

```sh
npm install --production
NODE_ENV=production node app
```


#### Building for source

For production release:

```sh
gulp build --prod
```

Generating pre-built zip archives for distribution:

```sh
gulp build dist --prod
```

## Docker

Dillinger is very easy to install and deploy in a Docker container.

By default, the Docker will expose port 8080, so change this within the
Dockerfile if necessary. When ready, simply use the Dockerfile to
build the image.

```sh
cd dillinger
docker build -t <youruser>/dillinger:${package.json.version} .
```

This will create the dillinger image and pull in the necessary dependencies.
Be sure to swap out `${package.json.version}` with the actual
version of Dillinger.

Once done, run the Docker image and map the port to whatever you wish on
your host. In this example, we simply map port 8000 of the host to
port 8080 of the Docker (or whatever port was exposed in the Dockerfile):

```sh
docker run -d -p 8000:8080 --restart=always --cap-add=SYS_ADMIN --name=dillinger <youruser>/dillinger:${package.json.version}
```

> Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.

Verify the deployment by navigating to your server address in
your preferred browser.

```sh
127.0.0.1:8000
```

## License

MIT

**Free Software, Hell Yeah!**

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

