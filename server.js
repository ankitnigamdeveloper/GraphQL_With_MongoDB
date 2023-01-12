import { ApolloServer, gql } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import typeDefs from "./schema.js";
import jwt from "jsonwebtoken";

import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import mongoose from "mongoose";
import { JWT_SECRET, MONGO_URI } from "./config.js";
// import { makeExecutableSchema } from '@graphql-tools/schema'
// import { createServer} from 'http'
import express from "express";

const app = express();
const httpServer = createServer(app);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to mongoDB");
});

mongoose.connection.on("error", (e) => {
  console.log("Error on connecting", e);
});

//import Models
import "./models/User.js";
import "./models/Quotes.js";
import "./models/sendMessage.js";

import resolvers from "./resolvers.js";
//This is midile ware context
const context = ({ req }) => {
  const { authorization } = req.headers;

  if (authorization) {
    const { userId } = jwt.verify(authorization, JWT_SECRET);
    return { userId };
  }
};
///

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({ httpServer }),
    // ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});
server.listen(8080).then(({ url }) => {
  console.log(`server ready at ${url}`);
});

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  // server: httpServer,
  path: "/graphql",
port:8081
});

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer);
