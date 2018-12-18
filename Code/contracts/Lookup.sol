pragma solidity ^0.4.23;

import "./Business.sol";

contract Lookup {

    mapping(address => address[]) public customerAddressToBusinessList;
    mapping(address => mapping(address => uint256)) public customerAddressToPermissionList;

    event permissionAdded(address _customerAddress, address _businessWalletAddress, uint256 _viewableUntil);


    function getCustomerBusinessList(address _customerAddress) public view returns (address[]) {
        return customerAddressToBusinessList[_customerAddress];
    }

    function addBusinessToCustomerList(address _customerAddress, address _businessWalletAddress) public {
        customerAddressToBusinessList[_customerAddress].push(_businessWalletAddress);
    }

    function addPermissionToCustomerList(address _viewerWalletAddress, uint256 _viewableUntil) public {
        customerAddressToPermissionList[msg.sender][_viewerWalletAddress] =_viewableUntil;
        emit permissionAdded(msg.sender, _viewerWalletAddress, customerAddressToPermissionList[msg.sender][_viewerWalletAddress]);
    }

    function checkPermission(address _customerAddress, address _viewerAddress) public view returns (bool){
        return (customerAddressToPermissionList[_customerAddress][_viewerAddress]) > now ;
        
    }
}