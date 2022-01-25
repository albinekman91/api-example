import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import express from 'express';
import {
  ApolloServer,
  AuthenticationError,
} from 'apollo-server-express';

import models, { sequelize } from './models';
import schema from './schema';
import resolvers from './resolvers';

import { createUsersWithMessages } from './seeders';

const app = express();

app.use(cors());

const getMe = async (req) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      //JWT verifies the token, based on the token we know which user it is.
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};

//Initialize the server
async function startApolloServer(typeDefs, resolvers) {
  //Define the server as an ApolloServer
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Context makes data available to resolvers
    context: async ({ req }) => {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.SECRET,
      };
    },
  });

  const app = express();
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const eraseDatabaseOnSync = true;

  sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
      //Seeds database with users and messages
      createUsersWithMessages();
    }
    app.listen({ port: 8000 }, () => {
      console.log('Apollo Server on http://localhost:8000/graphql');
    });
  });
}

startApolloServer(schema, resolvers);
