import { NextFunction, Request, Response } from "express";
import { verify } from 'jsonwebtoken';

import authConfig from '../../../../config/auth';
import { UsersRepository } from "../../../../modules/users/repositories/UsersRepository";
import { JWTInvalidTokenError } from "../../../errors/JWTInvalidTokenError";
import { JWTTokenMissingError } from "../../../errors/JWTTokenMissingError";
import { AppError } from "../../../errors/AppError";

interface IPayload {
  sub: string;
}

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new JWTTokenMissingError()
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id } = verify(token, authConfig.jwt.secret) as IPayload;

    const usersRepository = new UsersRepository();
    const user = usersRepository.findById(user_id);

    if (!user) throw new AppError("User does not exists!", 401);

    request.user = {
      id: user_id,
    };

    next();
  } catch {
    throw new JWTInvalidTokenError()
  }
}
