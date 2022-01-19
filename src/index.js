import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';

import models, { sequelize } from './models';
import schema from './schema';
import resolvers from './resolvers';

import { createUsersWithMessages } from './seeders';

const app = express();

app.use(cors());

//Initialize the server
async function startApolloServer(typeDefs, resolvers) {
  //Define the server as an ApolloServer
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => ({
      models,
      me: await models.User.findByLogin('rwieruch'),
    }),
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
