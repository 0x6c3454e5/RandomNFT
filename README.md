# RandomNFT
Generate a random image, upload it to IPFS, and mint an NFT with just one click.

## Usage
- Add .env file to the root folder
```
REACT_APP_SEPOLIA_RPC_URL=""
REACT_APP_ETHERSCAN_KEY=""
REACT_APP_PRIVATE_KEY=""
REACT_APP_PINATA_API_KEY=""
REACT_APP_PINATA_SECRET_KEY=""
```

- Run
```
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
npm run ssr
```
