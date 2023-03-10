const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

const appfile = path.join(__dirname, '../.env');

function replaceAddress(address) {

  fs.readFile(appfile, 'utf8', function (err, data) {

    if (err) {
      console.log(err);
      return;
    }
    const regex = /REACT_APP_CONTRACT_ADDRESS="([0-9a-zA-Z_]*)"/g;
    const replacement = `REACT_APP_CONTRACT_ADDRESS="${address}"`;
    const result = data.replace(regex, replacement);
  
    fs.writeFile(appfile, result, 'utf8', function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
}

async function main() {

  const RandomNFT = await hre.ethers.getContractFactory("RandomNFT");
  const randomNFT = await RandomNFT.deploy();

  await randomNFT.deployed();

  replaceAddress(randomNFT.address);
  console.log(
    `RandomNFT deployed to ${randomNFT.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
