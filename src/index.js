const mongoose = require("mongoose");
const app = require("./app");
const routes = require("./routes/v1");
const config = require("./config/config");
const logger = require("./config/logger");

app.use("/users", routes);


let server;
mongoose.set("strictQuery", false);
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port
server = mongoose.connect(config.mongoose.url,config.mongoose.options).then(() => {
  logger.info('Database connection successful')
})
.catch(err => {
  logger.info('Database connection error',err)
})

// Start the Node server
app.listen(config.port, () => {
  logger.info(`App is running on port ${config.port}`);
});

// ------------- Don't Modify  -------------
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
// ------------- Don't Modify  -------------
