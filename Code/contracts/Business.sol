pragma solidity ^0.4.23;

import "./Master.sol";
import "./Lookup.sol";

/*contract MasterInterface {
    function checkCustomerAddressExists(address _customerAddress) public view returns(bool);
} */

contract LookupInterface {
    function checkCustomerExists(address _customerAddress) public view returns(bool);
    function getCustomerBusinessList(address _customerAddress) public view returns (address[]);
    function addBusinessToCustomerList(address _customerAddress,address _businessAddress) public;
}

contract Business {
    address public owner; //This will be the businesses wallet
    address public creator; //This will be the CreditRegister wallet
    string public businessName; // This is the business name
    bool public assigned = false; // Changes to true when ownership assigned
    address[] allCustomers;
    //address public lookup;

    struct CustomerDetails{
        string customerName;
        int32 customerBalance;
        bool customerActive;
    }

    mapping(address => CustomerDetails) customerWalletToDetails;
    //MasterInterface masterContract = MasterInterface(creator);
    //LookupInterface lookupContract = LookupInterface(lookup);

    constructor() public {
        creator = msg.sender;
        // Took this out because it seems that the masterWallet is the same as msg.sender = creator...
        //masterWallet = _masterWallet;
    }

    event ownershipSet(address indexed _businessAddress, string _businessName, address _contractAddress);
    event customerAdded(string _customerName, address _customerAddress);

        //////////////////////////////
        /// BUSINESS SECTION ////////
        ////////////////////////////

    function setOwnership(address _businessAddress, string _businessName) public{
        require(assigned == false, "Contract has already been assigned ownership");
        owner = _businessAddress;
        businessName = _businessName;
        assigned = true;
        emit ownershipSet(_businessAddress, _businessName, this);
    }

        //////////////////////////////
        /// CUSTOMER SECTION ////////
        ////////////////////////////

    function addCustomer(address _customerAddress,
        string _customerName, 
        address _lookupContractAddress, 
        int32 _openingBalance
        ) public {
        require(owner == msg.sender, "Only the business owner can add customers");
        require(customerWalletToDetails[_customerAddress].customerActive != true, "This customer is already active. Please use amend function");
        require(customerWalletToDetails[_customerAddress].customerBalance == 0, 
            "This customer is inactive but has a non-zero balance. Please use amend function");

        //It doesn't matter if the customer already exists on the platform - either create a new array or add to existing array
        LookupInterface lookupContract = LookupInterface(_lookupContractAddress);
        lookupContract.addBusinessToCustomerList(_customerAddress, msg.sender);
        
        customerWalletToDetails[_customerAddress] = CustomerDetails(_customerName, _openingBalance,true);
        allCustomers.push(_customerAddress);

        emit customerAdded(_customerName, _customerAddress);
    }

    function getAllCustomers() public view returns(address[]){
        return allCustomers;
    }


    /*modifier onlyBusiness(){
        require(msg.sender == owner, "Only the business owner can call this function");
        _;
    }*/

    //modifier onlyABusiness(){
      //  required(checkBusinessAddressExists[msg.sender] == true,"Only businesses already loaded on the platform can call this function");
      //  _;
    //}
    
}