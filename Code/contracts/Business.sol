pragma solidity ^0.4.23;

import "./Master.sol";
import "./Lookup.sol";

/*contract MasterInterface {
    function checkCustomerAddressExists(address _customerAddress) public view returns(bool);
} */

contract LookupInterface {
    function checkCustomerExists(address _customerAddress) public view returns(bool);
    function getCustomerBusinessList(address _customerAddress) public view returns (address[]);
    function addBusinessToCustomerList(address _customerAddress) public;
}

contract Business {
    address public owner; //This will be the businesses wallet
    address public creator; //This will be the CreditRegister wallet
    string public businessName; // This is the business name
    bool public assigned = false; // Changes to true when ownership assigned
    address[] allCustomers;
    //address public lookup;

    mapping(address => int32) private customerToBalance; 
    mapping(address => bool) private customerToActive; 
    //address public masterWallet; // This stores the Master Wallet address so that we can access the functions

    //MasterInterface masterContract = MasterInterface(creator);
    //LookupInterface lookupContract = LookupInterface(lookup);

    constructor() public {
        creator = msg.sender;
        // Took this out because it seems that the masterWallet is the same as msg.sender = creator...
        //masterWallet = _masterWallet;
    }

    event ownershipSet(address indexed _businessAddress, string _businessName, address _contractAddress);
    event customerAdded(string _customerName, address _customerAddress);

    function setOwnership(address _businessAddress, string _businessName) public{
        require(assigned == false, "Contract has already been assigned ownership");
        owner = _businessAddress;
        businessName = _businessName;
        assigned = true;
        emit ownershipSet(_businessAddress, _businessName, this);
    }

    function addCustomer(address _customerAddress, string _customerName, address _lookupContractAddress, int32 _openingBalance) public onlyBusiness() {
        require(customerToActive[_customerAddress] != true, "This customer is already active. Please use amend function");

        //It doesn't matter if the customer already exists on the platform - either create a new array or add to existing array
        LookupInterface lookupContract = LookupInterface(_lookupContractAddress);
        lookupContract.addBusinessToCustomerList(_customerAddress);

        customerToActive[_customerAddress] = true;
        customerToBalance[_customerAddress] = _openingBalance;

        emit customerAdded(_customerName, _customerAddress);
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