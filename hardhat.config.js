require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.15",

  paths: {
    cache: "./contracts/cache",
    artifacts: "./src/artifacts"
  },

};
