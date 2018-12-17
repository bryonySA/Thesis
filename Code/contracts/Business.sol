pragma solidity ^0.4.23;

import "./Master.sol";
import "./Lookup.sol";

contract MasterInterface {
    function getBusinessDetails(address _businessWalletAddress) public view returns (
        address businessContractAddress,
        string businessName,
        bool businessActive
    );
} 

contract LookupInterface {
    function checkCustomerExists(address _customerAddress) public view returns(bool);
    function getCustomerBusinessList(address _customerAddress) public view returns (address[]);
    function addBusinessToCustomerList(address _customerAddress,address _businessWalletAddress) public;
}

contract Business {
    address public owner; //This will be the businesses wallet
    address public creator; //This will be the CreditRegister wallet
    string public businessName; // This is the business name
    bool public assigned = false; // Changes to true when ownership assigned
    address[] allCustomers;
    //address public lookup;


    //MasterInterface masterContract = MasterInterface(creator);
    //LookupInterface lookupContract = LookupInterface(lookup);

    constructor() public {
        creator = msg.sender;
        // Took this out because it seems that the masterWallet is the same as msg.sender = creator...
        //masterWallet = _masterWallet;
    }

    event ownershipSet(address indexed _businessWalletAddress, string _businessName, address _contractAddress);
    event customerAdded(string _customerName, address _customerAddress, address _businessWalletAddress);
    event customerInvoiced(address _customerAddress, string _ipfsHash, int _customerBalance);

        //////////////////////////////
        /// BUSINESS SECTION ////////
        ////////////////////////////

    function setOwnership(address _businessWalletAddress, string _businessName) public{
        require(assigned == false, "Contract has already been assigned ownership");
        owner = _businessWalletAddress;
        businessName = _businessName;
        assigned = true;
        emit ownershipSet(_businessWalletAddress, _businessName, this);
    }

        //////////////////////////////
        /// CUSTOMER SECTION ////////
        ////////////////////////////

    struct CustomerDetails{
        string customerName;
        int customerBalance;
        bool customerActive;
    }

    struct documentDetails{
        string ipfsHash;
        int amount;
        string dueDate;
        // if amt < 0 then invoice, if > 0 receipt
    }

    mapping(address => CustomerDetails) customerAddressToDetails;
    //mapping(address => string[]) customerAddressToInvoices;

    mapping(address => string[]) customerAddressToInvoices;

    function addCustomer(address _customerAddress,
        string _customerName, 
        address _lookupContractAddress,
        address _masterContractAddress
        ) public {
        require(owner == msg.sender, "Only the business owner can add customers");
        //MasterInterface masterContract = MasterInterface(_masterContractAddress);
        //bool businessActive = masterContract.getBusinessDetails(msg.sender)[2];
        //require(businessActive == true,"Business must be active to add customer");
        require(customerAddressToDetails[_customerAddress].customerActive != true, "This customer is already active. Please use amend function");
        require(customerAddressToDetails[_customerAddress].customerBalance == 0, 
            "This customer is inactive but has a non-zero balance. Please use amend function");

        //It doesn't matter if the customer already exists on the platform - either create a new array or add to existing array
        LookupInterface lookupContract = LookupInterface(_lookupContractAddress);
        lookupContract.addBusinessToCustomerList(_customerAddress, msg.sender);
        
        //The opening balance must be 0 as the business needs to upload an invoice or receipt before changing the balance
        customerAddressToDetails[_customerAddress] = CustomerDetails(_customerName, 0,true);
        allCustomers.push(_customerAddress);

        emit customerAdded(_customerName, _customerAddress, msg.sender);
    }

    function getAllCustomers() public view returns(address[]){
        return allCustomers;
    }

    function getCustomerDetails(address _customerAddress) public view returns (
        string customerName,
        int customerBalance,
        bool customerActive){

        return (customerAddressToDetails[_customerAddress].customerName,
            customerAddressToDetails[_customerAddress].customerBalance,
            customerAddressToDetails[_customerAddress].customerActive);
    }

    function getCustomerInvoicesLength(address _customerAddress) public view returns (uint){

        return customerAddressToInvoices[_customerAddress].length;
    }

    function getCustomerInvoices(address _customerAddress, uint index) public view returns (string){

        return customerAddressToInvoices[_customerAddress][index-1];
    }

    function invoiceCustomer(address _customerAddress,
        int _invoiceAmount, 
        string _ipfsHash
        ) public {
        require(owner == msg.sender, "Only the business owner can invoice customers");
        require(customerAddressToDetails[_customerAddress].customerActive == true, "This customer must be active");
        require(_invoiceAmount > 0, "The invoice amount must be positive");

        int newBalance;
        newBalance = customerAddressToDetails[_customerAddress].customerBalance - _invoiceAmount;
        //The opening balance must be 0 as the business needs to upload an invoice or receipt before changing the balance
        customerAddressToDetails[_customerAddress].customerBalance = newBalance;
        uint count;
        count = customerAddressToInvoices[_customerAddress].push(_ipfsHash);


        emit customerInvoiced(_customerAddress, customerAddressToInvoices[_customerAddress][count], customerAddressToDetails[_customerAddress].customerBalance);
    }

    function receiptCustomer(address _customerAddress,
        int _receiptAmount, 
        string _ipfsHash
        ) public {
        require(owner == msg.sender, "Only the business owner can receipt customers");
        require(customerAddressToDetails[_customerAddress].customerActive == true, "This customer must be active");
        require(_invoiceAmount > 0, "The receipt amount must be positive");

        int newBalance;
        newBalance = customerAddressToDetails[_customerAddress].customerBalance + _receiptAmount;
        
        customerAddressToDetails[_customerAddress].customerBalance = newBalance;
        uint count;
        count = customerAddressToInvoices[_customerAddress].push(_ipfsHash);


        emit customerInvoiced(_customerAddress, customerAddressToInvoices[_customerAddress][count], customerAddressToDetails[_customerAddress].customerBalance);
    }
    
}