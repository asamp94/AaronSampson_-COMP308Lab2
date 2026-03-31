import 'dotenv/config';

const NODE_ENV = process.env.NODE_ENV ?? 'development';

const config = {
  env: NODE_ENV,

  server: {
    port: Number(process.env.PORT ?? 4000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  },

  database: {
    mongoUri:
      process.env.MONGO_URI ??
      'mongodb://127.0.0.1:27017/team-project-db',
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'dev_only_change_me',
    jwtExpiresIn: '1h',
  },
};

export default config;