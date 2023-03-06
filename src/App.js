import './App.css';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'
import randomNFT from './RandomNFT.json'

const randomNFTAddress = "REPLACE_WITH_THE_CONTRACT_ADDRESS";

function App() {

  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [text, setText] = useState(false);
  const [metadataUrl, setMetadataUrl] = useState('');
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
    contract.on("Mint", (owner, tokenId, metadata, event) => {
      setMetadataUrl(metadata);
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
    setMetadataUrl('');
    const response = await fetch("/generate-image", {
      method: "GET",
      headers: {
        "Content-Type": "text/json",
      },
    });
    const { cid, cidHash, signature } = await response.json();

    try {
      const response = await contract.mint(
        cid, cidHash,
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
            {metadataUrl ? (<a target='_blank' href={metadataUrl}>Check your NFT</a>) : null}
          </div>
        ) : (
          <button onClick={connectAccount}>Connect to wallet</button>
        )}

      </header>
    </div>
  );
}

export default App;
