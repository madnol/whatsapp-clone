import { useEffect, useState } from "react";
import "./App.css";
import Chat from "./Components/Chat";
import Sidebar from "./Components/Sidebar";
import Pusher from "pusher-js";
import axios from "./axios";

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get("/messages/sync").then(response => {
      setMessages(response.data);
    });
  }, []);

  useEffect(() => {
    //*Pusher: create an istance of Pusher and pass the ID
    const pusher = new Pusher("f6460a5619b7ecbdf524", {
      cluster: "eu",
    });

    //*This should be triggered in the back-end
    const channel = pusher.subscribe("messages");
    channel.bind("inserted", newMessage => {
      // alert(JSON.stringify(newMessage));
      setMessages([...messages, newMessage]);
    });

    //*clean up function
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);

  return (
    <div className="App">
      <div className="app__body">
        <Sidebar />
        <Chat messages={messages} />
      </div>
    </div>
  );
}

export default App;
