
var util = require('util'),
    // Redis = require('ioredis'),
    Redis = require('redis'),
    EventEmitter = require('events').EventEmitter,
    Queue = require('./queue');


function KongMQ(options) {

    EventEmitter.call(this);

    // this.client = options.clusters ? new Redis.Cluster(options.clusters, options) : new Redis(options);
    this.client = Redis.createClient(options);

    this.init();

}

KongMQ.prototype = {
    init: function () {
        ['connect', 'ready', 'error', 'close', 'reconnecting', 'end', 'message', 'messageBuffer'].forEach(e => {

            this.client.on(e, (...args) => {
                //var args = Array.prototype.slice.call(arguments);
                this.emit(e, ...args);
            });

        });
    },
    subscribe: function (...args) {

        this.client.subscribe(...args);
    },
    publish: function (...args) {
        this.client.publish(...args);
    },

    queue: function (options) {
        return new Queue(this.client, options);
    },

    process: function (queues, options) {

        if (!util.isArray(queues))
            queues = [queues];

        for (let i = 0; i < queues.length; i++) {
            var q = queues[i];

            var queue = this.queue(Object.assign({ name: q, auto: true }, options || {}));

            queue.on('process', (msg) => { this.emit('process', q, msg); });

        }

    },


    end: function () {
        this.client.end();
    }
}


util.inherits(KongMQ, EventEmitter);


function create(options) {
    return new KongMQ(options);
}

exports = module.exports.create = create;