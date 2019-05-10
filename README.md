# Node.js Redis Message Queue


```js
npm install kong-mq
```

### Example

```js

// push.js

var KongMQ = require('kong-mq');
// redis option https://github.com/NodeRedis/node_redis
var MQ = KongMQ.create({ port: 6379, host: '127.0.0.1' });

// name: queue name 
// auto: auto run (default: false)
// ttl: message expiration time (default: 0 - unlimited; ttl: 5000 - The message will expire in 5 seconds)
// limit: Number of messages processing at the one time (default: 0 - unlimited)
// timeout: message timeout (default: 0 - unlimited)
// retry: number of times the message will be process again if timeout (default: 3)
// debug: show console log (default: true)

var Q = MQ.queue({ name: "test" });


setInterval( () => {      

    for (let index = 0; index < 1000; index++) {
        Q.push({ index: index, date: Date.now() }, (err, res)=>{
            console.log(res);
        });      

    }

}, 10000);


```


```js
// process.js

var MQ = KongMQ.create({ port: 6379, host: '127.0.0.1' });

var Q = MQ.queue({ name: "test", auto: true });

Q.on('process', (message) => {
   
    console.log(Date.now(), process.pid, JSON.stringify(message));
    //await new Promise(resolve => setTimeout(resolve, 5000));
    // console.log( Date.now(),process.pid, "end wait 5s");
    // Q.ack(message);

});

```



```js
// sub.js

var MQ = KongMQ.create({ port: 6379, host: '127.0.0.1' });

MQ.subscribe('channel',()=>{
    // do something
});

MQ.on('message', function (channel, message) {   
    console.log('Receive message %s from channel %s', message, channel);
});

```

```js
// pub.js
var MQ = KongMQ.create({ port: 6379, host: '127.0.0.1' });
MQ.publish('channel', 'Hello world!');

```

```js 
// limit process message

var MQ = KongMQ.create({ port: 6379, host: '127.0.0.1' });

var Q = MQ.queue({ name: "test", auto: true, limit: 1 });

Q.on('process', (message) => {
   
    console.log(Date.now(), process.pid, JSON.stringify(message));
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log( Date.now(),process.pid, "end wait 5s");

    // If you limit the number of message processing, you need to call the ack to determine if the message has been processed.
    Q.ack(message); 

});


```

```js 

// process multiple queues 
var MQ = KongMQ.create({ port: 6379, host: '127.0.0.1' });

MQ.process(['USDT-BTC', 'GEEK-BTC', 'XLM-BTC', 'USDT-GEEK','XRP-USDT', 'XLM-USDT', 'DASH-USDT'], { limit: 1});

MQ.on('process', async (queue, message) => {
 
    console.log(Date.now(), process.pid, queue.name, JSON.stringify(message));
    queue.ack(message);
   
});


```