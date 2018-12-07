var Master = artifacts.require("./Master.sol");
var Lookup = artifacts.require("./Lookup.sol");

module.exports = function(deployer) {
    deployer.deploy(Master);
    deployer.deploy(Lookup);


//This file is used to deploy contracts. We only need to deploy contracts which aren't 
//created by another contract (ie. Master and  Lookup). Business contracts are deployed
//when the addBusiness function is called from the Master contract


//var Ownable = artifacts.require("./Ownable.sol");
//var SafeMath = artifacts.require("./SafeMath.sol");

};