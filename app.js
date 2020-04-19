const express = require('express');
const open = require('open');

const redis = require("redis");
const client = redis.createClient();
const PORT = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('views'));

client.on("error", function(error) {
    console.error(error);
});

//index page (Entry point)
app.get('/', (req, res) => {
    res.render("index", { type: "0", reply: "Connection Established" });
});

//set in redis
app.get('/set', (req, res) => {
    client.set(req.query.key, req.query.value, (err, reply) => {
        if (err) {
            res.render("index", { type: "0", reply: err });
        }
        else {
            res.render("index", { type: "0", reply: "Set operation performed" });
        }
    });
});

// GET method
app.get('/get', (req, res) => {
    client.get(req.query.key, (err, reply) => {
        if (err) {
            res.render("index", { type: "0", reply: err });
        }
        else {
            if(reply == null)
            res.render("index", { type: "0", reply: "Key does not exist" });
            else
            res.render("index", { type: "0", reply: "Key: " + req.query.key + " Value: " + reply });
        }
    });
});

// delete key
app.get("/delete", (req, res) => {
    client.del(req.query.key, (err, reply) => {
        if (err) {
            console.log(err);
        } else {
            if (reply == 1) {
                res.render("index", { type: "0", reply: "Key Deleted" });
            } else {
                res.render("index", { type: "0", reply: "Key DOES NOT exist in DB" });
            }
        }
    });
});

app.get("/keys", (req, res) => {
    client.keys(req.query.key, (err, reply) => {
        if (err) {
            console.log(err);
        } else {
                res.render("index", { type: "2", reply: reply });
        }
    });
});



// set expiry
app.get('/expire', (req, res) => {
    client.expire(req.query.key, req.query.value, (err, reply) => {
        if (err) {
            res.render("index", { type: "0", reply: err });
        }
        else {
            if (reply)
                res.render("index", { type: "0", reply: "Expiry set for key: " + req.query.key });
            else
                res.render("index", { type: "0", reply: "\"" + req.query.key + "\" does not exist!!!!" });
        }
    });
});

// check time to expire
app.get("/remaining", (req, res) => {

    client.ttl(req.query.key, (err, reply) => {
        if (err) {
            console.log(err);
        }
        else {
            if (reply == -1) {
                res.render("index", { type: "0", reply: "Timeout Not assigned for this key" });
            }
            else if (reply == -2) {
                res.render("index", { type: "0", reply: "Key does not exist" });
            }
            else {
                res.render("index", { type: "0", reply: "Time Remaining: " + reply });
            }
        }
    });
});

// Add value in sorted set
app.get("/zadd", (req, res) => {
    client.zadd(req.query.name, req.query.score, req.query.value, (err, reply) => {
        if (err) {
            console.log(err);
        }
        else {
            if (reply == 0) {
                res.render("index", { type: "0", reply: "Updated \"" + req.query.value + "\" score to " + req.query.score });
            }
            else {
                res.render("index", { type: "0", reply: "Added \"" + req.query.value + "\" in set: \"" + req.query.name + "\" " });
            }
        }
    });
});

// find rank in sorted set
app.get("/zrank", (req, res) => {
    client.zrank(req.query.name, req.query.value, (err, reply) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(reply);
            if (reply != null) {
                res.render("index", { type: "0", reply: "0 based rank of \"" + req.query.value + "\" in set: \"" + req.query.name + "\" is " + reply });
            }
            else {
                res.render("index", { type: "0", reply: "\""+req.query.value + "\" does not exist in set: \"" + req.query.name + "\"" });
            }
        }
    });
});

//find all elements in given range in sorted set
app.get("/zrange", (req, res) => {
    console.log(req.query);
    if (req.query.withscores == "true") {
        client.zrange(req.query.name, req.query.start, req.query.end, "withscores", (err, reply) => {
            if (err) {
                console.log(err);
            }
            else {
                if (reply.length != 0) {
                    console.log(reply);
                    res.render("index", { reply: reply, type: "1" });
                }
                else {
                    res.render("index", { reply: "Set \"" + req.query.name + "\" doesn't contains any value", type: "0" });
                }
            }
        });
    }
    else {
        client.zrange(req.query.name, req.query.start, req.query.end, (err, reply) => {
            if (err) {
                console.log(err);
            }
            else {
                if (reply.length != 0) {
                    res.render("index", { reply: reply, type: "2" });
                }
                else {
                    res.render("index", { reply: "Set \"" + req.query.name + "\" doesn't contains any value", type: "0" });
                }
            }
        });
    }
});

// flush the existing DB
app.get('/flush', (req, res) => {
    client.flushall((err, reply) => {
        if (err) {
            res.render("index", { type: "0", reply: err });
        }
        else {
            res.render("index", { type: "0", reply: "Database Flushed" });
        }
    });
});

open("http://localhost:" + PORT);

app.listen(PORT);
