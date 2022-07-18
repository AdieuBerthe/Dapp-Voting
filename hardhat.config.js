require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")


const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
  solidity: "0.8.15",
  defaultNetwork: 'localhost',
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
      accounts : [`${process.env.PRIVATE_KEY}`],
      saveDeployments: true,
      chainId: 3,
      
      },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
      accounts : [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 42,
    },
  },

  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    feeCollector: {
      default: 1,
    },
  },
  paths: {
    cache: "./contracts/cache",
    artifacts: "./src/artifacts"
  },

};
