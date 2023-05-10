const HttpException = require("../helpers/HttpException");

const { pwdSaltRounds } = require("../helpers/constants");

const bcrypt = require("bcrypt");

const { SECRET_KEY } = process.env;

const appTokenMiddleware = async (req, res, next) => {
  try {
    // const token = await hash(SECRET_KEY, 10);
    // console.log(token);

    const Authorization = req.header("appToken");
    console.log(Authorization);
    if (Authorization) {
      const secretKey = SECRET_KEY;

      const isTokenMatching = await bcrypt.compare(secretKey, Authorization);

      if (isTokenMatching) {
        next();
      } else {
        next(new HttpException(401, "Invalid authentication credentials", {}));
      }
    } else {
      next(new HttpException(404, "Invalid authentication credentials", {}));
    }
  } catch (error) {
    console.log(error);
    next(new HttpException(401, "Invalid authentication credentials", {}));
  }
};

module.exports = appTokenMiddleware;
