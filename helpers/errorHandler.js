function errorHandler (error, req, res, next) {
    try {
        const code = error.code || 500;
        const status = 'failed';
        const message = error.message || 'Something went wrong';
        const errors = error.errors || {};
        // logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${code}, Message:: ${message}`);
        res.status(code).json({ status, message, errors });
      } catch (err) {
        console.log(error)
        next(err);
      }
  }

 
  
  module.exports = errorHandler;