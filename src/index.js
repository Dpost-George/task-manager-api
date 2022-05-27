const app = require("./app");

const port = process.env.PORT;
//express middleware
//without: new request -> run route handler
//with: new request -> do something -> run route handler

app.listen(port, () => {
  console.log(`Server running on port:${port}`);
});
