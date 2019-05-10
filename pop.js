var Redis = require('ioredis');

var client = new Redis();

function pop() {
    client.lpop("channel", (err, res) => {
        console.log('val:', res);

        if (res || res=='')
            pop();
        else {
            setTimeout(()=>{pop()}, 2000);
        }
    });
}

pop();
