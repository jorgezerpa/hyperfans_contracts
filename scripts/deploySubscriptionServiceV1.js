// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("deploying...")
  const SubscriptionService = await ethers.getContractFactory("SubscriptionService");

  const USDCAddressArbitrum = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // 6 decimals | On Arbitrum
  const subscriptionFee = 100 // 6 decimals
  const interval = 86400; // 1 day in seconds
  
  const subscriptionService = await upgrades.deployProxy(SubscriptionService, [subscriptionFee, interval, USDCAddressArbitrum]);

  await subscriptionService.waitForDeployment();
  console.log("subscriptionService deployed to (proxy):", await subscriptionService.getAddress());
}

main();