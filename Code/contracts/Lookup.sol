pragma solidity ^0.4.23;

import "./Business.sol";

contract Lookup {

    mapping(address => address[]) public customerAddressToBusinessList;

    function getCustomerBusinessList(address _customerAddress) public view returns (address[]) {
        return customerAddressToBusinessList[_customerAddress];
    }

    function addBusinessToCustomerList(address _customerAddress, address _businessAddress) public {
        customerAddressToBusinessList[_customerAddress].push(_businessAddress);
    }
}