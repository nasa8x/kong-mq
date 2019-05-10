var KongMQ = require('./dist');


var MQ = KongMQ.create({ port: 6379, host: '127.0.0.1' });


// require('./cluster')('my', () => {


// var Q = MQ.queue({ name: "abc", auto: true });

MQ.process(['abc'], { limit: 1 });

// Q.consume((msg)=>{

//     console.log(process.pid, Date.now(), JSON.stringify(msg));
// });


MQ.on('process', (queue, message) => {
    // Receive message Hello world! from channel news
    // Receive message Hello again! from channel music
    console.log(Date.now(), process.pid, queue.name, JSON.stringify(message));
    //await new Promise(resolve => setTimeout(resolve, 5000));
    // console.log( Date.now(),process.pid, "end wait 2s");
    queue.ack(message);

});

// Q.on('process', async (message) => {
//     // Receive message Hello world! from channel news
//     // Receive message Hello again! from channel music
//     console.log(Date.now(), process.pid, JSON.stringify(message));
//     //await new Promise(resolve => setTimeout(resolve, 5000));
//     // console.log( Date.now(),process.pid, "end wait 2s");
//     // Q.ack(message);

// });


// });