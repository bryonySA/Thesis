pragma solidity ^0.4.23;

import "./Business.sol";

contract Lookup {

    /*
        DESCRIPTION:
        The Lookup contract is used to keep track of all of the customers on the CreditRegister platform
        and the businesses that they interact with. This was necessary as the platform needed to allow
        for the same customer to interact with multiple businesses on the platform.
        Further to this, it stores details of external viewers who are permitted to view a specific customer's
        history and score.
    */


    ////////////////
    // VARIABLES //
    //////////////

    // Mapping of the cusotmer wallet address to an array of business wallets they interact with
    mapping(address => address[]) public customerAddressToBusinessList;

    // Mapping of the customer address to a mapping of permitted viewers and the date they have permission until
    mapping(address => mapping(address => uint256)) public customerAddressToPermissionList;


    /////////////
    // EVENTS //
    ///////////

    event permissionAdded(address _customerAddress, address _businessWalletAddress, uint256 _viewableUntil);

    ////////////////
    // FUNCTIONS // 
    //////////////   

    // Function which returns the list of business addresses that a customer wallet is linked to
    function getCustomerBusinessList(address _customerAddress) public view returns (address[]) {
        return customerAddressToBusinessList[_customerAddress];
    }


    // Function which adds a business address to the list of businesses the customer is linked to
    function addBusinessToCustomerList(address _customerAddress, address _businessWalletAddress) public {
        customerAddressToBusinessList[_customerAddress].push(_businessWalletAddress);
    }


    // Function which allows a customer to add a permitted viewer to their list. The mapping for msg.sender is updated
    // so view permission is only given for the account that sent the request
    function addPermissionToCustomerList(
        address _viewerWalletAddress,
        uint256 _viewableUntil
    ) 
        public
    {
        customerAddressToPermissionList[msg.sender][_viewerWalletAddress] = _viewableUntil;
        emit permissionAdded(msg.sender, _viewerWalletAddress, customerAddressToPermissionList[msg.sender][_viewerWalletAddress]);
    }


    // Functon that checks that the viewer requesting access has permission
    function checkPermission(address _customerAddress, address _viewerAddress) public view returns (bool){
        return (customerAddressToPermissionList[_customerAddress][_viewerAddress]) > now;
        
    }
}