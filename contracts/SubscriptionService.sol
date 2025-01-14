// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract SubscriptionService is OwnableUpgradeable {
    // No put direct values here. Set it on initializer if necessary (upgradeable rules) -> because: this is equivalent to set this values on the constructors. 
    uint256 public subscriptionFee;
    uint256 public interval;
    address[] public subscriptors;
    mapping(address => bool) alreadySubscribed;
    mapping(address => uint256) public subscriptionExpiry;
    address currencyAddress;
    // Storage gap to reserve space for future variables
    uint256[50] private __gap; 

    event SubscriptionRenewed(address indexed subscriber, uint256 expiryTimestamp);


    modifier isNotSubscribed() {
        require(!alreadySubscribed[msg.sender], "Address already subscribed");
        _;
    }

    modifier isSubscribed() {
        require(alreadySubscribed[msg.sender], "Address is not subscribed");
        _;
    }

    // REPLACE CONSTRUCTOR WITH INITIALZE FUNCTION FOR UPGRADEABILITY (make sure to follow the Open Zeppelin rules for upgradeable contracts)
    function initialize(uint256 _subscriptionFee, uint256 _interval, address _currencyAddress) public initializer {
        __Ownable_init(msg.sender);
        subscriptionFee = _subscriptionFee;
        interval = _interval;
        currencyAddress = _currencyAddress;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers(); // to block calls to initialize function from another origin than the proxy
    }

    function setSubscriptionFee(uint256 _newFee) external onlyOwner {
        subscriptionFee = _newFee;
    }

    function setSubscriptionInterval(uint256 _newInterval) external onlyOwner {
        interval = _newInterval;
    }
    
    function getSubscriptionFee() external view returns(uint256) {
        return subscriptionFee;
    }

    function getSubscriptionInterval() external view returns(uint256) {
        return interval;
    }

    function subscribe() external isNotSubscribed {
        // update states
        uint256 expiryTimestamp = block.timestamp + interval;
        subscriptionExpiry[msg.sender] = expiryTimestamp;
        subscriptors.push(msg.sender);
        alreadySubscribed[msg.sender] = true;

        // make the payment
        IERC20 token = IERC20(currencyAddress);
        token.transferFrom(msg.sender, owner(), subscriptionFee);

        emit SubscriptionRenewed(msg.sender, expiryTimestamp);
    }

    function checkSubscription() external view returns (bool) {
        return block.timestamp <= subscriptionExpiry[msg.sender];
    }

    function renewSubscription() external isSubscribed {
        require(block.timestamp > subscriptionExpiry[msg.sender], "Subscription is still active");

        uint256 expiryTimestamp = block.timestamp + interval;
        subscriptionExpiry[msg.sender] = expiryTimestamp;

        // make the payment
        IERC20 token = IERC20(currencyAddress);
        token.transferFrom(msg.sender, owner(), subscriptionFee);

        emit SubscriptionRenewed(msg.sender, expiryTimestamp);
    }

    function modifySubscriptorExpiry(uint256 newExpiryTimestamp, address subscriptor) external onlyOwner {
        subscriptionExpiry[subscriptor] = newExpiryTimestamp;
    }

    function modifySubscriptorsExpiries(uint256 newExpiryTimestamp, address[] memory subscriptorsArray) external onlyOwner {
        uint256 subscriptorsArrayLength = subscriptorsArray.length;
        for (uint i = 0; i < subscriptorsArrayLength; i++) {
            subscriptionExpiry[subscriptors[i]] = newExpiryTimestamp;
        }
    }

    function extendSubscriptorExpiry(uint256 expiryTimestampToAdd, address subscriptor) external onlyOwner {
        uint256 currentExpiry = subscriptionExpiry[subscriptor];
        subscriptionExpiry[subscriptor] = currentExpiry + expiryTimestampToAdd;
    }

    function extendSubscriptorsExpiries(uint256 expiryTimestampToAdd, address[] memory subscriptorsArray) external onlyOwner {
        uint256 subscriptorsArrayLength = subscriptorsArray.length;
        for (uint i = 0; i < subscriptorsArrayLength; i++) {
            uint256 currentExpiry = subscriptionExpiry[subscriptors[i]];
            subscriptionExpiry[subscriptors[i]] = currentExpiry + expiryTimestampToAdd;
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
}