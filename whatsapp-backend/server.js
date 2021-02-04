// importing
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Messages from "./dbMessages.js";
import cors from "cors";
//*define Pusher
import Pusher from "pusher";

dotenv.config();

// app config
const app = express();
const port = process.env.PORT || 9000;

//*PUSHER: Publish events on the server
const pusher = new Pusher({
  appId: "1147421",
  key: "f6460a5619b7ecbdf524",
  secret: "e1a1f5823412cd19fccd",
  cluster: "eu",
  useTLS: true,
});

// middleware
app.use(express.json());
app.use(cors());

//*PUSHER: DB config
//Pass the URI
//Put some configuration stuff
mongoose.connect(process.env.MONGODB_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//*PUSHER: DB connection
const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected!");

  //*PUSHER:  To create a collection
  //*It must have the same name of the model
  const msgCollection = db.collection("messagecontents");

  //*PUSHER: To watch our collection
  const changeStream = msgCollection.watch();

  //*PUSHER: whenever a change occurs it will saved into ON CHANGE variable
  changeStream.on("change", change => {
    //console.log the change variable
    console.log(change);

    //*IF the operationType of the change have as value 'insert'
    if (change.operationType === "insert") {
      //*add message details to change
      const messageDetails = change.fullDocument;

      //this trigger the channel
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
      console.log("all good!");
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

// ???

//api routes
app.get("/", (req, res) => res.status(200).send("Hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created: \n ${data}`);
    }
  });
});

// listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));
