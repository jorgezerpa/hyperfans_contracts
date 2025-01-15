// scripts/create-box.js
const { ethers, upgrades } = require("hardhat");

const PROXY_ADDRESS = "0xB21C6Ba5fE6dC56DDF86B3979bE5A45004813033";

async function main() {
  console.log("Upgrading...")
  const SubscriptionServiceV2 = await ethers.getContractFactory("SubscriptionServiceV2");
  const subscriptionService = await upgrades.upgradeProxy(PROXY_ADDRESS, SubscriptionServiceV2)
  await subscriptionService.initializeX()
  console.log("Upgraded", await subscriptionService.getAddress())
}

main();

