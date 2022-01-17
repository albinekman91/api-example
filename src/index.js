import cors from 'cors';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();

app.use(cors());

let users = {
  1: {
    id: '1',
    username: 'Albin Martinsson',
  },
  2: {
    id: '2',
    username: 'David Öhlin',
  },
};

const me = users[1];

const schema = gql`
  type Query {
    me: User
    user(id: ID!): User
  }
  type User {
    id: ID!
    username: String!
  }
`;

const resolvers = {
  Query: {
    me: () => {
      return me;
    },
    user: (parent, { id }) => {
      return users[id];
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
