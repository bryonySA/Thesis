pragma solidity ^0.4.23;

import "./Business.sol";

contract Lookup {

    mapping(address => address[]) public customerToBusinessList;

    function getCustomerBusinessList(address _customerAddress) public view returns (address[]) {
        return customerToBusinessList[_customerAddress];
    }

    function addBusinessToCustomerList(address _customerAddress, address _businessAddress) public {
        customerToBusinessList[_customerAddress].push(_businessAddress);
    }

    function checkCustomerExists(address _customerAddress) public view returns (bool) {
        return (customerToBusinessList[_customerAddress].length != 0);
    }



}