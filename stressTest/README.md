# We tested the application for 500 simultaneous users and 20 loops of http requests to various endpoints of our microservices.
* The throughput remained high through the duration of the testing and especially after the databases had cached some data.
* We observed a few outages on microservices which call heavy queries in order to plot the diagrams nevertheless the error percentage remained really small (0.42% on the endpoint with the most errors and 0.04% total) so it is safe to say we did not have any major outage in our app.
* The achieved average latency was 569ms with the AGPT microservice scoring the highest latencies (above 1 second). This microservice suffered a heavier load than the rest since it has more endpoints (it must also fetch the different production types).
