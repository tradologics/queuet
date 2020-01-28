# QueueT - Dead simple, Redis-based, message broker

### Publisher

```javascript
const broker = require("queuet");

// connect to redis
broker.initialize("myqueue");

broker.publish("This is my message").then(resp => {
    broker.disconnect();
    process.exit(0);
}).catch(err => console.log(err));

```

### Subscriber
(starts with getting the backlog)

```javascript
const broker = require("queuet");

// connect to redis
broker.initialize("myqueue");

// handle backlog
broker.read_backlog(do_something);

// subscribe to new items
broker.subscribe(do_something);


function do_something(id, data) {
    console.log(">>", id, data);

    // do some processing here and remove
    // the message from the queue when done
    broker.delete(id);
};

```
