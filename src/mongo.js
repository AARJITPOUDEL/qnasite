const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/LoginFormPractice")
  .then(() => {
    console.log("Mongoose connected");
  })
  .catch((e) => {
    console.log("Failed to connect");
  });

const logInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["youtube", "writer"],
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityQuestion",
    },
  ],
});

const communityQuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LogInCollection",
  },
  userName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
});
const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LogInCollection",
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CommunityQuestion",
  },
  reply: {
    type: String,
    required: true,
  },
});

const LogInCollection = mongoose.model("LogInCollection", logInSchema);
const CommunityQuestion = mongoose.model(
  "CommunityQuestion",
  communityQuestionSchema
);
const Reply = mongoose.model("Reply", replySchema);
module.exports = {
  LogInCollection,
  CommunityQuestion,
  Reply,
};
