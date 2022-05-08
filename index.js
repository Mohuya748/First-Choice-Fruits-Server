const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.header.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' });

    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  })


}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vannh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db('FirstChoiceFruits').collection('inventory');

    // AUTH
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2d' });
      res.send({ accessToken });
    })

    // GET a user
    app.get('/inventory', async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories);
    });


    app.get('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.findOne(query);
      res.send(result);

    });

    // update item quantity 
    app.put('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const updateItem = req.body;
      console.log(id, updateItem)
      const filter = { _id: ObjectId(id) };
      console.log(filter)
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          Quantity: updateItem.quantity,
        }
      };
      console.log(updatedDoc)
      const result = await inventoryCollection.updateOne(filter, updatedDoc, options);
      res.send(result);

    })



    // POST: add a new user
    app.post('/inventory', async (req, res) => {
      const newInventory = req.body;
      console.log("adding new  item", newInventory);
      const result = await inventoryCollection.insertOne(newInventory);
      res.send({ result })
    })

// myitems add 
    app.get('/myitems', async (req, res) => {
      const email =req.query.email;
      console.log(email)
      const query = {email:email};
      const cursor = inventoryCollection.find(query);
      const myitem = await cursor.toArray();
      res.send(myitem);
    })

    //  Delete a user 
    app.delete('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    })



  }
  finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('running CRUD server')
})

app.listen(port, () => {
  console.log('CRUD server running', port);
})