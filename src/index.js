import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();

const schema = gql`
  type Query {
    me: User
  }
  type User {
    username: String!
    email: String!
  }
`;

const resolvers = {
  Query: {
    me: () => {
      return {
        username: 'Albin Martinsson',
        email: 'albin@kodverket.io',
      };
    },
  },
};

//Initialize the server
async function startApolloServer(typeDefs, resolvers) {
  //Define the server as an ApolloServer
  const server = new ApolloServer({ typeDefs, resolvers });
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
