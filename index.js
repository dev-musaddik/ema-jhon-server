const bodyParser = require("body-parser");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.nprosog.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10, // Adjust based on your needs
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db(process.env.DB_NAME).collection("products");
    const shipmentCollection = client.db(process.env.DB_NAME).collection("shipment");

    // API routes
    app.post('/shipment', (req, res) => {
      const shipment = req.body;
      shipmentCollection.insertOne(shipment)
        .then(result => {
          console.log(result);
          res.send(result.acknowledged);
        })
        .catch(err => {
          console.log(err);
          res.status(500).send("Internal Server Error");
        });
    });

    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      try {
        const ans = await productCollection.insertMany(product);
        res.send(ans);
        console.log(ans);
      } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/getProduct", async (req, res) => {
      const data = await productCollection.find().toArray();
      res.send(data);
    });

    app.get('/getUser', async (req, res) => {
      const user = await shipmentCollection.find().toArray();
      res.send(user);
    });

    app.get("/getProduct/:key", async (req, res) => {
      const data = await productCollection.find({ key: req.params.key }).toArray();
      res.send(data[0]);
    });

    app.post("/getProductByKeys", async (req, res) => {
      const keys = req.body;
      const data = await productCollection.find({ key: { $in: keys } }).toArray();
      res.send(data);
    });

    app.post("/order", async (req, res) => {
      try {
        const userEmail = req.body.email;
        const userOrder = await shipmentCollection.find({ email: userEmail }).toArray();
        res.send(userOrder);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something went wrong!');
    });

    // Ping endpoint
    app.get('/', (req, res) => {
      res.status(200).send('Server is working');
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.log(error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
