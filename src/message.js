class Message {

    constructor(msg) {

        this.id = null;
        this.body = null;
        this.ttl = null;
        this.created = Date.now();
        this.retry = 0;
        this.timeout = 9000;

        if (msg) {
            if (typeof msg === 'string') msg = JSON.parse(msg);
            Object.assign(this, msg);

        }
    }

}


module.exports = Message;