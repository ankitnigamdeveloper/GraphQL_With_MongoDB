import { userList, quotes } from "./fakedb.js";
import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET } from "./config.js";
import bcryptjs from "bcryptjs";
import { withFilter, PubSub } from "graphql-subscriptions";

const User = mongoose.model("User");
const Quote = mongoose.model("Quote");
const Message = mongoose.model("Thread");
const pubsub = new PubSub();

const resolvers = {
  // Query:{
  // greet:()=>"Hello world"
  // },
  Query: {
    users: async () => await User.find({}),

    messages: async () => await Message.find({}),
    user: async (_, { email }) => await User.findOne({ email }), //users.find((user) => user._id == _id),
    quotes: async () => await Quote.find({}),
    iquote: async (_, { by }) => await Quote.find({ by }), //quotes.filter((quote) => quote.by == by),
    myProfile: async (_, args, { userId }) => {
      if (!userId) throw new Error("you must be logged in");
      return await User.findOne({ _id: userId });
    },

    getMessages: async (parent, { user, user1 }) => {
      try {
        const usernames = [user, user1];

        const messages = await Message.find({
          sender: {
            $in: usernames,
          },
          reciever: {
            $in: usernames,
          },
        }).sort({
          createdAt: -1,
        });

        return messages;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    getThreads: async (_, { email }) => {
      var val = [];
      const message = await Message.find({
        $or: [{ sender: email }, { reciever: email }],
      });
      var arr = [];
      message.reverse().map(async (item) => {
        // if(item.sender === email){
        // arr.push(item)
        // }
        if (arr == []) {
          arr.push(item);
        } else {
          if (item.sender === email) {
            if (
              arr.find((element) => {
                return element.reciever === item.reciever;
              }) ||
              arr.find((element) => {
                return element.sender === item.reciever;
              })
            ) {
              // console.log("hiii");
            } else {
              arr.push(item);
            }
          } else if (item.reciever === email) {
            if (
              arr.find((element) => {
                return element.reciever === item.sender;
              }) ||
              arr.find((element) => {
                return element.sender === item.sender;
              })
            ) {
              // console.log("hello");
            } else {
              arr.push(item);
            }
          }
        }
      });

      // console.log(arr);
      // console.log(arr.length);

      arr.map(async (item) => {
        if (item.sender === email) {
          // var uu = await User.findOne({ email: item.reciever });
          // console.log(uu)
          var dd = {
            // firstName: uu.firstName,
            // lastName: uu.lastName,
            email: item.reciever,
            lastMessage: item.type === "text" ? item.content : "",
            type: item.type,
            lastMessageTime: item.time,
            name: item.recieverName,
          };
          // console.log(dd);
          val.push(dd);
        } else {
          var dd = {
            // firstName: uu.firstName,
            // lastName: uu.lastName,
            email: item.sender,
            lastMessage: item.type === "text" ? item.content : "",
            lastMessageTime: item.time,
            name: item.senderName,
          };
          // console.log(dd);
          val.push(dd);
        }
      });

      return val;
    },
  },

  Message: {
    users: async ({ sender }) => await User.find({ email: sender }),
  },

  User: {
    messages: async ({ email }) =>
      await Message.find({ $or: [{ sender: email }, { reciever: email }] }),

    // },
    // User: {
    quotes: async (ur) => await Quote.find({ by: ur._id }), //quotes.filter((quote) => quote.by == ur._id),
  },

  Mutation: {
    sendMessage: async (_, { messageInput }) => {
      const msg = new Message(messageInput);
      const _id = crypto.randomBytes(16).toString("hex");

      await pubsub
        .publish("NEW_MESSAGE", {
          messageSend: { ...messageInput, _id: _id },
        })
        .then((e) => {
          // console.log(e)
        })
        .catch((e) => console.log(e));
      return await msg.save();
    },
    updateUser: async (_, { userUpdate }) => {
      return await User.findOneAndUpdate(
        {
          _id: userUpdate._id,
        },
        {
          $set: {
            ...userUpdate,
          },
        },
        {
          new: true,
        }
      );
    },
    deleteUser: async (_, { _id }) => {
      try {
        await User.findOneAndRemove({ _id: _id });
        return true;
      } catch (err) {
        return false;
      }
    },
    signupUser: async (_, { userNew }) => {
      const user = await User.findOne({ email: userNew.email });
      if (user) {
        throw new Error("User already exist");
      }
      const hashedPassword = await bcrypt.hash(userNew.password, 10);
      const newUser = new User({
        ...userNew,
        password: hashedPassword,
      });
      return await newUser.save();
    },
    signinUser: async (_, { userSignin }) => {
      const user = await User.findOne({ email: userSignin.email });
      if (!user) {
        throw new Error("User does't exists with that email");
      }
      const doMatch = await bcryptjs.compare(
        userSignin.password,
        user.password
      );
      if (!doMatch) {
        throw new Error("Email or password in Invalid");
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      // console.log(user)
      const tok = {
        token,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profile: user.profile ? user.profile : "",
        _id: user._id,
      };
      return tok;
    },

    createQuote: async (_, { name }, { userId }) => {
      if (!userId) throw new Error("You must be logged in ");
      const newQuote = new Quote({
        name,
        by: userId,
      });
      await newQuote.save();
      return "Quote save successfully";
    },
  },
  Subscription: {
    messageSend: {
      subscribe: () => pubsub.asyncIterator(["NEW_MESSAGE"]),
    },
  },
};
export default resolvers;
