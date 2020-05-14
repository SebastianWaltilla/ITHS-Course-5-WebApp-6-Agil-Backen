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
    .post('/creategame', async (req, res) => {
            try {
                console.log('!!!!!!!! in create game post')
                const client = await pool.connect()
                var room = req.body.room;
                console.log(room)
                var gamecode = req.body.gamecode;

                var check = await client.query("select count(room) from student where room = '" + room + "'");
                console.log(check);
                    if ( check === 0){
                        console.log('in if-sats 0 === check -------------')
                        var result = await client.query("INSERT INTO teacher values ('" + room + "','" + gamecode +  "')" );
                        res.send('SUCCESS');
                    }

                    else {
                        console.log('in else 0 > check -------------')
                        res.send('Room already exists, choose other roomcode');
                    }


                client.release();
            } catch (err) {
                console.error(err);
                console.log(req.body.room + ' = req.body.room');
                res.send("Error in post method: " + err);
            }
        }
    )


    // Student
    // get spelkod by rumskod
    .get('/db/:room', async (req, res) => {
        try {
            var room = req.params.room;
            const client = await pool.connect()
            const result = await client.query("SELECT spelkod FROM teacher WHERE rumskod = '" + room + "'");
            //const results = { 'results': (result) ? result.rows : null};
            res.send(result);
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .post('/studentlogin', async (req, res) => {
        try {
            const client = await pool.connect()
            var room = req.body.room
            var nickname = req.body.nickname;

            const result = await client.query("INSERT INTO student values ('" + nickname + "'," + -1 + "," + -1 + ",'" + room +"')" );
            res.send('SUCCESS send student login');
            client.release();
        } catch (err) {
            console.error(err);
            console.log(req.body.nickname + ' = req.body.nick');
            res.send("Error in post method: " + err);
        }
    }
    )
    .put('/studentresult', async (req, res) => {
            try {
                const client = await pool.connect()
                var room = req.body.room
                var nickname = req.body.nickname;
                var correctanswers = req.body.correctanswers
                var totaltime = req.body.totaltime

                const result = await client.query
                ("UPDATE student SET correctanswers=" + correctanswers + ", totaltime=" + totaltime  +
                    " WHERE nickname = '" + nickname + "' AND room = '" + room +"'");
                res.send('SUCCESS send result ');
                client.release();
            } catch (err) {
                console.error(err);
                console.log(req.body.totaltime + ' = req.body.time');
                res.send("Error in post method: " + err);
            }
        }
    )





    .get('/winner', async (req, res) => {
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT * FROM student');
            const results = { 'results': (result) ? result.rows : null};
            res.render('pages/winner', results );
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .listen(PORT, () => console.log(`!!Listening on ${ PORT }`)) //<---denna raden ska ligga sist






