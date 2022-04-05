const server = require("./server");
const persist = require("./persist");

// define a port
const port = process.env.PORT || 8080;

persist.onConnect(() => {
  // start the server
  server.listen(port, () => {
    console.log(`Running server on port ${port}`);
  });
});

// connect to the database
persist.connect();
