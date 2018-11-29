//var Ownable = artifacts.require("./Ownable.sol");
//var SafeMath = artifacts.require("./SafeMath.sol");
var SARegistryCoin = artifacts.require("./SARegistryCoin.sol");
var Master = artifacts.require("./Master.sol");
var Business = artifacts.require("./Business.sol");

module.exports = function(deployer) {
    //deployer.deploy(Ownable);
    //deployer.deploy(SafeMath);
    deployer.deploy(SARegistryCoin);
    deployer.deploy(Master);
    deployer.deploy(Business);
};