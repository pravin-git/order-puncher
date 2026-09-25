import { useState } from 'react'
import OptionChainMatrix from './OptionChainMatrix'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const handleOptionAction = (payload) => {
    console.log("Action received:", payload);
  };

  return (
    <>
      <section id="center">
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count} Pravin
        </button>
      </section>

      <div className="ticks"></div>
      <OptionChainMatrix
        atmStrike={18000}
        strikeCount={5}
        strikeDistance={50}
        onAction={handleOptionAction}
      />


      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
