import { Request, Response, NextFunction } from 'express';
import { login as loginService, register as registerService } from '../services/authService';
import { LoginInput, RegisterInput } from '../validations/auth';

export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginService(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await registerService(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

