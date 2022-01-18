import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

import models, { sequelize } from './models';
import schema from './schema';
import resolvers from './resolvers';

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
      createUsersWithMessages();
    }
    app.listen({ port: 8000 }, () => {
      console.log('Apollo Server on http://localhost:8000/graphql');
    });
  });

  const createUsersWithMessages = async () => {
    await models.User.create(
      {
        username: 'rwieruch',
        messages: [
          {
            text: 'Published the Road to learn React',
          },
        ],
      },
      {
        include: [models.Message],
      },
    );

    await models.User.create(
      {
        username: 'ddavids',
        messages: [
          {
            text: 'Happy to release ...',
          },
          {
            text: 'Published a complete ...',
          },
        ],
      },
      {
        include: [models.Message],
      },
    );
  };
}

startApolloServer(schema, resolvers);
