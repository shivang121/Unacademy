const express = require('express');
const open = require('open');

const redis = require("redis");
const client = redis.createClient();
const PORT = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('views'));

//index page (Entry point)
app.get('/', (req, res) => {
    res.render("index", { reply: "Connection Established" });
});

//set in redis
app.get('/set', (req, res) => {
    client.set(req.query.key, req.query.value, function (err, reply) {
        if (err) {
            res.render("index", { reply: err });
        }
        else{
            res.render("index", { reply: "Set operation performed" });
        }
    });
});

app.get('/get', (req, res) => {
    client.get(req.query.key, function (err, reply) {
        if (err) {
            res.render("index", { reply: err });
        }
        else{
            res.render("index", { reply: "Key: " + req.query.key + " Value: " + reply });
        }
    });
});

app.get('/expire', (req, res) => {
    client.expire(req.query.key, req.query.value, function (err, reply) {
        if (err) {
            res.render("index", { reply: err });
        }
        else {
            if (reply)
                res.render("index", { reply: "Expiry set for key: " + req.query.key });
            else
                res.render("index", { reply: req.query.key + " does not exist!!!!" });
        }
    });
});
app.get("/remaining", (req, res) => {

    client.ttl(req.query.key, (err, reply) => {
        if (err) {
            console.log(err);
        }
        else {
            if (reply == -1) {
                res.render("index", { reply: "Timeout Not assigned for this key" });
            }
            else if (reply == -2) {
                res.render("index", { reply: "Key does not exist!!!!" });
            }
            else {
                res.render("index", { reply: "Time Remaining: " + reply });
            }
        }
    });
});

app.get("/zadd", (req, res) => {
    client.zadd(req.query.name, req.query.score, req.query.value, (err, reply) => {
        if (err) {
            console.log(err);
        }
        else {
            if (reply == 0) {
                res.render("index", { reply: "Updated " + req.query.value + " score to " + req.query.score });
            }
            else {
                res.render("index", { reply: "Added " + req.query.value + " in set: " + req.query.name });
            }
        }
    });
});

app.get("/zrank", (req, res) => {
    client.zrank(req.query.name, req.query.value, (err, reply) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(reply);
            if (reply != null) {
                res.render("index", { reply: "0 based rank of " + req.query.value + " in set: " + req.query.name + " is " + reply });
            }
            else {
                res.render("index", { reply: req.query.value + " does not exist in set: " + req.query.name });
            }
        }
    });
});
app.get("/zrange", (req, res) => {
    console.log(req.query);
    if (req.query.withscores == "true") {
        client.zrange(req.query.name, req.query.start, req.query.end, "withscores", (err, reply) => {
            if (err) {
                console.log(err);
            }
            else {
                if (reply.length != 0) {
                    res.render("index", { reply: reply });
                    // res.send(reply);
                }
                else {
                    res.render("index", { reply: "Set "+ req.query.name + " doesn't contains any value" });
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
                    res.render("index", { reply: reply });
                    // res.send(reply);
                }
                else {
                    res.render("index", { reply: "Set "+ req.query.name + " doesn't contains any value" });
                }
            }
        });
    }
});

app.get('/flush', (req, res) => {
    client.flushall((err, reply) => {
        if (err) {
            res.render("index", { reply: err });
        }
        else{
            res.render("index", { reply: "Database Flushed" });
        }
    });
});

open("http://localhost:"+PORT);

app.listen(PORT);
