import { useState } from 'react'
import OptionChainMatrix from './OptionChainMatrix'
import './App.css'

function App() {

  // const handleOptionAction = (payload) => {
  //   console.log("Action received:", payload);
  // };

  const handleOptionAction = async (payload) => {
    try {
      const response = await fetch("http://localhost:3000/place-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Order request failed.");
      }

      console.log("Order response:", result);
    } catch (error) {
      console.error("Order error:", error.message);
    }
  };

  return (
    <>

      <div className="ticks"></div>
      <OptionChainMatrix
        atmStrike={23000}
        strikeCount={5}
        strikeDistance={50}
        onAction={handleOptionAction}
      />

    </>
  )
}

export default App
