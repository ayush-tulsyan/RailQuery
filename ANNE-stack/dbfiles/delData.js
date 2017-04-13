var neo4j = require('neo4j-driver').v1;

var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "password"));
	var session = driver.session();
	session
		.run( "MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r", {})
		.then( function( result ) {
			console.log( "Deleted Everything" );
			session.close();
			driver.close();
		});
