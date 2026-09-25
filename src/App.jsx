import { useState } from 'react'
import OptionChainMatrix from './OptionChainMatrix'
import './App.css'

function App() {
 
  const handleOptionAction = (payload) => {
    console.log("Action received:", payload);
  };

  return (
    <>
      
      <div className="ticks"></div>
      <OptionChainMatrix
        atmStrike={18000}
        strikeCount={5}
        strikeDistance={50}
        onAction={handleOptionAction}
      />

    </>
  )
}

export default App
