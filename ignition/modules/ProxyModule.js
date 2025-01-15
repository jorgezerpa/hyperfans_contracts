const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// to deploy proxy
const proxyModule = buildModule("ProxyModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);
  const subscriptionService = m.contract("SubscriptionService");

  const proxy = m.contract("TransparentUpgradeableProxy", [
    subscriptionService,
    proxyAdminOwner,
    "0x",
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    "AdminChanged",
    "newAdmin"
  );

  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { proxy,proxyAdmin };
});


// To interact with the contract
const subscriptionServiceModule = buildModule("SubscriptionServiceModule", (m) => {
  const { proxy, proxyAdmin } = m.useModule(proxyModule);

  const subscriptionService = m.contractAt("SubscriptionService", proxy);

  return { subscriptionService, proxy, proxyAdmin };
});

module.exports = subscriptionServiceModule;