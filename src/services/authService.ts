import bcrypt from 'bcrypt';
import { User } from '../models';
import { generateToken } from '../utils/jwt';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import { LoginInput, RegisterInput } from '../validations/auth';

export const login = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const register = async (input: RegisterInput) => {
  const { name, email, password } = input;

  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'admin',
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

