

var http = require('http');



var config = {};
    var host = GetEnvironmentVariable("DOCDB_ENDPOINT");
    var masterKey = GetEnvironmentVariable("DOCDB_KEY");

    var databaseId = "hack";
    //var collectionId = "order_distribute"
        
    config.endpoint = host;
    config.primaryKey = masterKey;
 
    var DocumentClient = require('documentdb').DocumentClient;   
    var client = new DocumentClient(config.endpoint, {masterKey: config.primaryKey});

    var HttpStatusCodes = { NOTFOUND: 404 };
    var databaseUrl = `dbs/${databaseId}`;


function collectionUrl(collectionId) {
    return `${databaseUrl}/colls/${collectionId}`;
}    
    
    







module.exports = function (context, req) {
    var id = guid()




    if(req.body && req.body.min && req.body.maj) {

        var min = req.body.min
        var maj = req.body.maj
        
        context.bindings.outputDocument = req.body
        context.bindings.outputDocument.id = guid()
            res = {
                status: 201,
                body: {"id" : id}
            };


        var text = ""

        if(min == 1) {
            text = "Vaše objednávka je pro Vás připravena"
        } else if(min == 2) {
            text = "Objednávku Vám budeme servírovat na Vaše místo"
        } else if(min == 3) {
            text = "Děkujeme Vám za návštěvu"
        }


        if(text){

            var bodyString = JSON.stringify( {"value1":text} )
            var options = {
            host: "maker.ifttt.com",
            path: "/trigger/Jkdubr/with/key/6xAXb93gjiRZYQ0dnJ2jr",  
            method: "POST",
            
            headers : {
                "Content-Type":"application/json",
                "Content-Length": Buffer.byteLength(bodyString)
                }    
            };

            var req = http.request(options, function(ttt){

                if(min == 1) {
                    shiftOneFromColToCol(context, "order_prepare", "order_checkin").then(() => {
                                            context.log("wwwwooooww checkin");
                                            context.done(null, null);
                                        })
                }

                 if(min == 2) {
                    shiftOneFromColToCol(context, "order_checkin", "order_distribute").then(() => {
                                            context.log("wwwwooooww distribute");
                                            context.done(null, null);
                                        })
                }
                
                    
                    
            });
            req.end(bodyString);
        }


        
        
    } else {
            res = {
                status: 404
            };
        context.done(null, res);
    }
    
};



function shiftOneFromColToCol(context, collectionFrom, collectionTo) {
    
 
    return new Promise((resolve, reject) => {
        client.queryDocuments(
            collectionUrl(collectionFrom),
            'SELECT * FROM root   '
        ).toArray((err, results) => {
            if (err) {
                context.log("chhhhhyyy")
                context.log(err)
                reject(err)
            }
            else {
                context.log("returnd");
                if(results.length > 0){
                    if(collectionTo == "order_checkin"){
                       context.bindings.outputDocumentOrderCheckin = results[0]
                    }
                    if(collectionTo == "order_distribute"){
                       context.bindings.outputDocumentOrderDistribute = results[0]
                    }

                        
                        deleteDocument(context, collectionFrom ,results[0]).then(() => {
                            context.log("smazano")
                            resolve(results);
                                } 
                                )


                }                
                
            }
        });
    });
};



function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
 








function GetEnvironmentVariable(name)
{
    return process.env[name];
}




function deleteDocument(context, collectionId, document) {

    let documentUrl = `${collectionUrl(collectionId)}/docs/${document.id}`;
    context.log(documentUrl);
    context.log(`Deleting document:\n${document.id}\n`);
 
    return new Promise((resolve, reject) => {
        client.deleteDocument(documentUrl, (err, result) => {
            if (err) {
                context.log("errrrrr")
                context.log(err)
                reject(err);
            }
            else {
                context.log("okkkkkk")
                resolve(result);
            }
        });
    });
};