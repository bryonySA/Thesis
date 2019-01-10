pragma solidity ^0.4.23;

import "./Business.sol";

contract Master {

    /*
        DESCRIPTION:
        The Master contract will be owned by CreditRegister. This is a contract factory which
        allows us to deploy new instances of the Business contract when reputable businesses
        want to be added onto the platform. These businesses will be able to record payment
        histories, so they will need to be vetted first by CreditRegister.
    */


    ////////////////
    // VARIABLES //
    //////////////
    
    struct BusinessDetails{
        address businessContractAddress;
        string businessName;
        bool businessActive;
    }

    // The wallet address for the owner of the contract which is always CreditRegister
    address public owner;
    
    //This mapping stores the Business Details for each business wallet address
    mapping(address => BusinessDetails) private businessWalletAddressToDetails;

    // This array stores the buisness wallet addresses of all businesses loaded on the platform
    address[] private allBusinesses;


    /////////////
    // EVENTS //
    ///////////

    event businessAdded(address _businessWalletAddress, string _businessName, address _contractAddress);


    ////////////////
    // FUNCTIONS // 
    //////////////   

    // Set the owner of the contract do the wallet address that deployed it
    constructor() public{
        owner = msg.sender;
    }


    // Add business to the platform by deploying a new business contract as long as  CreditRegister sends the request and the business does
    // and the business does not already exist on the platform
    function addBusiness(address _businessWalletAddress, string _businessName) public {
        require(msg.sender == owner, "Only CreditRegister can add businesses.");
        require(
            businessWalletAddressToDetails[_businessWalletAddress].businessActive != true,
            "Business wallet already exists."
        );

        // Deploy new business contract
        Business newBusiness = new Business();

        // Store the new contract address
        address businessContractAddress = address(newBusiness);

        // Update the Business Details on the mapping and add the business wallet address to the list of businesses on the platform
        businessWalletAddressToDetails[_businessWalletAddress] = BusinessDetails(businessContractAddress, _businessName,true);
        allBusinesses.push(_businessWalletAddress);

        // Emit the event to confirm that the business has been added
        emit businessAdded(_businessWalletAddress, _businessName, businessContractAddress);
    }


    function getBusinessDetails(address _businessWalletAddress) public view 
        returns (
        address businessContractAddress,
        string businessName,
        bool businessActive
        )
    {
        return (
            businessWalletAddressToDetails[_businessWalletAddress].businessContractAddress,
            businessWalletAddressToDetails[_businessWalletAddress].businessName,
            businessWalletAddressToDetails[_businessWalletAddress].businessActive
        );
    }


    function getAllBusinesses() public view returns(address[]){
        return allBusinesses;
    }

    // Allow CreditRegister to activate or deactivate businesses on the platform
    function setActiveFlag(address _businessWalletAddress, bool _businessActive) public {
        require(msg.sender == owner, "Only CreditRegister can change the active flag of a business.");
        businessWalletAddressToDetails[_businessWalletAddress].businessActive = _businessActive;
    }
}