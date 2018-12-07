pragma solidity ^0.4.23;

import "./Master.sol";

contract MasterInterface {
    function checkCustomerAddressExists(address _customerAddress) public view returns(bool);
}

contract Business {
    address public owner; //This will be the businesses wallet
    address public creator; //This will be the CreditRegister wallet
    string public businessName; // This is the business name
    bool public assigned = false; // Changes to true when ownership assigned
    
    mapping(address => int32) private customerToBalance; 
    //address public masterWallet; // This stores the Master Wallet address so that we can access the functions

    MasterInterface masterContract = MasterInterface(creator);

    constructor() public {
        creator = msg.sender;
        // Took this out because it seems that the masterWallet is the same as msg.sender = creator...
        //masterWallet = _masterWallet;
    }

    event ownershipSet(address indexed _businessAddress, string _businessName, address _contractAddress);

    function setOwnership(address _businessAddress, string _businessName) public{
        require(assigned == false, "Contract has already been assigned ownership");
        owner = _businessAddress;
        businessName = _businessName;
        assigned = true;
        emit ownershipSet(_businessAddress, _businessName, this);
    }

    function addCustomer(address _customerAddress, string _customerName) public onlyBusiness() {
        //currently hard coded to say 0xe561E15C3e569B61f3Ffb337dFaAe711eA649160 already exists
        //require(masterContract.checkCustomerAddressExists(_customerAddress) != true, "Customer wallet already exists on the platform.");

        //Customer newCustomer =  new Customer();
        //businessAddressToContract[_businessAddress] = newBusiness;
        //address contractAddress = address(newBusiness);
        
        //allBusinesses.push(_businessName);
        //businessExists[_businessName] = true;
        //businessAddressExists[_businessAddress] = true;
        //businessNameToAddress[_businessName] = _businessAddress;
        //emit businessAdded(_businessName, _businessAddress, contractAddress);
    }

    function checkCustomerExists(address _customerAddress) public returns (bool) {
        //if (customerToBalance[_customerAddress] != "" )

    }

    modifier onlyBusiness(){
        require(msg.sender == owner, "Only the business owner can call this function");
        _;
    }

    //modifier onlyABusiness(){
      //  required(checkBusinessAddressExists[msg.sender] == true,"Only businesses already loaded on the platform can call this function");
      //  _;
    //}
    
}