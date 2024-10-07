//importing important modules
import express from 'express';
import pg from 'pg';
import bodyParser from "body-parser";

const app = express();

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "1234",
    port: 5432,
});

db.connect(); //initialising db connection
  
app.use(bodyParser.urlencoded({ extended: true })); //body parser to obtain form data

app.set('view engine', 'ejs');

const port = 3000;

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/activate', async(req, res) => {
    const num = req.body.number; //Input from the user
    
    try {
        // Checking whetehr the SIM exists or not
        const simQuery = 'SELECT * FROM simDb WHERE "sim_number" = $1';
        const simResult = await db.query(simQuery, [num]);

        if (simResult.rows.length === 0) {
        // SIM doesn't exist
        return res.status(404).send('<h1>Error sim not found go back and try again</h1>');
        }

        const sim = simResult.rows[0];

        // Check if the SIM is already active
        if (sim.status === 'active') {
            return res.status(400).send('<h1>Error sim is already active no changes were made</h1>');
        }

        // Update the SIM status to active and record the timestamp
        const updateQuery = `
            UPDATE simDb 
            SET "status" = 'active', "activation_date" = now() 
            WHERE "sim_number" = $1
            RETURNING *;
        `;
        const updateResult = await db.query(updateQuery, [num]);
        console.log(updateResult.rows[0]);
        // Respond with success and updated data
        res.send('<h1>Sim card activated successfully</h1>');

    } catch (error) {
        console.error('Error activating SIM:', error);
        res.status(500).json({ message: 'An error occurred while activating the SIM card.' });
    }

});

app.post('/deactivate', async(req, res) => {
    const num = req.body.number; //Input from the user
    
    try {
        // Checking whether the SIM exists or not
        const simQuery = 'SELECT * FROM simDb WHERE "sim_number" = $1';
        const simResult = await db.query(simQuery, [num]);

        if (simResult.rows.length === 0) {
        // SIM doesn't exist
        return res.status(404).send('<h1>Error sim not found go back and try again</h1>');
        }

        const sim = simResult.rows[0];

        // Check if the SIM is already inactive
        if (sim.status === 'inactive') {
            return res.status(400).send('<h1>Error sim is already inactive no changes were made</h1>');
        }

        // Update the SIM status to active
        const updateQuery = `
            UPDATE simDb 
            SET "status" = 'inactive',
            WHERE "sim_number" = $1
            RETURNING *;
        `;
        const updateResult = await db.query(updateQuery, [num]);
        console.log(updateResult.rows[0]);
        // Respond with success
        res.send('<h1>Sim card deactivated successfully</h1>');

    } catch (error) {
        console.error('Error deactivating SIM:', error);
        res.status(500).json({ message: 'An error occurred while deactivating the SIM card.' });
    }

});

app.get('/getDetails', async(req, res) => {
    const num = req.query.number; // Get the sim_number from the query parameters

    try {
        // Query to get the SIM details
        const query = 'SELECT * FROM simDb WHERE "sim_number" = $1';
        const result = await db.query(query, [num]);

        if (result.rows.length === 0) {
            // If no SIM card is found
            return res.status(404).send('<h1>Error sim not found go back and try again</h1>');
        }
        const sim = result.rows[0];
        // Respond with the SIM details
        res.send(`<h1>The details for the requested sim are: ${sim}`); // Send back the first (and should be the only) row
    } catch (error) {
        console.error('Error fetching SIM details:', error);
        res.status(500).json({ message: 'An error occurred while fetching SIM details.' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});