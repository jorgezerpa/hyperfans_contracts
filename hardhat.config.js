require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');

require('dotenv').config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      // forking arbitrum one network
      forking: {
        url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        blockNumber: 295383545
      }
    },
    arbitrumOne: {
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      // accounts: [process.env.ARBITRUM_PRIVATE_KEY]
    },
  },
};
