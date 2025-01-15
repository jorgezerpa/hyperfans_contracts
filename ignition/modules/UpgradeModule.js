const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { proxyModule } = require("./SubscriptionService")


const upgradeModule = buildModule("UpgradeModule", (m) => {
    const proxyAdminOwner = m.getAccount(0);
  
    const { proxyAdmin, proxy } = m.useModule(proxyModule);
  
    const subscriptionServiceV2 = m.contract("SubscriptionServiceV2");
  
    // initialize new storage variables if needed
    const encodedFunctionCall = m.encodeFunctionCall(subscriptionServiceV2, "initializeX", []);
  
    m.call(proxyAdmin, "upgradeAndCall", [proxy, subscriptionServiceV2, encodedFunctionCall], {
      from: proxyAdminOwner,
    });
  
    return { proxyAdmin, proxy };
  });

  const subscriptionServiceV2Module = buildModule("SubscriptionServiceV2Module", (m) => {
    const { proxy } = m.useModule(upgradeModule);
  
    const subscriptionService = m.contractAt("SubscriptionServiceV2", proxy);

    const x = m.staticCall(subscriptionService, "getX");
    console.log("hi X", x.contract.results)
  
    return { subscriptionService };
  });

  module.exports = subscriptionServiceV2Module;