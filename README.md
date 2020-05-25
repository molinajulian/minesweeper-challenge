# Minesweeper

The application allows playing the famous game minesweeper.

## Prerequisites

You need to have installed:

* [npm](https://www.npmjs.com/get-npm)
* [docker](https://www.docker.com/products/docker-desktop)

## Application
The apllication consist on one server and one database running in [docker](https://www.docker.com/). The database used is [postgres](https://www.postgresql.org/) and the server is made with [node](https://nodejs.org/es/) using [express](https://expressjs.com/es/).
To run the application, you need to run `npm run docker-start`. 
Please, before running the command, check the port `8080` because it will be used by the application.

## Test
 
They will executing in a docker container. You have to run `npm run docker-test`. 
The container (in foreground) will be run the tests and finally will be stopped.
