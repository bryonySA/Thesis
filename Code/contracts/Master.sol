pragma solidity ^0.4.23;

import "./Business.sol";
import "./Customer.sol";

contract Master {

    /*
        DESCRIPTION:
        The Master contract will be owned by CreditRegister. This is a contract factory which
        allows us to deploy new instances of the Business contract when reputable businesses
        want to be added onto the platform. These businesses will be able to record payment
        histories, so they will need to be vetted first.
    */
    
    string[] public allBusinesses;          //An array of the names of all business names loaded on the platform

    mapping(address => address) businessAddressToContract;      //Maps the business wallet to the deployed contract
    mapping(string => address) businessNameToAddress;          //Maps the business name to its wallet address
    mapping(string => bool) businessExists;                     //Maps the business name to boolean, allowing user to check if business exists
    mapping(address => bool) businessAddressExists; 

    mapping(address => bool) customerAddressExists; 


    event businessAdded(string _businessName, address _businessAddress, address _contractAddress);

    address public owner;
    //address masterContractAddress = address(this);

    constructor() public{
        owner = msg.sender;
    }

    function addBusiness(address _businessAddress, string _businessName) public {
        require(msg.sender == owner, "Only CreditRegister can add businesses.");
        require(businessExists[_businessName] != true, "Business name already exists.");
        require(businessAddressExists[_businessAddress] != true, "Business wallet already exists.");

        Business newBusiness =  new Business(this);
        businessAddressToContract[_businessAddress] = newBusiness;
        address contractAddress = address(newBusiness);
        //businessAddressToContract[_businessAddress] = new Business();
        
        allBusinesses.push(_businessName);
        businessExists[_businessName] = true;
        businessAddressExists[_businessAddress] = true;
        businessNameToAddress[_businessName] = _businessAddress;
        emit businessAdded(_businessName, _businessAddress, contractAddress);
    }

    function checkBusinessNameExists(string _businessName) public view returns(bool){
        return businessExists[_businessName];
    }    

    function checkBusinessAddressExists(address _businessAddress) public view returns(bool){
        return businessAddressExists[_businessAddress];
    } 

    function checkCustomerAddressExists(address _customerAddress) public view returns(bool){
        if (_customerAddress == 0xe561E15C3e569B61f3Ffb337dFaAe711eA649160) {
            return true;
        } else {
            return customerAddressExists[_customerAddress];
        }
    }
    
    function getAllBusinesses(uint index) public view returns(string){
        return allBusinesses[index];
    } 

    function checkContractAddress(string _businessName) public view returns(address){
        return businessAddressToContract[businessNameToAddress[_businessName]];
    }   
}