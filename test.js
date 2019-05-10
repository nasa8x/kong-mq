var KongMQ = require('./dist');


var MQ = KongMQ.create({ port: 6379, host: '127.0.0.1' });



// var Pub = KongMQ.create({});

// MQ.on('connect', function () {

//     console.log("connect", arguments);
// });

// MQ.subscribe("abc", function () {

// });


// MQ.on('message', function (channel, message) {
//     // Receive message Hello world! from channel news
//     // Receive message Hello again! from channel music
//     console.log('Receive message %s from channel %s', message, channel);
// });



// setInterval(function () {

//     try {
//         // Pub.publish('news', 'Hello world!',);

//         // Pub.publish('def', 'Hello world! def');

//         Pub.publish('abc', 'Hello world! abc', function () { });

//     } catch (error) {
//         console.log(error);
//     }


// }, 5000)


// require('./cluster')('my', () => {

//     var Q = MQ.queue({ name: "abc" });
//     Q.flush();
//     var index = 0;

//     setInterval(function () {
//         // Pub.publish('news', 'Hello world!',);

//         // Pub.publish('def', 'Hello world! def');
//         console.log(process.pid, "push-message");

//         index += 1;
//         Q.push({ index: index, date: Date.now() });
//         index += 1;
//         Q.push({ index: index, date: Date.now() });


//     }, 8000);


// });


var Q = MQ.queue({ name: "abc" });
Q.flush();
var index = 0;

setInterval(async () => {
    // Pub.publish('news', 'Hello world!',);

    // Pub.publish('def', 'Hello world! def');
    // console.log(process.pid, "push-message");

    // index += 1;
    // Q.push({ index: index, date: Date.now() }, (err, res) => {
    //     console.log(err);
    //     console.log(res);
    // });
    // index += 1;
    // Q.push({ index: index, date: Date.now() }, (err, res)=>{
    //     console.log(res);
    // });

    console.log(process.pid, Date.now(), "push-message");

    for (let index = 0; index < 1000; index++) {
        // Q.push({ index: index, date: Date.now() }, (err, res)=>{
        //     console.log(res);
        // });

        // await Q.push({ index: index, date: Date.now() }, { timeout: 1000, retry: 3 });
         Q.push({ index: index, date: Date.now() });

    }


}, 10000);

