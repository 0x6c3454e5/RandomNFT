# RandomNFT
Generate a random image, upload it to IPFS, and mint an NFT with just one click.

## Usage

- Obtain RPC url, etherscan api key, pinata api key, and pinata api secret from infura.io, etherscan.io, and pinata.cloud, and create an .env file in the project root directory.
```
RPC_URL=""
ETHERSCAN_API_KEY=""
PINATA_API_KEY=""
PINATA_API_SECRET=""
PRIVATE_KEY=""
IPFS_GATEWAY_BASE_URI="https://cloudflare-ipfs.com/ipfs/"
REACT_APP_CONTRACT_ADDRESS=""
```

- Install packages
```
npm install
```

- Create NFT constract
```
npx hardhat compile
npx hardhat run scripts/deploy.js --network testnet
cp -f artifacts/contracts/RandomNFT.sol/RandomNFT.json src/RandomNFT.json
```

- Run
```
npm run ssr
```


---
- Seeking full-time or part-time job in web3. Please feel free to contact me.
- 寻求 Web3 的全职或兼职工作，请随时与我联系。
- Web3のフルタイムまたはパートタイムの仕事を探しています。お気軽にご連絡ください。
