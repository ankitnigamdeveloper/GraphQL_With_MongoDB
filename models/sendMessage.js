import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    // required:true
  },
  time: {
    type: String,
    // required:true
  },
  sender: {
    type: String,
    // required:true
  },
  reciever: {
    type: String,
    // required:true
  },
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  recieverName: {
    type: String,
  },
  senderName: {
    type: String,
  },
});

mongoose.model("Thread", messageSchema);
