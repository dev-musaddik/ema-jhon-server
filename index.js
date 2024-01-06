const bodyParser = require("body-parser");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.nprosog.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
app.use(bodyParser.json());
app.use(cors());
// app.use(express.json())
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const productCollection = client.db(process.env.DB_NAME).collection("products");
    const shipmentCollection = client.db(process.env.DB_NAME).collection("shipment");

    app.post('/shipment',(req,res)=>{
      const shipment =  req.body
      shipmentCollection.insertOne(shipment)
      .then(result=>{
        console.log(result)
        res.send(result.acknowledged)
      })
      .catch(err=>{
        console.log(err)
      })
      // console.log(shipment)
    })
    app.post("/addProduct", (req, res) => {
      const product = req.body;
      productCollection
        .insertMany(product)
        .then((ans) => {
          res.send(ans);
          console.log(ans);
        })
        .catch((err) => {
          console.log(err);
        });
      // console.log(product)
    });

    // -----------------
    app.get("/getProduct", async (req, res) => {
      const data = await productCollection.find().toArray();
      res.send(data);
    });
    app.get("/getProduct/:key", async (req, res) => {
      const data = await productCollection.find({key:req.params.key}).toArray();
      res.send(data[0]);
    });
    app.post("/getProductByKeys", async (req, res) => {
      const keys=req.body;
      const data = await productCollection.find({key:{$in : keys}}).toArray();
      res.send(data);
    });
    app.post("/order", async (req, res) => {
      try {
          const userEmail = req.body.email; // Assuming req.body is a string containing the email
          const userOrder = await shipmentCollection.find({ email: userEmail }).toArray();
          res.send(userOrder);
      } catch (error) {
          console.error(error);
          res.status(500).send("Internal Server Error");
      }
  });
  app.get('/',(req,res)=>{
    res.status(200).send('server is working');
  })
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.log(error);
  }
}

run().catch(console.dir);

app.listen(4000, () => {
  console.log("server listening on port");
});
