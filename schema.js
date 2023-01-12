import { gql } from "apollo-server";

const typeDefs = gql`
  type Query {
    users: [User]
    messages: [Message]
    user(email: String!): User
    quotes: [Quote]
    iquote(by: ID!): [Quote]
    myProfile: User
    sendMessage: [Message]
    getMessages(user: String!, user1: String!): [Message]!
    getThreads(email: String!): [Thread]
  }
  type Thread {
    firstName: String
    lastName: String
    email: String!
    lastMessage: String
    lastMessageTime: String
    name: String
type:String
  }

  type Message {
    _id: ID!
    type: String!
    content: String
    time: String!
    reciever: String!
    sender: String!
    recieverName: String!
    senderName: String!
    users: [User]
  }

  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    quotes: [Quote]
    messages: [Message]
    profile:String
  }

  type Quote {
    name: String
    by: ID
  }
  type Token {
    token: String
    firstName: String
    lastName: String
    email: String
    _id: String
profile:String
  }

  type Mutation {
    signupUser(userNew: UserInput!): User
    updateUser(userUpdate: UserUpdateInput!): User
    signinUser(userSignin: UserSigninInput!): Token
    createQuote(name: String!): String
    sendMessage(messageInput: MessageInput!): Message!
    deleteUser(_id: ID!): Boolean!
  }

  input UserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    profile:String!
  }

input UserUpdateInput {
_id:ID!
    firstName: String!
    lastName: String!
    email: String!
  }
  input MessageInput {
    content: String!
    time: String!
    reciever: String!
    sender: String!
    recieverName: String!
    senderName: String!
type:String!
  }

  input UserSigninInput {
    email: String!
    password: String!
  }
  type Subscription {
    messageSend: Message!
  }
`;
export default typeDefs;
