import jwt from 'jsonwebtoken';
import UserModel from '../models/user.server.model.js';
import config from '../config/config.js';

// Helper function: sign JWT (include role)
const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );

// helper function for authorization
const requireAuth = (user) => {
  if (!user) throw new Error('Not authenticated');
};
// helper function for admin authorization
const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
};

const userResolvers = {
  Query: {
    // Admin-only query
    users: async (_, __, { user }) => {
      requireAdmin(user);
      return UserModel.find();
    },

    user: async (_, { id }, { user }) => {
      requireAuth(user);
      if (user.id !== id && user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return UserModel.findById(id);
    },

    // return currently authenticated user
    me: async (_, __, { user }) => {
      if (!user) return null;
      return UserModel.findById(user.id);
    },

    isLoggedIn: (_, __, { user }) => !!user,
  },

  Mutation: {
    createUser: async (_, { userName, email, password, role }, { user }) => {
      requireAdmin(user);

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use');
      }

      const newUser = new UserModel({
        userName,
        email,
        password,
        role: role ?? 'member',
      });

      return newUser.save();
    },

    // User can update only their own account
    updateUser: async (_, { id, userName, email }, { user }) => {
      requireAuth(user);

      if (user.id !== id && user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      return UserModel.findByIdAndUpdate(
        id,
        { userName, email },
        { new: true }
      );
    },

    deleteUser: async (_, { id }, { user }) => {
      requireAdmin(user);

      const target = await UserModel.findById(id);
      if (!target) throw new Error('User not found');

      await target.deleteOne();
      return true;
    },

    // Authentication entry point
    loginUser: async (_, { email, password }, { res }) => {
      const user = await UserModel.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // JWT includes role
      const token = signToken(user);

      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.env === 'production',
        maxAge: 60 * 60 * 1000,
      });

      return {
        user: {
          id: user.id,
          userName: user.userName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    },

    logOut: (_, __, { res }) => {
      res.clearCookie('token');
      return 'Logged out successfully';
    },
  },
};

export default userResolvers;