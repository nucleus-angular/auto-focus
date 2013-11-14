function setup(app, api) {
  app.get('/api/name', api.name);
  app.patch('/api/patch_test', function(req, res){
    res.json({
      id: 1,
      title: "patch some record"
    });
  });
}

module.exports.setup = setup;
