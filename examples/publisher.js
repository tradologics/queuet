/* jshint esversion: 6 */

const broker = require("queuet");

// connect to redis
broker.initialize('myqueue');

broker.publish("Hello from QueueT").then(resp => {
    broker.disconnect();
    process.exit(0);
}).catch(err => console.log(err));
