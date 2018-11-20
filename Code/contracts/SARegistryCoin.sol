pragma solidity ^0.4.23;

contract SARegistryCoin {

    address public minter;

    mapping (address => uint) public balances;

    event Transfer(address from, address to, uint amount);

    constructor() public {
        minter = msg.sender;
    }

    function mint(address _receiver, uint _amount) external {
        if (msg.sender != minter) return;
        balances[_receiver] += _amount;
    }

    function transfer(address _receiver, uint _amount) external {
        if (balances[msg.sender] < _amount) return;
        balances[msg.sender] -= _amount;
        balances[_receiver] += _amount;
        emit Transfer(msg.sender, _receiver, _amount);
    }
}