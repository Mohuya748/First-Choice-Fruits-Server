const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port =process.env.PORT || 5000;
const app = express();

// middleware 
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vannh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const inventoryCollection = client.db('FirstChoiceFruits').collection('inventory');

        // GET user 
        app.get('/inventory',async(req,res)=>{
         const query = {};
         const cursor= inventoryCollection.find(query);
         const inventories = await cursor.toArray();
         res.send(inventories);
         });
        }
        finally{
    
        }
    }
    run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('running CRUD server')
})

app.listen(port, () => {
  console.log('CRUD server running',port);
})