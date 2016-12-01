"use strict";
var config = {}
   
    config.database = {
    "id": "hack2"
    };
 
    config.collection = {
        "id": "products-2"
    };
 
    config.documents = {
    "Andersen": {
        "id": "Anderson.1",
        "lastName": "Andersen",
        "parents": [{
            "firstName": "Thomas"
        }, {
                "firstName": "Mary Kay"
            }],
        "children": [{
            "firstName": "Henriette Thaulow",
            "gender": "female",
            "grade": 5,
            "pets": [{
                "givenName": "Fluffy"
           }]
        }],
        "address": {
            "state": "WA",
            "county": "King",
            "city": "Seattle"
        }
    },
    "Wakefield": {
        "id": "Wakefield.7",
        "parents": [{
            "familyName": "Wakefield",
            "firstName": "Robin"
        }, {
                "familyName": "Miller",
                "firstName": "Ben"
            }],
        "children": [{
            "familyName": "Merriam",
            "firstName": "Jesse",
            "gender": "female",
            "grade": 8,
            "pets": [{
                "givenName": "Goofy"
            }, {
                    "givenName": "Shadow"
                }]
        }, {
                "familyName": "Miller",
                "firstName": "Lisa",
                "gender": "female",
                "grade": 1
            }],
        "address": {
            "state": "NY",
            "county": "Manhattan",
            "city": "NY"
        },
        "isRegistered": false
    }
};
  
    var host = GetEnvironmentVariable("DOCDB_ENDPOINT");
    var masterKey = GetEnvironmentVariable("DOCDB_KEY");
        
    config.endpoint = host;
    config.primaryKey = masterKey;
 
    var DocumentClient = require('documentdb').DocumentClient;   
    var client = new DocumentClient(config.endpoint, {masterKey: config.primaryKey});
   
    var HttpStatusCodes = { NOTFOUND: 404 };
    var databaseUrl = `dbs/${config.database.id}`;
    var collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;
 
module.exports = function(context, req) {
 
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);
    //pidibi_DOCUMENTDB
  
var error;
getDatabase(context)
    .then(() => getCollection(context))
    .then(() => getFamilyDocument(context, config.documents.Andersen))
    .then(() => getFamilyDocument(context, config.documents.Wakefield))
    .then(() => queryCollection(context))
    .then(() => replaceFamilyDocument(context, config.documents.Andersen))
    .then(() => queryCollection(context))
    //.then(() => deleteFamilyDocument(context, config.documents.Andersen))
    //.then(() => cleanup(context))
    .then(() => { exit(context, `Completed successfully`); })
    .catch((error) => { exit(context, `Completed with error ${JSON.stringify(error)}`) });
 
    //context.log(req);
    if (error){
        context.res = {
                    status: 500,
                    body: error
                };
    }
    else
    {
         context.res = {
            // status: 200, /* Defaults to 200 */
            body: "OK"
        };
    }
 
    context.done();
};
 
 
/**
* Get the database by ID, or create if it doesn't exist.
* @param {string} database - The database to get or create
*/
function getDatabase(context) {
    context.log(`Getting database:\n${config.database.id}\n`);
    context.log(client);
    return new Promise((resolve, reject) => {
        client.readDatabase(databaseUrl, (err, result) => {
            context.log("error reading db");   
            context.log(err);      
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDatabase(config.database, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}
 
/**
* Get the collection by ID, or create if it doesn't exist.
*/
function getCollection(context) {
    context.log(`Getting collection:\n${config.collection.id}\n`);
 
    return new Promise((resolve, reject) => {
        client.readCollection(collectionUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createCollection(databaseUrl, config.collection, { offerThroughput: 400 }, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}
 
/**
* Get the document by ID, or create if it doesn't exist.
* @param {function} callback - The callback function on completion
*/
function getFamilyDocument(context, document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    context.log(`Getting document:\n${document.id}\n`);
 
    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrl, document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};
 
/**
* Query the collection using SQL
*/
function queryCollection(context) {
    context.log(`Querying collection through index:\n${config.collection.id}`);
 
    return new Promise((resolve, reject) => {
        client.queryDocuments(
            collectionUrl,
            'SELECT VALUE r.children FROM root r WHERE r.lastName = "Andersen"'
        ).toArray((err, results) => {
            if (err) reject(err)
            else {
                for (var queryResult of results) {
                    let resultString = JSON.stringify(queryResult);
                    context.log(`\tQuery returned ${resultString}`);
                }
                context.log();
                resolve(results);
            }
        });
    });
};
 
/**
* Replace the document by ID.
*/
function replaceFamilyDocument(context, document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    context.log(`Replacing document:\n${document.id}\n`);
    document.children[0].grade = 6;
 
    return new Promise((resolve, reject) => {
        client.replaceDocument(documentUrl, document, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};
 
/**
* Delete the document by ID.
*/
function deleteFamilyDocument(context, document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    context.log(`Deleting document:\n${document.id}\n`);
 
    return new Promise((resolve, reject) => {
        client.deleteDocument(documentUrl, (err, result) => {
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};
 
 
 
/**
* Cleanup the database and collection on completion
*/
function cleanup(context) {
    context.log(`Cleaning up by deleting database ${config.database.id}`);
 
    return new Promise((resolve, reject) => {
        client.deleteDatabase(databaseUrl, (err) => {
            if (err) reject(err)
            else resolve(null);
        });
    });
}
 
/**
* Exit the app with a prompt
* @param {message} message - The message to display
*/
function exit(context, message) {
    context.log(message);
    //context.log('Press any key to exit');
    //process.stdin.setRawMode(true);
    //process.stdin.resume();
    //process.stdin.on('data', process.exit.bind(process, 0));
}
function GetEnvironmentVariable(name)
{
    return process.env[name];
}