// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SubscriptionServiceModule", (m) => {

  // const SubscriptionService = m.contract("SubscriptionService", [unlockTime], {
  //   value: lockedAmount,
  // });
  const SubscriptionService = m.contract("SubscriptionService");

  return { SubscriptionService };
});
