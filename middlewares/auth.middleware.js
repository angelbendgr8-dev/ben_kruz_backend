const HttpException = require("../helpers/HttpException");

var jwt = require("jsonwebtoken");
const userModel = require("../models/user");

const authMiddleware = async (req, res, next) => {
  console.log(req.headers);
  try {
    const authToken = req.headers.authorization;

    console.log(authToken);
    if (authToken) {
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
    //   console.log(here);
      if (!verified["id"])
        throw new HttpException(401, "invalid authorization token", {});
      const findUser = await userModel.findById(verified['id']);

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, "Wrong authentication token", {}));
      }
    } else {
      next(new HttpException(404, "Authentication token missing", {}));
    }
  } catch (error) {
    next(new HttpException(401, "Wrong authentication token", {}));
  }
};

module.exports = authMiddleware;
