import { gql } from 'apollo-server-express';

import userSchema from './user';
import messageSchema from './message';

//This links our schema together, this is needed for us to be able to extend the types.
// https://stackoverflow.com/questions/58569132/why-do-we-need-another-schema-for-schema-stitching
const linkSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, messageSchema];
