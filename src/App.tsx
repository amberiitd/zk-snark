import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
const vKey = require("./verification_key.json")

function App() {
  const [genProof, setGenProof] = useState<any>();
  const [verification, setVerification] = useState(false);
  const generate = async () => {
    const { proof, publicSignals } = await (window as any).snarkjs.groth16.fullProve({a: 1, b: 2}, `${process.env.PUBLIC_URL}/assets/circuit.wasm`, `${process.env.PUBLIC_URL}/assets/circuit_final.zkey`);

    setGenProof(proof)
    const res = await (window as any).snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
        setVerification(true)
    } else {
        console.log("Invalid proof");
    }
  }
  return (
    <div className="App">
      <button onClick={() => generate()}>Generate</button>

      <div>{JSON.stringify(genProof, null, 1)}</div>
      <div>isVerified: {verification ? 'YES': 'NO'}</div>
    </div>
  );
}

export default App;
