import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

import models from './models';
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
    context: { models, me: models.users[1] },
  });
  const app = express();
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen({ port: 8000 }, () => {
    console.log(
      `Server is listening on port 8000 ${server.graphqlPath}`,
    );
  });
}

startApolloServer(schema, resolvers);
