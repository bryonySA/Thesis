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

    mapping(address => BusinessDetails) businessWalletAddressToDetails;

    address[] allBusinesses;          //An array of the address of all businesses loaded on the platform. 
                                        // From here you can use the mappings to get their name and contract number

    event businessAdded(address _businessWalletAddress, string _businessName, address _contractAddress);

    address public owner;

    constructor() public{
        owner = msg.sender;
    }


    function addBusiness(address _businessWalletAddress, string _businessName) public {
        require(msg.sender == owner, "Only CreditRegister can add businesses.");
        //require(businessExists[_businessName] != true, "Business name already exists.");
        //require(businessAddressExists[_businessWalletAddress] != true, "Business wallet already exists.");
        require(businessWalletAddressToDetails[_businessWalletAddress].businessActive != true, "Business wallet already exists.");

        Business newBusiness = new Business();
        address businessContractAddress = address(newBusiness);
        businessWalletAddressToDetails[_businessWalletAddress] = BusinessDetails(businessContractAddress, _businessName,true);
        allBusinesses.push(_businessWalletAddress);
        emit businessAdded(_businessWalletAddress, _businessName, businessContractAddress);
    }


    function getBusinessDetails(address _businessWalletAddress) public view returns (
        address businessContractAddress,
        string businessName,
        bool businessActive
    ){
        return (businessWalletAddressToDetails[_businessWalletAddress].businessContractAddress,
            businessWalletAddressToDetails[_businessWalletAddress].businessName,
            businessWalletAddressToDetails[_businessWalletAddress].businessActive);
    }


    function getAllBusinesses() public view returns(address[]){
        return allBusinesses;
    }

    function setActiveFlag(address _businessWalletAddress, bool _businessActive) public {
        businessWalletAddressToDetails[_businessWalletAddress].businessActive = _businessActive;
    }
}