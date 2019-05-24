var util = require('util'),
    crypto = require('crypto'),
    EventEmitter = require('events').EventEmitter,
    Message = require('./message');

function Queue(client, options) {

    if (!options.name) {
        throw new Error('The queue name has not been configured yet.');
    }

    EventEmitter.call(this);
    this.options = Object.assign({ prefix: "KongMQ", auto: false, ttl: 0, limit: 0, retry: 3, debug: true, timeout: 0 }, options);
    this.id = [this.options.prefix, options.name].join(':');
    this.name = options.name;
    this.client = client;
    this.idle = false;
    this.acknowledged = true;
    this.timer = null;

    this.init();


}


Queue.prototype = {

    _key: function (x) {
        return [this.options.prefix, this.options.name, x].join(':');
    },
    _expired: function (msg) {
        var ttl = msg.ttl || this.options.ttl;
        var t = Date.now();

        return ttl ? (msg.created + ttl) - t <= 0 : false;

    },

    log: function (msg) {
        if (this.options.debug) {
            console.debug("KongMQ:", msg);
        }
    },

    init: function () {

        this.on('next', () => { this.pop(); })

            .on('ack', (msg) => { this.acknowledged = true; this.pop(); })

            .on('expired', (message) => {

                this.log(`Processing expired message [${message.id}]...`);

                this.client.hdel(this._key('processing'), message.id, (err, res) => {
                    if (err) this.emit('error', err);

                    this.emit('destroyed', message);
                    this.emit('ack', message);
                });

            })

            .on('timeout', (msg) => {

                msg.retry += 1;

                var multi = this.client.multi();

                if (msg.retry < this.options.retry) {
                    multi.rpush(this.id, JSON.stringify(msg));
                }
                multi.hdel(this._key('processing'), msg.id)
                    // .decr(this._key('count'))
                    .exec((err) => {
                        if (err) this.emit('error', err);

                        if (msg.retry > this.options.retry) {
                            this.log(`Moving message ID [${msg.id}] to dead-letter queue...`);
                            this.emit('dead', msg);
                        } else {
                            this.log(`Re-queuing message (ID [${msg.id}], attempts [${msg.retry}])...`);
                            this.emit('requeued', msg);
                        }

                        this.emit('ack', msg);

                    });

            })
            .on('error', (err) => { console.error(err); });


        process.on('SIGINT', () => { this.exit() });
        process.on('SIGTERM', () => { this.exit() });

        if (this.options.auto) {
            this.run();
        }

    },

    run: function () {
        setTimeout(() => { this.pop() }, 1000);
    },


    push: function (message, option, callback) {

        var msg = new Message(Object.assign({ body: message }, option || {}));
        if (util.isNullOrUndefined(msg.id))
            msg.id = this.random(6);

        this.client.rpush(this.id, JSON.stringify(msg), callback);
    },

    process: function (msg) {

        if (this._expired(msg)) {
            this.emit('expired', msg);
        } else {
            this.log(`Processing message [${msg.id}]...`);

            var t = msg.timeout || this.options.timeout;
            if (t)
                this.timer = setTimeout(() => { this.emit('timeout', msg); }, t);

            this.client.hset(this._key('processing'), msg.id, JSON.stringify(msg), (err, res) => {
                if (err) this.emit('error', err);

                this.emit('process', msg);

                if (!this.options.limit)
                    this.ack(msg);


            });
        }


    },

    pop: function () {

        if (this.idle) return;

        if (this.timer) clearTimeout(this.timer);

        this.client.hlen(this._key('processing'), (err, cnt) => {

            var l = parseInt(cnt) || 0;

            if (this.options.limit > 0 && l >= this.options.limit) return;

            this.client.lpop(this.id, (err, res) => {
                if (err) this.emit('error', err);

                if (res) {
                    this.process(JSON.parse(res));

                } else {
                    this.run();
                }

            });

        });

    },


    ack: function (msg) {

        this.client.hdel(this._key('processing'), msg.id, (err, res) => {
            if (err) this.emit('error', err);

            this.log(`Message [${msg.id}] successfully processed`);
            this.emit('ack', msg);
        });
    },

    pause: function () {
        this.idle = true;
    },
    resume: function () {
        this.idle = false;
    },

    flush: function (callback) {
        this.client.multi()
            .del(this.id)
            .del(this._key('processing'))
            .exec(() => {
                if (util.isFunction(callback))
                    callback.apply(this);
            });
    },
    clean: function () {
        this.flush();
    },
    exit: function () {

        this.pause();

        setTimeout(() => { process.exit(0); }, 3000);
    },
    random: function (len) {
        // var i, j, possible, ref, text;
        // text = "";
        // possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        // for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        //     text += possible.charAt(Math.floor(Math.random() * possible.length));
        // }
        // return text;

        return crypto.randomBytes(len).toString('hex');
    }


}

util.inherits(Queue, EventEmitter);

exports = module.exports = Queue;