const dns = require('dns');

// Set custom DNS servers (Google DNS)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express')
const app = express()
const cors = require('cors');
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion,  ObjectId } = require('mongodb');
dotenv.config()
const port =  process.env.PORT ||5000;

app.use (cors());
app.use (express.json());


const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async() =>{
  try {
   // Connect the client to the server	(optional starting in v4.7)
await client.connect();

  const db = client.db("tutorData");
   const tutorCollections = db.collection("tutorCollection");

 const bookingCollections = db.collection("tutorBookingCollections");

//   //  getting data from mongodatabase
 app.get('/tutors', async(req, res) => {
const result= await tutorCollections.find().toArray()
res.json(result);
// console.log( "Alltutors", result)

 })

 app.get('/featured', async(req, res) =>{
const result = await tutorCollections.find().limit(6).toArray()
res.json(result);
 })

 app.get('/tutors/:id', async (req, res) =>{
const {id} = req.params
const result = await tutorCollections.findOne({_id: new ObjectId (id)})
res.json(result) 
 }) 



   // database creation
app.post ('/tutors', async(req, res)=> {
   const tutorData = req.body
     const result = await tutorCollections.insertOne(tutorData)
     res.json(result)
   })

// app.patch ("/tutosr/:id", async(req,res)=>{
// const {id}= req.params;
// const bookingData = req.body;
// const result = await tutorCollection.findOne({_id: new ObjectId (id)})
// if(!result){
//   res.status(404).json({message:"Tutor not avaiable"})
// }
// await tutorCollection.updateOne({_id:new ObjectId(id)},
// {
// $inc: {avaiableSlots:1},
// $set:{
//   lastBookingAt:new Data(),
// },
// }
// );
// const bookresult = await bookingTutorCollections.insertOne({
//   ...bookingData,
//  bookingAt:new Data() 
// })
// res.send( "bookresult", bookresult)
// });


//    // database creation
//    app.post ('/tutors', async(req, res)=> {
//      const tutorData = req.body
//      const result = await tutorCollections.insertOne(tutorData)
//      res.json(result)
//    })

  //  font end the id dhore mongodb thake data ana or API create



//   // for delete
// app.delete("/places/:id", async(req, res) =>{
//  const id = req.params.id;
//  console.log("placeId", id);
// //  if get id then go to mongodoc for delete query
// // for particular id selection 
// const query = {_id : new ObjectId(id)}
// const result = userCollections.deleteOne(query);
// console.log(result);
// res.send(result)

// });
 

  
// system of load data from mongodb database
   app.get ('/tutors', async(req, res) =>{
   const cursor = tutorCollections.find ();
   const result = await cursor. toArray();
   res.send(result);
 })

//  Api getting on client
app.get("/booking/:userId", async(req, res)=>{
    // res.send('hello server running')
   const {userId} = req.params;
  const result = await bookingCollections.find({userId}).toArray();
 res.json(result)
})

app.get("/booking")


 app.post ('/booking', async(req, res)=> {

 const bookingData = req.body
    const result = await bookingCollections.insertOne( bookingData)
      res.json(result)
     console.log("booking", bookingData)
   });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
 res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`EXPREss server listening on port ${port}`)
})
