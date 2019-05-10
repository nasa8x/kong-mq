var Redis = require('ioredis');

var client = new Redis();

(async () => {

    await client.del("channel");

    setTimeout(() => {
        for (let index = 0; index < 10; index++) {
            client.rpush("channel", index.toString());

        }

    }, 5000);


})();