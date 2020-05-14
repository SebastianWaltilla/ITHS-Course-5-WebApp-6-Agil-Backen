const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
var bodyParser = require('body-parser')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://jteascrgevmsmm:a7ed6c2ec0f336ae9124c0cbb5452bd68c1f7c3a828b19bfcee2d6cad821eebe@localhost:5000/d307bgdakulge0',
    ssl: !!process.env.DATABASE_URL
});
pool.on('error', (err) => {
    console.error('An idle client has experienced an error', err.stack)
})

express()
  .use(express.static(path.join(__dirname, 'public')))
    .use(bodyParser.json())
    .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
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




    .post('/creategame', async (req, res) => {
            try {
                const client = await pool.connect()
                var room = req.body.room;
                console.log(room)
                var gamecode = req.body.gamecode;
                const result = await client.query("INSERT INTO teacher values ('" + room + "','" + gamecode +  "')" );
                const results = { 'results': (result) ? result.rows : null};
                res.send('SUCCESS');
                client.release();
            } catch (err) {
                console.error(err);
                console.log(req.body.room + ' = req.body.room');
                res.send("Error in post method: " + err);
            }
        }

    )
    .listen(PORT, () => console.log(`!!Listening on ${ PORT }`)) //<---denna raden ska ligga sist






