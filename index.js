const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
var bodyParser = require('body-parser');
var cors = require('cors');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

express()
  .use(express.static(path.join(__dirname, 'public')))
    .use(bodyParser.json())
    .use(cors())
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
                        var result = await client.query("INSERT INTO gametable values ('" + room + "','" + gamecode +  "')" );
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
    .get('/v1/room/', async (req, res) => {
        try {
            var room = req.query.room;
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
            console.log("posting!!!!!!!!!!!!!!!!!!!")
            const client = await pool.connect()
            var room = req.body.room
            var nickname = req.body.nickname;

            //Check that the room is created in gametable and if nickname already exists
            var checkRoom = await client.query("SELECT room FROM gametable WHERE room = '" + room + "' limit 1");
            var checkNickname = await client.query("SELECT nickname FROM playertable WHERE nickname = '" + nickname + "' limit 1");
            if(checkRoom.rows.length === 1 && checkNickname.rows.length === 0 ){

            const result = await client.query("INSERT INTO playertable VALUES ('" + nickname + "'," + -1 +","+ -1 + ",'"  + room +"')" );
            res.status(201).send("User with nickname " + nickname + " created");

            }

            else {
                var errorMessage = "{message:\"room does not exist\"}"
                var error = JSON.parse(errorMessage);
                res.send(error);

                //res.status(404).send("Room code does not match any existing room or nickname already exists");
                //res.send("Room code does not match any existing room or nickname already exists");
            }


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
                var room = req.body.room;
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
            var room = req.query.room;
            const result = await client.query(
                "SELECT * FROM playertable WHERE room = '" + room + "' ORDER BY correctanswers DESC, totaltime ASC" );
            const results = { 'results': (result) ? result.rows : null};
            res.send(results);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .get('/v1/checkdone', async (req, res) => {
        try {
            const client = await pool.connect()
            var room = req.query.room;
            const result = await client.query("SELECT correctanswers FROM playertable WHERE room = '" + room + "' ORDER BY correctanswers ASC LIMIT 1" );
            res.send(result.rows[0]);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .get('/v1/ping', async (req, res) => {

        try {
            const client = await pool.connect()
            const result = await client.query("SELECT counter FROM ping where id=1" );
            const addone = result.rows[0].counter + 1;
            const updateWithOne = await client.query("UPDATE ping SET counter = " + addone + " WHERE id=1");
            res.send(result.rows[0]);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .listen(PORT, () => console.log(`!!Listening on ${ PORT }`)) //<---denna raden ska ligga sist






