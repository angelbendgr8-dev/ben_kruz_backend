import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import HttpException from '../helpers/HttpException';

const validationMiddleware = (
  type,
  value = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
) => {
  return (req, res, next) => {
    validate(plainToClass(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors) => {
      if (errors.length > 0) {
        const derrors = {};
        errors.map((error) => {
          const message = Object.values(error.constraints);
          const label = error.property;
          derrors[label] = message[0];
        });

        next(new HttpException(400, 'Invalid input', derrors));
      } else {
        next();
      }
    });
  };
};

module.exports = validationMiddleware;
