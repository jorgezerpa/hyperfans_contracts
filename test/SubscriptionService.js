const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { network } = require("hardhat");

const ARBITRUM_RPC = "https://arbitrum-mainnet.infura.io/v3/b26a78bcb38b4957a68b3cdc645c2547"
const ARBITRUM_SEPOLIA_RPC = "https://arbitrum-sepolia.infura.io/v3/b26a78bcb38b4957a68b3cdc645c2547"

const USDCAddressArbitrum = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // 6 decimals | On Arbitrum

describe("SubscriptionService", function () {
  
  async function deploySubscriptionServiceFixture() {
    const subscriptionFee = 100 // 6 decimals
    const interval = 86400; // 1 day in seconds

    const [owner, account1] = await ethers.getSigners();

    const SubscriptionService = await ethers.getContractFactory("SubscriptionService");
    const subscriptionService = await SubscriptionService.deploy(subscriptionFee, interval, USDCAddressArbitrum);

    return { subscriptionService, subscriptionFee, interval, owner, account1 };
  }

  async function deploySubscriptionServiceWithUSDCFixture() {
    const subscriptionFee = 100 // 6 decimals
    const interval = 86400; // 1 day in seconds

    const [owner, account1, account2, account3, account4, account5] = await ethers.getSigners();

    const SubscriptionService = await ethers.getContractFactory("SubscriptionService");
    const subscriptionService = await SubscriptionService.deploy(subscriptionFee, interval, USDCAddressArbitrum);

    // const USDC = await ethers.getContractAt("IERC20", USDCAddressArbitrum, owner); // no need to pass owner value cause is taken by default  
    const USDC = await ethers.getContractAt("IERC20", USDCAddressArbitrum, owner); // OWNER HAS 6412 USDC units 
    await USDC.connect(owner).transfer(account1, 200);
    await USDC.connect(owner).transfer(account2, 200);
    await USDC.connect(owner).transfer(account3, 200);
    await USDC.connect(owner).transfer(account4, 200);
    await USDC.connect(owner).transfer(account5, 200);

    return { subscriptionService, USDC, subscriptionFee, interval, owner, account1, account2, account3, account4, account5 };
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


  describe("Subscriptions", async function () {
    it("Should subscribe caller and transfer the payment to the owner", async function () {
      const { subscriptionService, owner, account1, USDC } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);

      const prevOwnerBalance = await USDC.balanceOf(owner);

      // new subscription
      await USDC.connect(account1).approve(subscriptionService, 100);    
      await subscriptionService.connect(account1).subscribe();

      const subscriptors = await subscriptionService.getSubscriptors();
      const newOwnerBalance = await USDC.balanceOf(owner);

      expect(subscriptors.length).to.be.equal(1);
      expect(subscriptors[0]).to.be.equal(account1.address);
      expect(newOwnerBalance - prevOwnerBalance).to.be.equal(100);
    });
    it("Should subscribe callers and transfer the payments to the owner", async function () {
      const { subscriptionService, owner, USDC, account1, account2, account3, account4, account5 } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);

      const prevOwnerBalance = await USDC.balanceOf(owner);

      // new subscriptions
      await USDC.connect(account1).approve(subscriptionService, 100);    
      await subscriptionService.connect(account1).subscribe();
      await USDC.connect(account2).approve(subscriptionService, 100);    
      await subscriptionService.connect(account2).subscribe();
      await USDC.connect(account3).approve(subscriptionService, 100);    
      await subscriptionService.connect(account3).subscribe();
      await USDC.connect(account4).approve(subscriptionService, 100);    
      await subscriptionService.connect(account4).subscribe();
      await USDC.connect(account5).approve(subscriptionService, 100);    
      await subscriptionService.connect(account5).subscribe();

      const subscriptors = await subscriptionService.getSubscriptors();
      const newOwnerBalance = await USDC.balanceOf(owner);

      expect(subscriptors.length).to.be.equal(5); // 5 new subscriptors
      expect(subscriptors[0]).to.be.equal(account1.address);
      expect(subscriptors[1]).to.be.equal(account2.address);
      expect(subscriptors[2]).to.be.equal(account3.address);
      expect(subscriptors[3]).to.be.equal(account4.address);
      expect(subscriptors[4]).to.be.equal(account5.address);
      expect(newOwnerBalance - prevOwnerBalance).to.be.equal(500); // 100 fee * 5 subscriptors
    });

    it("Should check an active subscription", async function () {
      const { subscriptionService, subscriptionFee, account1, USDC } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);
    
      // new subscription
      await USDC.connect(account1).approve(subscriptionService, subscriptionFee); 
      await subscriptionService.connect(account1).subscribe();
    
      // check active subscription
      const isActive = await subscriptionService.connect(account1).checkSubscription();
      expect(isActive).to.be.true;
    });

    it("Should check an expired subscription", async function () {
      const { subscriptionService, subscriptionFee, interval, owner, account1, USDC } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);
    
      // new subscription
      await USDC.connect(account1).approve(subscriptionService, subscriptionFee); 
      await subscriptionService.connect(account1).subscribe();
    
      // Advance time beyond the subscription interval
      await time.increase(interval + 1); 
    
      // Check expired subscription
      const isActive = await subscriptionService.connect(account1).checkSubscription();
      expect(isActive).to.be.false;
    });

    it("Should renew an expired subscription and transfer the payment to the owner", async function () {
      const { subscriptionService, subscriptionFee, interval, owner, account1, USDC } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);
  
      // Subscribe account1
      await USDC.connect(account1).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account1).subscribe();
  
      // Advance time beyond the subscription interval
      await time.increase(interval + 1); 

      // Check that the subscription is expired
      let isActive = await subscriptionService.connect(account1).checkSubscription();
      expect(isActive).to.be.false;
  
      // Renew the subscription
      const prevOwnerBalance = await USDC.balanceOf(owner);
      await USDC.connect(account1).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account1).renewSubscription();
  
      // Check that the subscription is now active
      isActive = await subscriptionService.connect(account1).checkSubscription();
      expect(isActive).to.be.true;
  
      // Check that the owner received the payment
      const newOwnerBalance = await USDC.balanceOf(owner);
      expect(newOwnerBalance - prevOwnerBalance).to.be.equal(subscriptionFee); 
    });

    it("Should modify a single subscriptor's expire time", async function () {
      const { subscriptionService, subscriptionFee, interval, owner, account1, USDC } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);
  
      // Subscribe account1
      await USDC.connect(account1).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account1).subscribe();
  
      // Get initial expiry timestamp
      let initialExpiry = await subscriptionService.subscriptionExpiry(account1.address);
  
      // Extend the subscription interval
      const newExpiryTimestamp = Number(initialExpiry) + (interval * 2); // Extend by 2 intervals
      await subscriptionService.connect(owner).modifySubscriptorExpiry(newExpiryTimestamp, account1.address);
  
      // Verify the updated expiry timestamp
      const updatedExpiry = await subscriptionService.subscriptionExpiry(account1.address);
      expect(updatedExpiry).to.be.equal(newExpiryTimestamp);
    });

    it("Should modify the expiries for multiple subscribers", async function () {
      const { subscriptionService, subscriptionFee, interval, owner, account1, account2, account3, USDC } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);
  
      // Subscribe multiple accounts
      await USDC.connect(account1).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account1).subscribe();
      await USDC.connect(account2).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account2).subscribe();
      await USDC.connect(account3).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account3).subscribe();
  
      // Get initial expiry timestamp to add more time (you can add or substract)
      let initialExpiry1 = await subscriptionService.subscriptionExpiry(account1.address);
  
      // Extend the subscription interval for multiple subscribers
      const newExpiryTimestamp = Number(initialExpiry1) + (interval * 2); // Extend by 2 intervals
      const subscribersToExtend = [account1.address, account2.address, account3.address];
      await subscriptionService.connect(owner).modifySubscriptorsExpiries(newExpiryTimestamp, subscribersToExtend);
  
      // Verify the updated expiry timestamps
      const updatedExpiry1 = await subscriptionService.subscriptionExpiry(account1.address);
      const updatedExpiry2 = await subscriptionService.subscriptionExpiry(account2.address);
      const updatedExpiry3 = await subscriptionService.subscriptionExpiry(account3.address);
      expect(updatedExpiry1).to.be.equal(newExpiryTimestamp);
      expect(updatedExpiry2).to.be.equal(newExpiryTimestamp);
      expect(updatedExpiry3).to.be.equal(newExpiryTimestamp);
    });

    it("Should extend a single subscriptor's expiry by a specific amount", async function () {
      const { subscriptionService, subscriptionFee, interval, owner, account1, USDC } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);
  
      // Subscribe account1
      await USDC.connect(account1).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account1).subscribe();
  
      // Get initial expiry timestamp
      let initialExpiry = await subscriptionService.subscriptionExpiry(account1.address);
  
      // Extend the expiry by a specific amount (e.g., 1 week)
      const expiryToAdd = 7 * 24 * 60 * 60; // 1 week in seconds
      await subscriptionService.connect(owner).extendSubscriptorExpiry(expiryToAdd, account1.address);
  
      // Verify the updated expiry timestamp
      const updatedExpiry = await subscriptionService.subscriptionExpiry(account1.address);
      expect(updatedExpiry).to.be.equal(Number(initialExpiry) + expiryToAdd);
  });
  
  it("Should extend the expiry for multiple subscribers by a specific amount", async function () {
      const { subscriptionService, subscriptionFee, interval, owner, account1, account2, account3, USDC } = await loadFixture(deploySubscriptionServiceWithUSDCFixture);
  
      // Subscribe multiple accounts
      await USDC.connect(account1).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account1).subscribe();
      await USDC.connect(account2).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account2).subscribe();
      await USDC.connect(account3).approve(subscriptionService, subscriptionFee);
      await subscriptionService.connect(account3).subscribe();
  
      // Get initial expiry timestamps
      let initialExpiry1 = await subscriptionService.subscriptionExpiry(account1.address);
      let initialExpiry2 = await subscriptionService.subscriptionExpiry(account2.address);
      let initialExpiry3 = await subscriptionService.subscriptionExpiry(account3.address);
  
      // Extend the expiry for multiple subscribers by a specific amount (e.g., 2 days)
      const expiryToAdd = 2 * 24 * 60 * 60; // 2 days in seconds
      const subscribersToExtend = [account1.address, account2.address, account3.address];
      await subscriptionService.connect(owner).extendSubscriptorsExpiries(expiryToAdd, subscribersToExtend);
  
      // Verify the updated expiry timestamps
      const updatedExpiry1 = await subscriptionService.subscriptionExpiry(account1.address);
      const updatedExpiry2 = await subscriptionService.subscriptionExpiry(account2.address);
      const updatedExpiry3 = await subscriptionService.subscriptionExpiry(account3.address);
      expect(updatedExpiry1).to.be.equal(Number(initialExpiry1) + expiryToAdd);
      expect(updatedExpiry2).to.be.equal(Number(initialExpiry2) + expiryToAdd);
      expect(updatedExpiry3).to.be.equal(Number(initialExpiry3) + expiryToAdd);
    });

  });



});
