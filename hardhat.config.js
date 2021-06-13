/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config()

module.exports = {
  solidity: "0.5.16",
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA}`, // or any other JSON-RPC provider
      // accounts: [process.env.WALLET_PRIVATE_KEY]
    },
    matic: {
      url: "https://rpc-mainnet.matic.network",
      accounts: [process.env.WALLET_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN,
  },
  defaultNetwork: "mainnet",
};
