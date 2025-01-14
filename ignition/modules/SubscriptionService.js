// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers, upgrades } = require("hardhat");

module.exports = buildModule("SubscriptionServiceModule", async(m) => {
  // params
  const subscriptionFee = 100 // 6 decimals
  const interval = 86400; // 1 day in seconds
  const USDCAddressArbitrum = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // 6 decimals | On Arbitrum

  const SubscriptionService = await ethers.getContractFactory("SubscriptionService");
  const subscriptionService = await upgrades.deployProxy(SubscriptionService, [subscriptionFee, interval, USDCAddressArbitrum]);

  await subscriptionService.waitForDeployment();
  console.log("SS deployed to: ", await subscriptionService.getAddress());

  return { SubscriptionService };
});

// script to upgrade
// async function main() {
//   const BoxV2 = await ethers.getContractFactory("BoxV2");
//   const box = await upgrades.upgradeProxy(BOX_ADDRESS, BoxV2);
//   console.log("Box upgraded");
// }







// EXAMPLE CODE
// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

// const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// const JAN_1ST_2030 = 1893456000;
// const ONE_GWEI = 1_000_000_000n;

// module.exports = buildModule("LockModule", (m) => {
//   const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
//   const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

//   const lock = m.contract("Lock", [unlockTime], {
//     value: lockedAmount,
//   });

//   return { lock };
// });
