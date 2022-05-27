const mongoose = require("mongoose"); //for generating id for userOne
const jwt = require("jsonwebtoken"); //for generating token for userOne
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Marie Noel, Efouakeu",
  email: "gf@gmail.com",
  password: "56WhatTheHell!!",
  tokens: [{ token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) }],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Kevin yves",
  email: "gf2@gmail.com",
  password: "56WhatTheHell!!",
  tokens: [{ token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET) }],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "1. Kobi Mariage in France ",
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "2. Gonna be the best Programmer rntr",
  completed: true,
  owner: userOneId,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "3. Finish my lifechat app",
  completed: false,
  owner: userTwo._id,
};

const setUpDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();

  await new User(userOne).save();
  await new User(userTwo).save();

  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setUpDatabase,
};
