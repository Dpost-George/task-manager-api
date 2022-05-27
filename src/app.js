const express = require("express");
require("./db/mongoose"); //call and connect to the database

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

app.use(express.json());
//register our routers
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
