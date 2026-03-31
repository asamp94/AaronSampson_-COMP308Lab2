import 'dotenv/config';

import express from 'express';
import http from 'node:http';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

import connectToDatabase from './config/mongoose.js';
import { seedAdmin } from './config/seedAdmin.js';
import typeDefs from './schemas/typeDefs.js';
import userResolvers from './resolvers/user.resolvers.js';
import { teamResolvers } from './resolvers/team.resolvers.js';
import { projectResolvers } from './resolvers/project.resolvers.js';
import config from './config/config.js';

// -------------------- App setup --------------------
const app = express();
const httpServer = http.createServer(app);

// -------------------- Middleware --------------------
app.use(
  cors({
    origin: config.server.clientOrigin,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// JWT authentication middleware
app.use((req, _res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(token, config.auth.jwtSecret);
  } catch {
    req.user = null;
  }

  next();
});

// -------------------- Apollo setup --------------------
const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...teamResolvers.Query,
    ...projectResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...teamResolvers.Mutation,
    ...projectResolvers.Mutation,
  },
  Team: teamResolvers.Team,
  Project: projectResolvers.Project,
};

// -------------------- Start the server --------------------
async function start() {
  console.log(`Running in ${config.env} mode`);

  await connectToDatabase();
  await seedAdmin();

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => ({
        req,
        res,
        user: req.user,
      }),
    })
  );

  const PORT = config.server.port;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

start().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});