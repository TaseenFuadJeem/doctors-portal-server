const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1e0wk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        await client.connect();
        const servicesCollection = client.db('doctors_portal').collection('services');
        const bookingCollection = client.db('doctors_portal').collection('bookings');
        const userCollection = client.db('doctors_portal').collection('users');
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

        app.post('/bookings', async (req, res) => {

            const booking = req.body;

            const q = { treatment: booking.treatment, date: booking.date, patient: booking.patient };

            const exist = await bookingCollection.findOne(q);

            if (exist) {
                return res.send({ success: false, booking: exist })
            }

            const result = await bookingCollection.insertOne(booking);

            res.send({ success: true, result });

        });

        app.get('/available', async (req, res) => {

            const date = req.query.date;

            const services = await servicesCollection.find().toArray();

            const query = { date: date };

            const bookings = await bookingCollection.find(query).toArray();

            services.forEach(service => {
                const serviceBookings = bookings.filter(booking => booking.treatment === service.name);
                const booked = serviceBookings.map(service => service.slot);
                const available = service.slots.filter(slot => !booked.includes(slot));
                service.slots = available;
            })

            res.send(services);

        });

        app.get('/booking', async (req, res) => {

            const patient = req.query.patient;

            const query = { patient: patient };

            const bookings = await bookingCollection.find(query).toArray();

            res.send(bookings);

        });

        app.put('/user/:email', async (req, res) => {

            const email = req.params.email;

            const user = req.body;

            const filter = { email: email };

            const options = { upsert: true };

            const updateDoc = {
                $set: user,
            };

            const result = await userCollection.updateOne(filter, updateDoc, options);

            const token = jwt.sign({ email: email }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '1h' })

            res.send({ result, token });

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