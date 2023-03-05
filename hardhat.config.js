require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan")
const dotenv = require("dotenv");

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: process.env.REACT_APP_SEPOLIA_RPC_URL,
      accounts: [process.env.REACT_APP_PRIVATE_KEY],
      allowUnlimitedContractSize: true,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
    },
  },
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_API_KEY,
  },
};
