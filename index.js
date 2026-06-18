const dns = require('node:dns');

// // Set custom DNS servers (Google DNS)
 dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express')
const app = express()
const cors = require('cors');
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion,  ObjectId } = require('mongodb');
 const { createRemoteJWKSet,  createLocalJWKSet } = require('jose-cjs');
const { jwtVerify } = require('jose-cjs');

// import { createLocalJWKSet } from 'jose';


dotenv.config();
// from wanderlast
const port =  process.env.PORT ||5000;


app.use (cors());
app.use (express.json());

const uri = process.env.MONGO_URI;
// from wanderlast


// // const uri =  process.env.MONGO_URI;
// const port =  process.env.PORT ||5000;
// // const app = express();
// const PORT = process.env.PORT;

//  // for vercel cors
// // const allowedOrigins = [
// //    'https://tutorhunt-client.vercel.app', // আপনার ফ্রন্টএন্ড
// //   'http://localhost:3000'
// // ];

// //  app.use (cors());
// app.use(cors({
//  origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//    } else {
//        callback(new Error('CORS not allowed'));
//     }
//   },
//    credentials: true,
//  }));


// app.use (express.json());

//  const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// verification by JWKS
const JWKS = createRemoteJWKSet(
 new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
  )
// const getJWKS = async () => {
//   // Better Auth নিজের ভেতর থেকেই JWKS ডেটা বের করে দেয় (কোনো নেটওয়ার্ক কল নেই)
//   const jwksData = await auth.api.getJWKS(); 
//   return createLocalJWKSet(jwksData);
// };




// verify Token
 const verifyToken = async(req, res, next) =>{
  const authHeader= req?.headers.authorization
  
    if(!authHeader){
    return res.status(401).json({message:
    "Unauthorized"
    });
  }
   console.log (authHeader, "auth")
 const token = authHeader.split(" ")[1];
  console.log(token)
 if(!token){
    return res.status(401).json({message:
       "Unauthorized"
    });
 }
// // payload in try catch
 try {
  
    // const JWKS = await getJWKS();   // <---- এই লাইনটি বসবে
 const { payload } = await jwtVerify(token, JWKS) 
   console.log(payload, "payload");
     next()
  } catch (error) {
     console.log(error);
     return res.status(403).json({message:
      "Forbidden"
      });
  }
 };
// verification finish

const run = async() =>{
  try {
   // Connect the  to the server	(optional starting in v4.7)
// await client.connect();

  const db = client.db("tutorData");
   const tutorCollections = db.collection("tutorCollection");
  //  const tutorSlotCollections = db.collection("slotCollections");
  //  const addingTutorCollections = db.collection("addingTutorCollection");
   const bookingCollections = db.collection("tutorBookingCollections");

// for getting add-tutorpage's formtutor data from client
// new comend korlam
// app.post ('/add-tutor', verifyToken, async(req, res)=>{
//   const formTutorData = req.body
//   console.log("form", formTutorData)
//   // console.log("reqbodey", req.body)
//      const result = await addingTutorCollections.insertOne(formTutorData)
//      res.json(result)
 
//    })

//   //  getting data from mongodatabase for my-tutors page by clicking form
 app.get('/my-tutors/:userId', verifyToken, async(req, res) => {
   const {userId} = req.params;
   console.log(userId,"userId with params")

const result= await tutorCollections.find({userId}).toArray()
res.json(result);
// console.log( "Allmytutors in server", result)
 })
// //  Api getting on client my-sessionpage
// app.get("/booking/:userId", verifyToken, async(req, res)=>{
//     // res.send('hello server running')
//    const {userId} = req.params;
//   const result = await bookingCollections.find({userId}).toArray();
//  res.json(result)
// })


//  verifyToken,

// // formTutorId 
//    //   // for delete
app.delete("/my-tutors/:formTutorId", async(req, res) =>{
const {formTutorId } = req.params;

// // //  if get id then go to mongodoc for delete query
// // // for particular id selection 
//  const query = {_id : new ObjectId(id)}
 const result = await tutorCollections.deleteOne({_id:new ObjectId(formTutorId)});

res.json(result)

});

// feature tutor data for homepage
app.get('/featured', async(req, res) =>{
const result = await tutorCollections.find().limit(6).toArray()
res.json(result);
 })

// Tutor detailspage
 app.get('/tutors/:id', verifyToken, async (req, res) =>{
const {id} = req.params
const result = await tutorCollections.findOne({_id: new ObjectId(id)})
res.json(result) 
 }); 

   // 1) for formtutor data sending :database creation and send to mongo
//    // database creation
//   app.post ('/tutors', async(req, res)=> {
//      const tutorData = req.body
//      const result = await tutorCollections.insertOne(tutorData)
//      res.json(result)
//    })
  //  font end the id dhore mongodb thake data ana or API create
// 2)tutor page a data dekhano
// comend for getting search because its duplicate
//   app.get('/tutors', async(req,res) =>{
// const result = await tutorCollections.find().toArray();
//   res.json(result)
// });

//1)for getting alltutors from form
app.post('/tutors', async(req,res) =>{
  const tutorsData = req.body
  const result = await tutorCollections .insertOne(tutorsData)
  res.json(result)
})

// // search is not working
//   // search system of alltutorpage
app.get('/tutors', async (req, res) => {
  console.log("🔍 Full query params:", req.query);
  try {
    const { search, startDate, endDate } = req.query;
    let query = {};   // ← বেস কোয়েরি অবজেক্ট

    // নাম অনুযায়ী সার্চ
    if (search) {
      query.tutorName = { $regex: search, $options: 'i' };
     console.log("📝 Search query:", query);
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



//   //   if (startDate || endDate) {
//   //      query.sessionStartDate = {};
//   //    if (startDate) {
//   //        query.sessionStartDate.$gte = new Date(startDate);
//   //     }
//   //    if (endDate) {
//   //      const end = new Date(endDate);
//   //       end.setUTCHours(23, 59, 59, 999);
//   //        query.sessionStartDate.$lte = end;
//   //    }
//   //  }





    // কোয়েরি এক্সিকিউট
    const result = await tutorCollections.find(query).toArray();
    console.log("✅ Found:", result.length, "tutors");
   res.json(result);   // সব সময় JSON রিটার্ন করবে
  } catch (error) {
   console.error('Error in /tutors:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
});
// // search is not working
// search new code
// app.get('/tutors', async (req, res) => {
//   console.log("=== /tutors রাউট হিট হয়েছে ===");
//   console.log("পুরো req.query:", req.query);
  
//   const { search, startDate, endDate } = req.query;
//   let query = {};
  
//   // সার্চ ফিল্টার (টিউটরের নাম)
//   if (search && search.trim() !== "") {
//     query.tutorName = { $regex: search.trim(), $options: 'i' };
//     console.log("সার্চ ফিল্টার যোগ হয়েছে:", query);
//   } else {
//     console.log("কোনো সার্চ প্যারামিটার নেই, সব ডাটা আসবে");
//   }
  
//   // (ঐচ্ছিক) ডেট রেঞ্জ ফিল্টার – আপাতত কমেন্ট করে রাখুন
//   /*
//   if ((startDate && startDate.trim()) || (endDate && endDate.trim())) {
//     // ... ডেট ফিল্টার লজিক
//   }
//   */
  
//   try {
//     const result = await tutorCollections.find(query).toArray();
//     console.log(`ফাউন্ড ${result.length} টি টিউটর`);
//     res.json(result);
//   } catch (err) {
//     console.error("মঙ্গোডিবি এরর:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

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


//  Api getting on client my-sessionpage
app.get("/booking/:userId", verifyToken, async(req, res)=>{
    // res.send('hello server running')
   const {userId} = req.params;
  const result = await bookingCollections.find({userId}).toArray();
 res.json(result)
})


// -----updateslot start-----
app.post('/booking',  async (req, res) => {
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
  //     [
  //   { $set: { availableSlots: { $toInt: "$availableSlots" } } },  // string → number
  //   { $set: { availableSlots: { $subtract: ["$availableSlots", 1] } } } // ১ কমানো
  // ]
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
    res.status(500).json({ message: 'Session server Error!' });
  }
});

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
const result = await tutorCollections.updateOne(
  {_id: new ObjectId(id)},
  {$set: updatedData}
)
res.json(result)
 })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
