const dns = require('node:dns');

// // Set custom DNS servers (Google DNS)
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
   
   const addingTutorCollections = db.collection("addingTutorCollection");
 const bookingCollections = db.collection("tutorBookingCollections");


app.post ('/add-tutor', async(req, res)=>{
 
    const formTutorData = req.body
  console.log("form", formTutorData)
     const result = await addingTutorCollections.insertOne(formTutorData)
     res.json(result)
 
   })



//   //  getting data from mongodatabase for my-tutors page by clicking form
 app.get('/my-tutors', async(req, res) => {
const result= await addingTutorCollections.find().toArray()
res.json(result);
console.log( "Alltutors", result)

 })
// // formTutorId 
//    //   // for delete
//  app.delete("/my-tutors/:formTutorId ", async(req, res) =>{
// const {formTutorId } = req.params;
// //  console.log("placeId", id);
// // //  if get id then go to mongodoc for delete query
// // // for particular id selection 
// // const query = {_id : new ObjectId(id)}
// const result = addingTutorCollections.deleteOne({_id:new ObjectId(formTutorId)});
// // console.log(result);
// res.json(result)

//  });



 app.get('/featured', async(req, res) =>{
const result = await tutorCollections.find().limit(6).toArray()
res.json(result);
 })

 app.get('/tutors/:id', async (req, res) =>{
const {id} = req.params
const result = await tutorCollections.findOne({_id: new ObjectId (id)})
res.json(result) 
 }) 



   // 1) for formtutor data sending :database creation and send to mongo


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

 app.post ('/booking', async(req, res)=> {

 const bookingData = req.body
    const result = await bookingCollections.insertOne( bookingData)
      res.json(result)
     console.log("booking", bookingData)
   });

   //   // for delete
 app.delete("/booking/:bookingId", async(req, res) =>{
const {bookingId} = req.params;
//  console.log("placeId", id);
// //  if get id then go to mongodoc for delete query
// // for particular id selection 
// const query = {_id : new ObjectId(id)}
const result = bookingCollections.deleteOne({_id:new ObjectId(bookingId)});
// console.log(result);
res.json(result)

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
app.get('/login',(req,res) =>{
res.send("hello login page")

})
app.get('/register',(req,res) =>{
res.send("hello register page")

})


app.listen(port, () => {
  console.log(`EXPREss server listening on port ${port}`)
})
