const express = require("express");
require("./db/mongoose"); //call and connect to the database

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

app.use(express.json());
//register our routers
app.use(userRouter);
app.use(taskRouter);

//express middleware
//without: new request -> run route handler
//with: new request -> do something -> run route handler

app.listen(port, () => {
  console.log(`Server running on port:${port}`);
});
