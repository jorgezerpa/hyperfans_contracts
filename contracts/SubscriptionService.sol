// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SubscriptionService {
    address public owner;
    uint256 public subscriptionFee;
    uint256 public interval;
    address[] public subscriptors;
    mapping(address => bool) alreadySubscribed;
    mapping(address => uint256) public subscriptionExpiry;

    event SubscriptionRenewed(address indexed subscriber, uint256 expiryTimestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier isNotSubscribed() {
        require(!alreadySubscribed[msg.sender], "Address already subscribed");
        _;
    }

    modifier isSubscribed() {
        require(alreadySubscribed[msg.sender], "Address is not subscribed");
        _;
    }

    constructor(uint256 _subscriptionFee, uint256 _interval) {
        owner = msg.sender;
        subscriptionFee = _subscriptionFee;
        interval = _interval;
    }

    function setSubscriptionFee(uint256 _newFee) external onlyOwner {
        subscriptionFee = _newFee;
    }

    function subscribe() external payable isNotSubscribed {
        require(msg.value >= subscriptionFee, "Insufficient payment for subscription");
        
        uint256 expiryTimestamp = block.timestamp + interval;
        subscriptionExpiry[msg.sender] = expiryTimestamp;
        subscriptors.push(msg.sender);
        alreadySubscribed[msg.sender] = true;

        withdrawFunds();

        emit SubscriptionRenewed(msg.sender, expiryTimestamp);
    }

    function checkSubscription() external view returns (bool) {
        return block.timestamp <= subscriptionExpiry[msg.sender];
    }

    function renewSubscription() external payable isSubscribed {
        require(block.timestamp > subscriptionExpiry[msg.sender], "Subscription is still active");
        require(msg.value >= subscriptionFee, "Insufficient payment for subscription");

        uint256 expiryTimestamp = block.timestamp + interval;
        subscriptionExpiry[msg.sender] = expiryTimestamp;

        withdrawFunds();

        emit SubscriptionRenewed(msg.sender, expiryTimestamp);
    }

    // works too to give a free trial time
    function extendSubscriptorInterval(uint256 newExpiryTimestamp, address subscriptor) external onlyOwner {
        subscriptionExpiry[subscriptor] = newExpiryTimestamp;
    }

    function extendSubscriptorsInterval(uint256 newExpiryTimestamp, address[] memory subscriptorsArray) external onlyOwner {
        uint256 subscriptorsArrayLength = subscriptorsArray.length;
        for (uint i = 0; i < subscriptorsArrayLength; i++) {
            subscriptionExpiry[subscriptors[i]] = newExpiryTimestamp;
        }
    }

    function getSubscriptors() external view returns (address[] memory) {
        return subscriptors;
    }

    function getRangeOfSubscriptors(uint256 from, uint256 to) external view returns (address[] memory) {
        require(from<to, "from param have to be less than to params");
        require(to<=subscriptors.length, "to value exceed number of subscriptors registered");
        address[] memory subscriptorsToReturn = new address[](to - from);
        uint256 index = 0; 
        for (uint i = from; i < to; i++) {
        subscriptorsToReturn[index] = subscriptors[i]; 
        index++; 
        }

        return subscriptorsToReturn;
    }


    // INTERNALS 
    function withdrawFunds() internal onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        payable(owner).transfer(balance);
    }
}