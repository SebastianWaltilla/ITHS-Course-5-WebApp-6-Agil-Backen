const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

express()
  .use(express.static(path.join(__dirname, 'public')))
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

"someParam1=foo&someParam1=bar&someParam1=bas"



    .post('/creategame/:room=?&gamecode=?', async (req, res) => {
            try {
                const client = await pool.connect()
                var room = req.params.room;
                var gamecode = req.params.gamecode;
                const result = await client.query("INSERT INTO teacher values ('" + room + "','" + gamecode + "')" );
                const results = { 'results': (result) ? result.rows : null};
                res.render('pages/winner', results );
                client.release();
            } catch (err) {
                console.error(err);
                res.send("Error " + err);
            }
        }

    )
    .listen(PORT, () => console.log(`Listening on ${ PORT }`)) //<---denna raden ska ligga sist






