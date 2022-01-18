import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();

app.use(cors());

let users = {
  1: {
    id: '1',
    username: 'Albin Martinsson',
    messageIds: [1],
  },
  2: {
    id: '2',
    username: 'David Öhlin',
    messageIds: [2],
  },
};

let messages = {
  1: {
    id: '1',
    text: 'Hello World',
    userId: '1',
  },
  2: {
    id: '2',
    text: 'By World',
    userId: '2',
  },
};

const schema = gql`
  type Query {
    users: [User!]
    user(id: ID!): User
    me: User
    messages: [Message!]
    message(id: ID!): Message
  }

  type Mutation {
    createMessage(text: String!): Message!
  }

  type User {
    id: ID!
    username: String!
    messages: [Message!]
  }

  type Message {
    id: ID!
    text: String!
    user: User!
  }
`;

const resolvers = {
  Query: {
    users: () => {
      return Object.values(users);
    },
    user: (parent, { id }) => {
      return users[id];
    },
    me: (parent, args, { me }) => {
      return me;
    },
    messages: () => {
      return Object.values(messages);
    },
    message: (parent, { id }) => {
      return messages[id];
    },
  },
  Mutation: {
    createMessage: (parent, { text }, { me }) => {
      const id = uuidv4();
      const message = {
        id,
        text,
        userId: me.id,
      };

      //Mutation side effect
      messages[id] = message;
      users[me.id].messageIds.push(id);

      return message;
    },
  },
  User: {
    messages: (user) => {
      return user.messageIds.map((messageId) => messages[messageId]);
    },
  },
  Message: {
    user: (parent) => {
      return users[parent.userId];
    },
  },
};

//Initialize the server
async function startApolloServer(typeDefs, resolvers) {
  //Define the server as an ApolloServer
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { me: users[1] },
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
