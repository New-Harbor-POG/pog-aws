module.exports.do = (app) => {
  app.get('*/time', async function (req, res) {
    try {
      res.send({
        now: new Date(),
        time: new Date().getTime()
      });
    } catch (e) {
      app.onError(res, e, req);
    }
  });
};
