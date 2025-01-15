const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const subscriptionServiceModule = require("./ProxyModule")

const upgradeModule = buildModule("UpgradeModule", (m) => {
    const proxyAdminOwner = m.getAccount(0);
    const { proxyAdmin, proxy } = m.useModule(subscriptionServiceModule);
    
    // initialize new storage variables if needed
    const subscriptionServiceV2 = m.contract("SubscriptionServiceV2");
    const encodedFunctionCall = m.encodeFunctionCall(subscriptionServiceV2, "initializeX", []);
  
    m.call(proxyAdmin, "upgradeAndCall", [proxy, subscriptionServiceV2, encodedFunctionCall], {
      from: proxyAdminOwner,
    });
  
    return { proxyAdmin, proxy };
  });

  const subscriptionServiceV2Module = buildModule("SubscriptionServiceV2Module", (m) => {
    const { proxy } = m.useModule(upgradeModule);
  
    const subscriptionService = m.contractAt("SubscriptionServiceV2", proxy);
  
    return { subscriptionService };
  });

  module.exports = subscriptionServiceV2Module;