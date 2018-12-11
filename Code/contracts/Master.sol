pragma solidity ^0.4.23;

import "./Business.sol";

contract Master {

    /*
        DESCRIPTION:
        The Master contract will be owned by CreditRegister. This is a contract factory which
        allows us to deploy new instances of the Business contract when reputable businesses
        want to be added onto the platform. These businesses will be able to record payment
        histories, so they will need to be vetted first.
    */
    
    struct BusinessDetails{
        //address businessWalletAddress;
        address businessContractAddress;
        string businessName;
        bool businessActive;
    }

    mapping(address => BusinessDetails) businessAddressToDetails;
    //Business[] public allBusinesses;
    address[] public allBusinesses;          //An array of the address of all businesses loaded on the platform. From here you can use the mappings to get their name and contract number

    //mapping(address => address) businessAddressToContract;      //Maps the business wallet to the deployed contract
    //mapping(address => string) businessAddressToName;          //Maps the business address (unique) to its name                    
    //mapping(address => bool) businessAddressExists;         //Maps the business address to boolean, allowing user to check if business exists

    event businessAdded(address _businessAddress, string _businessName, address _contractAddress);

    address public owner;
    //address masterContractAddress = address(this);

    constructor() public{
        owner = msg.sender;
    }

    function addBusiness(address _businessAddress, string _businessName) public {
        require(msg.sender == owner, "Only CreditRegister can add businesses.");
        //require(businessExists[_businessName] != true, "Business name already exists.");
        //require(businessAddressExists[_businessAddress] != true, "Business wallet already exists.");
        require(businessAddressToDetails[_businessAddress].businessActive != true, "Business wallet already exists.");

        Business newBusiness = new Business();
        //businessAddressToContract[_businessAddress] = newBusiness;
        address contractAddress = address(newBusiness);
        //businessAddressToContract[_businessAddress] = new Business();
        businessAddressToDetails[_businessAddress] = BusinessDetails(contractAddress, _businessName,true);
        allBusinesses.push(_businessAddress);
        //businessExists[_businessName] = true;
        //businessAddressExists[_businessAddress] = true;
        //businessAddressToName[_businessAddress] = _businessName;
        emit businessAdded(_businessAddress, _businessName, contractAddress);
    }

    function getBusinessDetails(address _businessAddress) public view returns (
        address businessContractAddress,
        string businessName,
        bool businessActive
    ){
        return (businessAddressToDetails[_businessAddress].businessContractAddress,
            businessAddressToDetails[_businessAddress].businessName,
            businessAddressToDetails[_businessAddress].businessActive);
    }
  
   /* function checkBusinessAddressExists(address _businessAddress) public view returns(bool){
        return businessAddressExists[_businessAddress];
    }


    function getContractFromAddress(address _businessAddress) public view returns(address){
        return businessAddressToContract[_businessAddress];
    }


    function getNameFromAddress(address _businessAddress) public view returns(string){
        return businessAddressToName[_businessAddress];
    }*/

    function getAllBusinesses() public view returns(address[]){
        return allBusinesses;
    }

  /* 
    function checkBusinessNameExists(string _businessName) public view returns(bool){
        return businessExists[_businessName];
    } 

    function checkCustomerAddressExists(address _customerAddress) public view returns(bool){
        if (_customerAddress == 0xe561E15C3e569B61f3Ffb337dFaAe711eA649160) {
            return true;
        } else {
            return customerAddressExists[_customerAddress];
        }
    }
    
    function getAllBusinesses(uint index) public view returns(address){
        return allBusinesses[index];
    }

    function checkContractAddress(address _businessAddress) public view returns(address){
        return businessAddressToContract[_businessAddress];
    }  */ 
}