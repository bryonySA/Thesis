pragma solidity ^0.4.23;

contract Business {
    address owner; //This will be the businesses wallet
    address creator; //This will be the SA Registry wallet
    string businessName; // This is the business name
    bool assigned = false; // Changes to true when ownership assigned

    constructor() public {
        creator = msg.sender;
    }

    event ownership(address indexed _businessAddress, string _businessName, address _contractAddress);

    function setOwnership(address _businessAddress, string _businessName, address _contractAddress) public{
        require(assigned == false, "Contract has already been assigned ownership");
        owner = _businessAddress;
        creator = msg.sender;
        businessName = _businessName;
        assigned = true;
        emit ownership(_businessAddress, _businessName, _contractAddress);
    }

    modifier onlyBusiness(){
        require(msg.sender == owner, "Only the company wallet can call this function");
        _;
    }
    
}
 