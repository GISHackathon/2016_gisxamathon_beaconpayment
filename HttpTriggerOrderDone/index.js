var config = {};
    var host = GetEnvironmentVariable("DOCDB_ENDPOINT");
    var masterKey = GetEnvironmentVariable("DOCDB_KEY");

    var databaseId = "hack";
    var collectionId = "order_distribute"
        
    config.endpoint = host;
    config.primaryKey = masterKey;
 
    var DocumentClient = require('documentdb').DocumentClient;   
    var client = new DocumentClient(config.endpoint, {masterKey: config.primaryKey});

    var HttpStatusCodes = { NOTFOUND: 404 };
    var databaseUrl = `dbs/${databaseId}`;
    var collectionUrl = `${databaseUrl}/colls/${collectionId}`;
    




module.exports = function (context, req) {
    if(context.bindings.inputDocument == null) {
        res = {
            status: 404            
        };

    context.done(null, res);
    }else{
        
        context.bindings.outputDocument = context.bindings.inputDocument;

        context.log(context.bindings.outputDocument);

        deleteDocument(context, context.bindings.inputDocument).then(() => {


            res = {
                status: 201            
            };

            context.done(null, res);
        } 
        )

    }
    
};



function deleteDocument(context, document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    context.log(documentUrl);
    context.log(`Deleting document:\n${document.id}\n`);
 
    return new Promise((resolve, reject) => {
        client.deleteDocument(documentUrl, (err, result) => {
            if (err) {
                reject(err);
            }
            else {                
                resolve(result);
            }
        });
    });
};


function GetEnvironmentVariable(name)
{
    return process.env[name];
}