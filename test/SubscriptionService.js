const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("SubscriptionService", function () {
  
  async function deploySubscriptionServiceFixture() {
    // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    // const ONE_GWEI = 1_000_000_000;

    const subscriptionFee = 1000000
    const interval = 86400; // 1 day in seconds

    // Contracts are deployed using the first signer/account by default
    const [owner, account1] = await ethers.getSigners();

    const SubscriptionService = await ethers.getContractFactory("SubscriptionService");
    const subscriptionService = await SubscriptionService.deploy(subscriptionFee, interval);

    return { subscriptionService, subscriptionFee, interval, owner, account1 };
  }

  // -------------------------
  // TESTS
  // -------------------------
  describe("Deployment", async function () {
    it("Should set the correct owner", async function () {
      const { subscriptionService, owner } = await loadFixture(deploySubscriptionServiceFixture);
      const setedOwner = await subscriptionService.owner()
      expect(owner.address).to.be.equal(setedOwner);
    });
    it("Should set correct subscription fee", async function () {
      const { subscriptionService, subscriptionFee } = await loadFixture(deploySubscriptionServiceFixture);
      const setedFee = await subscriptionService.getSubscriptionFee();
      expect(subscriptionFee).to.be.equal(setedFee);
    });
    it("Should set correct subscription interval", async function () {
      const { subscriptionService, interval } = await loadFixture(deploySubscriptionServiceFixture);
      const setedInterval = await subscriptionService.getSubscriptionInterval();
      expect(interval).to.be.equal(setedInterval);
    });
  });
  
  describe("Ownership", async function () {
    it("Should transfer ownership", async function () {
      const { subscriptionService, owner, account1 } = await loadFixture(deploySubscriptionServiceFixture);
      const initialOwner = await subscriptionService.owner()
      await subscriptionService.transferOwnership(account1);
      const newOwner = await subscriptionService.owner()

      expect(owner).to.be.equal(initialOwner);
      expect(account1).to.be.equal(newOwner);
    });
    it("Should revert if non-owner tries to transfer ownership", async function () {
      const { subscriptionService, owner, account1 } = await loadFixture(deploySubscriptionServiceFixture);
      await expect(subscriptionService.connect(account1).transferOwnership(account1)).to.be.revertedWithCustomError(subscriptionService,"OwnableUnauthorizedAccount");
    });
  });
  
  describe("Modify subscription params", async function () {
    it("Should set the new subscription fee", async function () {
      const { subscriptionService } = await loadFixture(deploySubscriptionServiceFixture);
      const newFee = 3000000;
      await subscriptionService.setSubscriptionFee(newFee);
      const newSetedFee = await subscriptionService.getSubscriptionFee();
      expect(newSetedFee).to.be.equal(newFee);
    });
    it("Should set the new subscription interval", async function () {
      const { subscriptionService } = await loadFixture(deploySubscriptionServiceFixture);
      const newInterval = 172800;
      await subscriptionService.setSubscriptionInterval(newInterval);
      const newSetedInterval = await subscriptionService.getSubscriptionInterval();
      expect(newSetedInterval).to.be.equal(newInterval);
    });
  });



});
