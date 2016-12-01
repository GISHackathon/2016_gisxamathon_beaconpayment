var config = {};
    var host = GetEnvironmentVariable("DOCDB_ENDPOINT");
    var masterKey = GetEnvironmentVariable("DOCDB_KEY");

    var databaseId = "hack";
    var collectionId = "order_prepare"
        
    config.endpoint = host;
    config.primaryKey = masterKey;
 
    var DocumentClient = require('documentdb').DocumentClient;   
    var client = new DocumentClient(config.endpoint, {masterKey: config.primaryKey});

    var HttpStatusCodes = { NOTFOUND: 404 };
    var databaseUrl = `dbs/${databaseId}`;
    
    
function collectionUrl(collectionId) {
    return  `${databaseUrl}/colls/${collectionId}`;
}    
    
module.exports = function (context, req) {

    

    queryCollection(context ,"p").then((items) => {
        context.log("done");

        context.log(items);

        
       
       var xxx = {
                // status: 208, /* Defaults to 200 */
                body: items
            };

        context.done(null, xxx);
    })

       

};





function queryCollection(context, name) {
//prepare,checkin,distribute,done
    var itemsPrepare = [];
    var itemsCheckin = [];
    var itemsDistribute = [];
    var itemsDone = [];
    
    return new Promise((resolve, reject) => {

        getItems("order_prepare", function(items){
            itemsPrepare = items

        getItems("order_checkin", function(items){
            itemsCheckin = items


        getItems("order_distribute", function(items){
            itemsDistribute = items


        getItems("order_done", function(items){
            itemsDone = items

            var results = {
                "prepare" : itemsPrepare,
                "checkin" : itemsCheckin,
                "distribute" : itemsDistribute,
                "done" : itemsDone
            }
            resolve(results);
        })
        })
        })
        })

       /*
            var results = {
                "prepare" : itemsPrepare
                //"checkin" : itemsCheckin
            }
            resolve(results);
            */
        
    });
};

function getItems(collectionId, callback) {

    client.queryDocuments(
            collectionUrl(collectionId),
            'SELECT * FROM  r '
        ).toArray((err, results) => {
            if (err) context.log(err)
            else {
                callback(results)  
            }
        })
}

function GetEnvironmentVariable(name)
{
    return process.env[name];
}