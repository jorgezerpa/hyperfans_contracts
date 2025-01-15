const { expect } = require("chai");

const ProxyModule = require("../ignition/modules/ProxyModule");
const UpgradeModule = require("../ignition/modules/UpgradeModule");

const { ignition } = require("hardhat");

describe("Subscription Service Proxy", function () {
  describe("Proxy interaction", async function () {
    it("Should be interactable via proxy", async function () {
      const [, otherAccount] = await ethers.getSigners();

      const { subscriptionService } = await ignition.deploy(ProxyModule);

      const result = await subscriptionService.connect(otherAccount).getSubscriptors()
      // await subscriptionService.connect(otherAccount).getX()
      // expect(await subscriptionService.connect(otherAccount).getSubscriptors().length).to.equal(0);
    });
  });

  describe("Upgrading", function () {
    it("Should have upgraded the proxy to DemoV2", async function () {
      const [, otherAccount] = await ethers.getSigners();

      const { subscriptionService } = await ignition.deploy(UpgradeModule);

      const result = await subscriptionService.connect(otherAccount).getSubscriptors()
    });

    it("Should have set the name during upgrade", async function () {
      const [, otherAccount] = await ethers.getSigners();
      
      const { subscriptionService:subscriptionServiceV2 } = await ignition.deploy(UpgradeModule);
      
      const result = await subscriptionServiceV2.connect(otherAccount).getX()
      console.log(result)
    });
  });
});