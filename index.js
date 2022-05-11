const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1e0wk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        await client.connect();
        const servicesCollection = client.db('doctors_portal').collection('services');
        const reviewsCollection = client.db('patient_reviews').collection('reviews');

        app.get('/service', async (req, res) => {

            const q = {};

            const cursor = servicesCollection.find(q);

            const service = await cursor.toArray();

            res.send(service);

        });

        app.get('/reviews', async (req, res) => {

            const q = {};

            const cursor = reviewsCollection.find(q);

            const service = await cursor.toArray();

            res.send(service);

        })

    } finally {

    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("hello world")
});

app.listen(port, () => {
    console.log("Running successfully : ", port);
})