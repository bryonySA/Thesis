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
    event documentProcessed(address _customerAddress, int _customerBalance);

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

    struct DocumentDetails{
        string ipfsHash;
        int amount;
        string dueDate;
        // if amt < 0 then invoice, if > 0 receipt
    }

    mapping(address => CustomerDetails) customerAddressToDetails;
    mapping(address => DocumentDetails[]) customerAddressToDocuments;

    //mapping(address => string[]) customerAddressToInvoices;

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

    function getCustomerDocumentsLength(address _customerAddress) public view returns (uint){

        return customerAddressToDocuments[_customerAddress].length;
    }

    function getCustomerDocument(address _customerAddress, uint index) public view returns (
        string ipfsHash,
        int amount,
        string dueDate){
            DocumentDetails memory thisDocument = customerAddressToDocuments[_customerAddress][index];

        return (thisDocument.ipfsHash,
            thisDocument.amount,
           thisDocument.dueDate);
    }

    function processDocument(address _customerAddress,
        int _amount, 
        string _ipfsHash,
        string _dueDate
        ) public {
        //NB!!! Negative number = INVOICE
        require(owner == msg.sender, "Only the business owner can process documents");
        require(customerAddressToDetails[_customerAddress].customerActive == true, "This customer must be active");
        
        /*string documentType;
        if (_amount < 0){
            documentType = "invoice";
        } else
            documentType = "receipt";
        }*/

        //int newBalance;
        //newBalance = customerAddressToDetails[_customerAddress][1] + _amount;
        //The opening balance must be 0 as the business needs to upload an invoice or receipt before changing the balance
        CustomerDetails storage thisCustomer = customerAddressToDetails[_customerAddress];
        thisCustomer.customerBalance = thisCustomer.customerBalance + _amount;
        

        //DocumentDetails memory 
        DocumentDetails memory document = DocumentDetails(_ipfsHash, _amount, _dueDate);
        customerAddressToDocuments[_customerAddress].push(document);
    

        emit documentProcessed(_customerAddress, thisCustomer.customerBalance);
    }

    
}