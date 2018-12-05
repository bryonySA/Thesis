//var Ownable = artifacts.require("./Ownable.sol");
//var SafeMath = artifacts.require("./SafeMath.sol");
var CreditRegisterCoin = artifacts.require("./CreditRegisterCoin.sol");
var Master = artifacts.require("./Master.sol");
var Business = artifacts.require("./Business.sol");
var Customer = artifacts.require("./CreditRegisterCoin.sol");

module.exports = function(deployer) {
    //deployer.deploy(Ownable);
    //deployer.deploy(SafeMath);
    //deployer.deploy(CreditRegisterCoin);
    deployer.deploy(Master);
    //deployer.deploy(Business,Master.address); //We don't need this as the contract is deployed on demand!
    //deployer.deploy(Customer);
};