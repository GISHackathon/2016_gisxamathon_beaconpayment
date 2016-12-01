module.exports = function (context, req) {


    var mock = [
        {
            "name" : "Shell",
            "text" : "Kvalitní benzín ...",
            "loc" : {
                "lat" : 0,
                "lon" : 0
            }
        },        
        {
            "name" : "Omni",
            "text" : "Levné, ale ta obsluha  ...",
            "loc" : {
                "lat" : 0,
                "lon" : 0
            }
        }
    ]

        res = {
            // status: 200, /* Defaults to 200 */
            body: mock
        };

    context.done(null, res);
};