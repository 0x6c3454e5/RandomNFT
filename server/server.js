import express from 'express';
import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from '../src/App';
import PinataSDK from '@pinata/sdk';
import { ethers } from "ethers";
const dotenv = require("dotenv");
const sharp = require("sharp");
const { Readable } = require('stream');

const port = 8765;

const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_RPC_URL);
dotenv.config();
const pinata = new PinataSDK(process.env.REACT_APP_PINATA_API_KEY, process.env.REACT_APP_PINATA_SECRET_KEY);
const privateKey = process.env.REACT_APP_PRIVATE_KEY;

const signData = async (dataToSign, privateKey) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("address: " + wallet.address);
    const messageHash = ethers.utils.hashMessage(dataToSign);

    const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));
    console.log("hash: " + messageHash);
    console.log("signature: " + signature);
    return { messageHash, signature };
};

const app = express();

const generateImage = async () => {
    const imageData = Buffer.alloc(24 * 24 * 4);
    for (let i = 0; i < imageData.length; i += 4) {
        imageData[i] = Math.floor(Math.random() * 256);
        imageData[i + 1] = Math.floor(Math.random() * 256);
        imageData[i + 2] = Math.floor(Math.random() * 256);
        imageData[i + 3] = 255;
    }
    return sharp(imageData, { raw: { width: 24, height: 24, channels: 4 } }).png().toBuffer();
}

app.use('/generate-image', async (req, res, next) => {

    try {
        const imageData = await generateImage();
        const options = {
            pinataMetadata: {
                name: "RandomNFT"
            },
            pinataOptions: {
                cidVersion: 0
            }
        };
        const stream = Readable.from(imageData)
        const { IpfsHash, PinSize, Timestamp } = await pinata.pinFileToIPFS(stream, options);
        console.log(`Uploaded image to IPFS with hash ${IpfsHash}`);
        const { messageHash, signature } = await signData(IpfsHash, privateKey);
        res.json({ ipfsHash: IpfsHash, ipfsHashHash:messageHash, signature });
    } catch (err) {
        console.log(err);
    }
});

app.use('^/$', (req, res, next) => {
    fs.readFile(path.resolve('./build/index.html'), 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).send('error');
        }
        return res.send(data.replace('<div id="root"></div>', `<div id="root">${ReactDOMServer.renderToString(< App />)}</div>`));
    });
});

app.use(express.static(path.resolve(__dirname, '..', 'build')));
app.listen(port, () => {
    console.log(`open http://localhost:${port}`);
});