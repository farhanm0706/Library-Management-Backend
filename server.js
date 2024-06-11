// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors =require('cors')
const app = express();
const dotenv =require('dotenv');
const userRoute = require("./route/user.route");
const bookRoute =require("./route/book.route")

// Middleware
app.use(cors());
app.use(bodyParser.json());
dotenv.config();

const PORT = process.env.PORT;
const URI = process.env.MongoDBURI;
// Connect to MongoDB
// console.log("Mongo DB",URI);

try {
    mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("Connected to mongoDB");
} catch (error) {
    console.log("Error: ", error);
}

app.use("/user",userRoute);
app.use("/book",bookRoute);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
.on('error', (err) => {
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} requires elevated privileges or is already in use`);
        process.exit(1);
    } else {
        throw err;
    }
});
