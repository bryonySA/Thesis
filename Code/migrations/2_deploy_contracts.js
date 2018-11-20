var SARegistryCoin = artifacts.require("./SARegistryCoin.sol");
var Master = artifacts.require("./Master.sol");
var Company = artifacts.require("./Company.sol");


module.exports = function(deployer) {
    deployer.deploy(SARegistryCoin);
    deployer.deploy(Master);
    deployer.deploy(Company);
};