const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // console.log("ACTUAL URI:", process.env.MONGO_URI);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {

//     // 🔥 Print BEFORE connecting
//     console.log("ACTUAL URI:", process.env.MONGO_URI);

//     const conn = await mongoose.connect(process.env.MONGO_URI, {
      
//     });

//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

//   } catch (error) {
//     console.error(`❌ Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
