pragma solidity ^0.4.23;

import "./Business.sol";

contract Master {

    /*
        DESCRIPTION:
        The Master contract will be owned by SARegistry. This is a contract factory which
        allows us to deploy new instances of the Business contract when reputable businesses
        want to be added onto the platform. These businesses will be able to record payment
        histories, so they will need to be vetted first.
    */
    
    string[] public allBusinesses;          //An array of the names of all businesses loaded on the platform

    mapping(address => address) businessAddressToContract;      //Maps the business wallet to the deployed contract
    mapping(string => address) businessNameToAddress;          //Maps the business name to its wallet address
    mapping(string => bool) businessExists;                     //Maps the business name to boolean, allowing user to check if business exists

    event businessAdded(string _businessName, address _contractAddress);

    address owner;

    constructor() public{
        owner = msg.sender;
    }

    function addBusiness(address _businessAddress, string _businessName) public{
        require(msg.sender == owner, "Only owner (ie. SARegistry) can add businesses.");
        require(businessExists[_businessName] != true, "Business already exists.");

        Business newBusiness =  new Business();
        businessAddressToContract[_businessAddress] = newBusiness;
        address contractAddress = address(newBusiness);
        //businessAddressToContract[_businessAddress] = new Business();
        
        allBusinesses.push(_businessName);
        businessExists[_businessName] = true;
        businessNameToAddress[_businessName] = _businessAddress;
        emit businessAdded(_businessName, contractAddress);
    }

    function checkBusinessExists(string _businessName) public view returns(bool){
        return businessExists[_businessName];
    }    

    function getAllBusinesses(uint index) public view returns(string){
        return allBusinesses[index];
    } 

    function checkContractAddress(string _businessName) public view returns(address){
        return businessAddressToContract[businessNameToAddress[_businessName]];
    }   
}