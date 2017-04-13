var neo4j = require('neo4j-driver').v1;

// Create a driver instance, for the user neo4j with password neo4j.
// It should be enough to have a single driver per database per application.
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "password"));

// Register a callback to know if driver creation was successful:
driver.onCompleted = function () {
  // proceed with using the driver, it was successfully instantiated
    console.log("Connection to DB made :)");
    console.log("Driver Instantiated");
};

// Register a callback to know if driver creation failed.
// This could happen due to wrong credentials or database unavailability:
driver.onError = function (error) {
  console.log('Driver instantiation failed', error);
};

module.exports = driver

