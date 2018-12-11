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
        address businessContractAddress;
        string businessName;
        bool businessActive;
    }

    mapping(address => BusinessDetails) businessAddressToDetails;

    address[] allBusinesses;          //An array of the address of all businesses loaded on the platform. From here you can use the mappings to get their name and contract number

    event businessAdded(address _businessAddress, string _businessName, address _contractAddress);

    address public owner;

    constructor() public{
        owner = msg.sender;
    }

    function addBusiness(address _businessAddress, string _businessName) public {
        require(msg.sender == owner, "Only CreditRegister can add businesses.");
        //require(businessExists[_businessName] != true, "Business name already exists.");
        //require(businessAddressExists[_businessAddress] != true, "Business wallet already exists.");
        require(businessAddressToDetails[_businessAddress].businessActive != true, "Business wallet already exists.");

        Business newBusiness = new Business();
        address contractAddress = address(newBusiness);
        businessAddressToDetails[_businessAddress] = BusinessDetails(contractAddress, _businessName,true);
        allBusinesses.push(_businessAddress);
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


    function getAllBusinesses() public view returns(address[]){
        return allBusinesses;
    }
}