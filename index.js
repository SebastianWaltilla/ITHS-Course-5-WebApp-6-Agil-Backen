const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
var bodyParser = require('body-parser')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

express()
  .use(express.static(path.join(__dirname, 'public')))
    .use(bodyParser.json())
    .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

    // Teacher creates a new game, with room code, and generated gamecode
    .post('/v1/creategame', async (req, res) => {
            try {
                const client = await pool.connect()
                var room = req.body.room;
                var gamecode = req.body.gamecode;

                var check = await client.query("select gamecode from gametable where room = '" + room + "' limit 1");
                    if ( check.rows.length === 0){
                        var result = await client.query("INSERT INTO teacher values ('" + room + "','" + gamecode +  "')" );
                        res.status(200).send('SUCCESS');
                    }
                    else {
                        res.status(403).send("Room code already exists");                    }


                client.release();
            } catch (err) {
                console.error(err);
                res.send("Error in post method: " + err);
            }
        }
    )


    // Student
    // get spelkod by rumskod
    .get('/v1/room/:room', async (req, res) => {
        try {
            var room = req.params.room;
            const client = await pool.connect()
            const result = await client.query("SELECT gamecode FROM gametable WHERE room = '" + room + "'");
            //const results = { 'results': (result) ? result.rows : null};
            res.send(result.rows[0]);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .post('/v1/createplayer', async (req, res) => {
        try {
            const client = await pool.connect()
            var room = req.body.room
            var nickname = req.body.nickname;

            const result = await client.query("INSERT INTO playertable values ('" + nickname + "'," + -1 + "," + -1 + ",'" + room +"')" );
            res.status(201).send("User with nickname " + nickname + " created");
            client.release();
        } catch (err) {
            console.error(err);
            console.log(req.body.nickname + ' = req.body.nick');
            res.send("Error in post method: " + err);
        }
    }
    )
    .put('/v1/playerresult', async (req, res) => {
            try {
                const client = await pool.connect()
                var room = req.body.room
                var nickname = req.body.nickname;
                var correctanswers = req.body.correctanswers
                var totaltime = req.body.totaltime

                const result = await client.query
                ("UPDATE playertable SET correctanswers=" + correctanswers + ", totaltime=" + totaltime  +
                    " WHERE nickname = '" + nickname + "' AND room = '" + room +"'");
                res.status(200).send('SUCCESS send result ');
                client.release();
            } catch (err) {
                console.error(err);
                console.log(req.body.totaltime + ' = req.body.time');
                res.send("Error in post method: " + err);
            }
        }
    )





    .get('/v1/winner', async (req, res) => {
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT * FROM playertable');
            const results = { 'results': (result) ? result.rows : null};
            res.render('pages/winner', results );
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .listen(PORT, () => console.log(`!!Listening on ${ PORT }`)) //<---denna raden ska ligga sist






