pragma solidity ^0.4.23;

import "./Master.sol";
import "./Lookup.sol";

// Interface to allow the Business Contract to use Master Contract functionality
contract MasterInterface {
    function getBusinessDetails(address _businessWalletAddress) 
        public 
        view
        returns (
        address businessContractAddress,
        string businessName,
        bool businessActive
        );
} 


// Interface to allow the Business Contract to use Lookup Contract functionality
contract LookupInterface {
    function checkCustomerExists(address _customerAddress) public view returns(bool);
    function getCustomerBusinessList(address _customerAddress) public view returns (address[]);
    function addBusinessToCustomerList(address _customerAddress,address _businessWalletAddress) public;
}


contract Business {
     /*
        DESCRIPTION:
        The Business Contract has two sections - Business and Customer - and provides the main functionality for the 
        credit registry. It allows businesses to interact with customers as well as allows for customers to interact with
        the platform.
    */
   
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///// BUSINESS SECTION ///////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////
    // VARIABLES //
    //////////////

    address public owner; //This will be the businesses wallet
    address public creator; //This will be the CreditRegister wallet
    string public businessName;
    bool public assigned = false; // Changes to true when ownership assigned
    address[] allCustomers; // Array with addresses of all customers the business has interacted with

    /////////////
    // EVENTS //
    ///////////

    event ownershipSet(address indexed _businessWalletAddress, string _businessName, address _contractAddress);

    ////////////////
    // FUNCTIONS // 
    //////////////   

    constructor() public {
        creator = msg.sender;
    }

    // Function allowing ownership of a new contract to be set. This can only be done once
    function setOwnership(address _businessWalletAddress, string _businessName) public{
        require(assigned == false, "Contract has already been assigned ownership");
        owner = _businessWalletAddress;
        businessName = _businessName;
    
        // Change assigned to true so that ownership cannot be changed
        assigned = true;
        emit ownershipSet(_businessWalletAddress, _businessName, this);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///// CUSTOMER SECTION ///////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ////////////////
    // VARIABLES //
    //////////////

    struct CustomerDetails{
        string customerName;
        int customerBalance;
        bool customerActive;
    }

    struct DocumentDetails{
        string ipfsHash;
        int amount; // Note that if amt < 0 then invoice, if > 0 receipt
        string dueDate;
    }

    // Mapping of customer wallet address to their details including balance
    mapping(address => CustomerDetails) customerAddressToDetails;
    // Mapping of customer wallet address to all documents the business has processed for them
    mapping(address => DocumentDetails[]) customerAddressToDocuments;

    /////////////
    // EVENTS //
    ///////////

    event customerAdded(string _customerName, address _customerAddress, address _businessWalletAddress);
    event documentProcessed(address _customerAddress, int _customerBalance);

    ////////////////
    // FUNCTIONS // 
    //////////////   

    // Function allowing a customer to be added to the platform. It needs to be linked to the correct Master and Lookup contracts,
    // so these contract addresses are taken in as inputs
    function addCustomer(
        address _customerAddress,
        string _customerName, 
        address _lookupContractAddress,
        address _masterContractAddress
    ) 
        public 
    {
        // Only the business wallet can add customers to their list 
        require(owner == msg.sender, "Only the business owner can add customers");
        // Customer must not already be loaded on the businesses list of clients
        require(
            customerAddressToDetails[_customerAddress].customerActive != true,
            "This customer is already active. Please use amend function"
        );
        // Customer must have a balance = 0 if they are loaded and inactive
        require(
            customerAddressToDetails[_customerAddress].customerBalance == 0, 
            "This customer is inactive but has a non-zero balance. Please use amend function"
        );

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

    function getCustomerDetails(address _customerAddress)
        public 
        view
        returns (
            string customerName,
            int customerBalance,
            bool customerActive
        )
    {
        return (
            customerAddressToDetails[_customerAddress].customerName,
            customerAddressToDetails[_customerAddress].customerBalance,
            customerAddressToDetails[_customerAddress].customerActive
        );
    }

    // Return the length of the customers document list (mainly for looping purposes)
    function getCustomerDocumentsLength(address _customerAddress)
        public 
        view 
        returns (uint)
    {
        return customerAddressToDocuments[_customerAddress].length;
    }

    // Return a document from the customer document list
    function getCustomerDocument(address _customerAddress, uint index)
        public 
        view 
        returns (
            string ipfsHash,
            int amount,
            string dueDate
        )
    {
        DocumentDetails memory thisDocument = customerAddressToDocuments[_customerAddress][index];
        return (
            thisDocument.ipfsHash,
            thisDocument.amount,
            thisDocument.dueDate
        );
    }

    // Process invoices or receipts for the customer to update their balance
    function processDocument(
        address _customerAddress,
        int _amount, 
        string _ipfsHash,
        string _dueDate
    )
        public
    {
        //NB!!! Negative number = INVOICE
        require(owner == msg.sender, "Only the business owner can process documents");
        require(customerAddressToDetails[_customerAddress].customerActive == true, "This customer must be active");
        
        // Update the customer balance
        CustomerDetails storage thisCustomer = customerAddressToDetails[_customerAddress];
        thisCustomer.customerBalance = thisCustomer.customerBalance + _amount;
    
        // Add the Document Details to the customer list
        DocumentDetails memory document = DocumentDetails(_ipfsHash, _amount, _dueDate);
        customerAddressToDocuments[_customerAddress].push(document);
    
        emit documentProcessed(_customerAddress, thisCustomer.customerBalance);
    }
}