pragma solidity ^0.4.23;

//import "./Master.sol";
contract Customer {
    //address owner; //This will be the businesses wallet
    address creator; //This will be the Business wallet which first loaded them
    string customerName; // This is the customer name

    constructor() public {
        creator = msg.sender;
    }


    
}