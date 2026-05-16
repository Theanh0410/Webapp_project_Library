import { useEffect, useState } from "react";
import { checkBackendHealth } from "./services/api";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function testBackend() {
      try {
        const data = await checkBackendHealth();
        setMessage(data.message);
      } catch (error) {
        setMessage("Cannot connect to backend");
      }
    }

    testBackend();
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Library Management System</h1>
      <p>Frontend is running.</p>
      <p>Backend status: {message}</p>
    </div>
  );
}

export default App;