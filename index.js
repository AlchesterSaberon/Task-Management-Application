//[Dependencies and Modules]
require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");

const database = process.env.database;

const cors = require("cors");
//allows us to access routes defined within routes/user
const userRoutes = require("./routes/user.js");

//[Server Setup]
const app = express();
//[Middlewares]
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//Allows all resources to access our backend app
app.use(cors());

//[Database Connection]
mongoose.connect(database);
let db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error"));
db.once("open",()=>console.log("Now connected to MongoDB Atlas!"));

//[Backend Routes]
//Group all routes in routes/user under /users
//[/users]
app.use("/users",userRoutes);

//[Server Gateway Response]
if(require.main === module){

	app.listen(process.env.PORT, ()=>{
		console.log(`API is now online on Port ${process.env.PORT || port}`)
	})
}

module.exports = {app, mongoose};