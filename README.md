# RailQuery
Offline database for querying over Indian Railway train schedule

### Course Project for CS315A

The project makes use of [neo4j](https://github.com/neo4j/neo4j) graph database. The back-end runs mostly on nodejs and uses Express framework.

## Dependencies
The following is a list of tools required to run this project. These are required for running the server

* [nodejs](https://github.com/nodejs/node)
* [neo4j](https://github.com/neo4j/neo4j)

Complete installation on neo4j and start the server. Don't forget to login in browser console and change the password. The same password should also replace the passwords in the scripts in ```BoilerPlate/DataBase/ImportScripts/``` directory.

The other nodejs packages will be installed below. Check the ```BoilerPlate/package.json``` file to know about other dependencies.

## Installation and Running

### Install nodejs packages

Clone the repository and migrate to the ```BoilerPlate/``` folder in the repository root. To install the nodejs dependencies, execute the following.
```
npm install
```

### Fetching Data

We've used the API available on [RailwayAPI](http://www.railwayapi.com/). We (with a very small amount of guilt) confess that we have used a lot of fake emails to get a bunch of API keys to fetch the data. It took our script over 40 days to complete the database.

The scripts are available in ```script/``` directory. (KeyList file required for running this script has not been comiitted in the repository for obvious reasons)

### Import data on database

The scripts in ```BoilerPlate/DataBase/``` directories parse the fetched data and output the required data in JSON format in the temporary files.

Given the size of data, it has not been uploaded in the repository. Message the repository owner to get a copy.

```BoilerPlate/DataBase/getTrainStationEdgeData.js``` filters the data and makes intermediate temporary files. JS files in ```BoilerPlate/DataBase/ImportScripts/``` upload the data to the neo4j database. The data has to be uploaded in smal chunks.

## Get the server live

Execute the server.js script in ```BoilerPlate/``` folder

```
nodejs server
```

## Database Schema and Performance

Two types of nodes have been added to the database with the corresponding Schema

* Trains
    * number: Train number
    * name: Train name
    * source: the origin station
    * classes: Coach types present in a train
    * days: Days of week at which this train runs
* Stations
    * code: Station code (unique for all stations)
    * name: Station name
    * state: State of the station city
    * lat: latitude of the station
    * lng: longitude of the station

The train routes are stored as the edges between the stations. Each length of run of a train between any two stations is represented by an edge. For eg: if a train originates from station A and goes to station F through station B, C, D, and E, then 5 edges A->B, B->C, C->D, D->E, and E->F store the complete route of this train. A edge stores the following data

* Edge
    * src: the start station
    * schdep: the time of departure from the src station
    * day1: the day of the train's run at src station
    * dest: the destination
    * scharr: the scheduled time of arrival at the destination
    * day2: the day of the train's run at dest station
    * distance: distance between src and dest station
    * halt: time of halt at station dest (0 if dest is the last station).

### Index

Index over both the type of nodes were maintained. Without the index, the queries took very long response time and edge insertion was also very slow. A query over the Station nodes took over 50 ms. Given the number of edges in the database is over 100K, and each edge insetion involves at-least two such queries, this is not affordable. A index on station code decreased the query time to 2 ms.

## Acknowledgements

* [ANNE-stack](https://github.com/mchengal/ANNE-stack) BoilerPlate code for Angular and Express framework
* [RailwayAPI](https://www.railwayapi.com/) Data for the Application
* [neo4j](https://github.com/neo4j/neo4j) Graph Database
* [d3.js](https://github.com/d3/d3) Visualising data on front end.
