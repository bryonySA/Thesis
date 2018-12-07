pragma solidity ^0.4.23;

import "./Business.sol";

contract Lookup {

    mapping(address => address[]) public customerToBusinessList;

    function getCustomerBusinessList(address _customerAddress) public view returns (address[]) {
        return customerToBusinessList[_customerAddress];
    }

    function addBusinessToCustomerList(address _customerAddress) public {
        customerToBusinessList[_customerAddress].push(msg.sender);
    }

}