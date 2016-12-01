module.exports = function (context, req) {


    var mock = [
        {
            "name" : "Káva s mlékem",
            "price" : 36.0,
            "id" : 7
        },        
        {
            "name" : "Pivo",
            "price" : 30.0,
            "id" : 1
        }
    ]

        res = {
            // status: 200, /* Defaults to 200 */
            body: mock
        };

    context.done(null, res);
};