module.exports = function (context, req) {
    var id = guid()
    context.bindings.outputDocument = req.body
    context.bindings.outputDocument.id = guid()
        res = {
            status: 201,
            body: {"id" : id}
        };
    
    context.done(null, res);
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
 