import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'
import randomNFT from './RandomNFT.json'

const randomNFTAddress = "REPLACE_WITH_THE_CONTRACE_ADDRESS";

function App() {

  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [text, setText] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const isConnected = Boolean(accounts[0]);

  useEffect(() => {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      randomNFTAddress,
      randomNFT.abi,
      signer
    );
    setContract(contract);
    contract.on("Mint", (owner, tokenId, ipfsHash, event) => {
      setImageUrl("https://gateway.pinata.cloud/ipfs/" + ipfsHash);

      setText(`Congrats, RandomNFT #${tokenId} is yours.`);
    });

    return () => {
      contract.removeAllListeners();
    };
  }, []);

  async function connectAccount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      setAccounts(accounts);
    }
  }
  const mintNFT = async (event) => {
    setText("Minting, please wait a minute");
    setImageUrl('');
    const response = await fetch("/generate-image", {
      method: "GET",
      headers: {
        "Content-Type": "text/json",
      },
    });
    const { ipfsHash, ipfsHashHash, signature } = await response.json();

    try {
      const response = await contract.mint(
        ipfsHash, ipfsHashHash,
        signature, {
        value: ethers.utils.parseEther((0.01).toString()), gasLimit: 1000000
      });
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {isConnected ? (
          <div>
            <button onClick={mintNFT}>Mint NFT</button>
            <div>{text}</div>
            {imageUrl ? (<a target='_blank' href={imageUrl}>Check your image, It may take a few minutes to access</a>) : null}
          </div>
        ) : (
          <button onClick={connectAccount}>Connect to wallet</button>
        )}

      </header>
    </div>
  );
}

export default App;
