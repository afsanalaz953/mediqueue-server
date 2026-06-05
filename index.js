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
   const tutorSlotCollections = db.collection("slotCollections");
   
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
app.delete("/my-tutors/:formTutorId", async(req, res) =>{
const {formTutorId } = req.params;

// // //  if get id then go to mongodoc for delete query
// // // for particular id selection 
//  const query = {_id : new ObjectId(id)}
 const result = await addingTutorCollections.deleteOne({_id:new ObjectId(formTutorId)});

res.json(result)

});



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
//    // database creation
//   app.post ('/tutors', async(req, res)=> {
//      const tutorData = req.body
//      const result = await tutorCollections.insertOne(tutorData)
//      res.json(result)
//    })
  //  font end the id dhore mongodb thake data ana or API create

  // search system 
app.get('/tutors', async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;
    let query = {};   // ← বেস কোয়েরি অবজেক্ট

    // নাম অনুযায়ী সার্চ
    if (search) {
      query.tutorName = { $regex: search, $options: 'i' };
    }

    // তারিখ রেঞ্জ ফিল্টার (sessionStartDate)
   if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (end) end.setUTCHours(23, 59, 59, 999);

      query.$expr = {
        $and: []
      };
      
      // $toDate দিয়ে স্ট্রিংকে Date এ কনভার্ট করে তুলনা
      if (start) {
        query.$expr.$and.push({ $gte: [{ $toDate: "$sessionStartDate" }, start] });
      }
      if (end) {
        query.$expr.$and.push({ $lte: [{ $toDate: "$sessionStartDate" }, end] });
      }
    }



  //   if (startDate || endDate) {
  //      query.sessionStartDate = {};
  //    if (startDate) {
  //        query.sessionStartDate.$gte = new Date(startDate);
  //     }
  //    if (endDate) {
  //      const end = new Date(endDate);
  //       end.setUTCHours(23, 59, 59, 999);
  //        query.sessionStartDate.$lte = end;
  //    }
  //  }



    // কোয়েরি এক্সিকিউট
    const result = await tutorCollections.find(query).toArray();
    res.json(result);   // সব সময় JSON রিটার্ন করবে
  } catch (error) {
    console.error('Error in /tutors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// app.get ('/tutors', async(req, res) =>{
//       const {search, startDate, endDate } = req.query;
// let cursor;
// if(search){
//   cursor = tutorCollections.find({tutorName:{$regex:search, $options:'i'}
//   });  
// }
// // for date search querry
// if (startDate || endDate) {
//     query.sessionStartDate = {};  
//     if (startDate) {
//       query.sessionStartDate.$gte = new Date(startDate);
//     }

//      if (endDate) {
//       const end = new Date(endDate);
//       end.setUTCHours(23, 59, 59, 999);
//       query.sessionStartDate.$lte = end;
//     }
//   }

// // else{
// //     cursor = tutorCollections.find ();
// // }
//  const result = await cursor. toArray();
//    res.send(result);
//  });


//  Api getting on client
app.get("/booking/:userId", async(req, res)=>{
    // res.send('hello server running')
   const {userId} = req.params;
  const result = await bookingCollections.find({userId}).toArray();
 res.json(result)
})


// -----updateslot start-----
app.post('/booking', async (req, res) => {
  const bookingData = req.body;
  const { tutorId, userId } = bookingData;

  // Validate required fields
  if (!tutorId || !userId) {
    return res.status(400).json({ message: 'Missing tutorId or userId' });
  }

  try {
    // 1. Fetch the tutor from tutorCollections
    const tutor = await tutorCollections.findOne({ _id: new ObjectId(tutorId) });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // 2. Check available slots (field name: availableSlots)
    if (tutor.availableSlots === undefined) {
      return res.status(500).json({ message: 'Tutor record missing availableSlots field' });
    }
    if (tutor.availableSlots <= 0) {
      return res.status(400).json({ message: 'No available slots left. You cannot book this session.' });
    }

    // 3. Check session start date restriction
    const today = new Date();
    today.setHours(0, 0, 0, 0); // compare only date part
    const sessionStart = new Date(tutor.sessionStartDate);
    sessionStart.setHours(0, 0, 0, 0);

    if (today < sessionStart) {
      return res.status(400).json({ message: `Booking is not available yet for this tutor. Sessions start on ${tutor.sessionStartDate}.` });
    }

    // 4. All checks passed – insert the booking
    const bookingResult = await bookingCollections.insertOne({
      ...bookingData,
      bookingCreatedAt: new Date(),
    });

    // 5. Atomically decrease availableSlots by 1
    await tutorCollections.updateOne(
      { _id: new ObjectId(tutorId) },
      { $inc: { availableSlots: -1 } }
    );

    // 6. (Optional) Get updated tutor data to return new slot count
    const updatedTutor = await tutorCollections.findOne({ _id: new ObjectId(tutorId) });

    res.status(201).json({
      message: 'Booking successful',
      bookingId: bookingResult.insertedId,
      remainingSlots: updatedTutor.availableSlots,
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Internal server error. Please try again.' });
  }
});






//  app.post ('/booking', async(req, res)=> {

//  const bookingData = req.body
//     const result = await bookingCollections.insertOne( bookingData)
//       res.json(result)
//      console.log("booking", bookingData)
//    });

//   //  for slot update
//  app.patch("/tutors/:id", async (req, res) => {
// const {id} = req.params;
// const updatedSlot = req.body;
// const slotResult = await tutorCollections.findOne(
//   {_id: new ObjectId(id)})

// await tutorCollections.updateOne(
//   {_id: new ObjectId(id)},
//   {$inc: {slotCount:-1}}
// )
// const result = await slotCollections.insertOne({
//   ...slotData
// })
// res.send(result)
//  })

// ------------slotupdate-end------


   //   // for update bookingdelete
 app.patch("/booking/:bookingId", async(req, res) =>{
const {bookingId} = req.params;
//  console.log("placeId", id);
// //  if get id then go to mongodoc for delete query
// // for particular id selection 
// const query = {_id : new ObjectId(id)}
const result = await bookingCollections.updateOne(
  {_id:new ObjectId(bookingId)},
{ $set: { tutorStatus: "cancelled"}}
)
// console.log(result);
res.json(result)

 });

 app.patch("/my-tutors/:id", async (req, res) => {
const {id} = req.params
const updatedData = req.body
console.log(updatedData)
const result = await addingTutorCollections.updateOne(
  {_id: new ObjectId(id)},
  {$set: updatedData}
)
res.json(result)
 })

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
