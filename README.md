<img src="https://github.com/tradologics/queuet/blob/master/assets/logo.png?raw=true" height="72">

# Dead Simple, Redis-Based, Message Broker for Node.js

<a href="https://www.npmjs.com/package/queuet"><img alt="npm Version" src="https://badge.fury.io/js/queuet.svg"></a>
<a href="https://www.codefactor.io/repository/github/tradologics/queuet"><img alt="Code Factor" src="https://www.codefactor.io/repository/github/tradologics/queuet/badge"></a>
<a href="https://github.com/tradologics/queuet"><img alt="Star this repo" src="https://img.shields.io/github/stars/tradologics/queuet.svg?style=social&label=Star&maxAge=60"></a>
<a href="https://twitter.com/aroussi"><img alt="Follow me on" src="https://img.shields.io/twitter/follow/tradologics.svg?style=social&label=Follow&maxAge=60"></a>



## Install

```
$ npm install queuet
```

## Use

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
