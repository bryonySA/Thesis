var Business = artifacts.require("./Business.sol");
var Master = artifacts.require("./Master.sol");

// accounts[0] is CreditRegisters' Master Account

//Master contract test
contract('Master', function(accounts) {
    
    //test Variables
    var business_name = "Lumkani";
    var business_address = accounts[1];
    var invalid_business_name = "Invalid";
    var invalid_business_address = accounts[9];
    var businessContractAddress;
    var masterAddress;
    
    it("should allow me to store the masterAddress", function(){
    return Master.deployed().then(function(instance){
        masterAddress = instance.address;
        console.log(masterAddress);
    });
    });

    //actual tests
    //Check owner of master is set to account[0]
    it("should make account[0] the owner of Master account", function(){
        return Master.deployed().then(function(instance){
            return instance.owner();
        }).then(function(owner){
            assert.equal(owner, accounts[0],"owner on Master contract wasn't properly set");
        });
    });    

    // Check that account[1] cannot add a business
    // https://ethereum.stackexchange.com/questions/9103/how-can-you-handle-an-expected-throw-in-a-contract-test-using-truffle-and-ethere
    it("should only let account[0] add a business", function(){
        return Master.deployed().then(function(instance){
                return instance.addBusiness(invalid_business_address, invalid_business_name,{'from' : accounts[1]});
        }).then(assert.fail)
        .catch(function(error){
            assert.include(
                error.message,
                "Only CreditRegister can add businesses",
                "Error should be thrown when account[1] creates contract");
            });
    });

    /*it("should not add the invalid business name to the array", function() {
        return Master.deployed().then(function(instance) {
            return instance.checkBusinessNameExists(invalid_business_name);         
        }).then(function(result) {
            assert.equal(false, result, "The invalid business name should not exist on the master contract");
        });
    });*/

    it("should not add the invalid business address to the array", function() {
        return Master.deployed().then(function(instance) {
            return instance.checkBusinessAddressExists(invalid_business_address);         
        }).then(function(result) {
            assert.equal(false, result, "The invalid business address should not exist on the master contract");
        });
    });

    //Check business is added with correct details
    it("should add a business", function() {
        return Master.deployed().then(function(instance) {
            return instance.addBusiness(business_address, business_name);         
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "businessAdded", "event should be businessAdded");
            assert.equal(receipt.logs[0].args._businessName, business_name, "business in event must be " + business_name);
            assert.equal(receipt.logs[0].args._businessAddress, business_address, "business in event must be " + business_address);
            businessContractAddress = receipt.logs[0].args._contractAddress;
            //businessInstance = Business.at(businessContractAddress);
        });
    });

    //Should not allow business to be added twice
    it("should not add a business if the wallet already exists", function() {
        return Master.deployed().then(function(instance) {
            return instance.addBusiness(business_address, business_name);         
        }).then(assert.fail)
            .catch(function(error){
                assert.include(
                error.message,
                "Business wallet already exists",
                "Error should be thrown wallet already exists");
            });
    });
  

    //Should update address to contract mapping table
    it("should update the business address to contract mapping", function() {
        return Master.deployed().then(function(instance) {
            return instance.getContractFromAddress(business_address);         
        }).then(function(contractAddress){
            assert.equal(contractAddress,businessContractAddress,"Address to contract mapping incorrect")
        });
    });

    //Creator must be master wallet
    it("should update creator to master wallet", function(){
    return Business.at(businessContractAddress).then(function(instance){
            return instance.creator();
        }).then(function(creator){
            console.log('business creator: ' + creator);
            assert.equal(creator,masterAddress,"Creator must be master account");
        });
    });

    //took this out because it turned out creator = masterAddress = msg.sender
    /*it("should update master wallet to master contract address", function(){
    return Business.at(businessContractAddress).then(function(instance){
            return instance.masterWallet();
        }).then(function(masterWallet){
            assert.equal(masterWallet,masterAddress,"masterWallet must be the master contract address");
        });
    });*/

    it("should set assigned to false initially", function(){
    return Business.at(businessContractAddress).then(function(instance){
            return instance.assigned();
        }).then(function(assigned){
            assert.equal(assigned,false,"before ownership is set, assigned must be false");
        });
    });

    //took this out as we will use the address as a unique identifier
    /*// After successful addition, the name should exist on master contract
    it("Business Name should exist", function() {
        return Master.deployed().then(function(instance) {
            return instance.checkBusinessNameExists(business_name);         
        }).then(function(result) {
            assert.equal(true, result, "The business name should exist on the master contract");
        });
    });*/

    // After successful addition, the address should exist on master contract
    it("Business Address should exist", function() {
        return Master.deployed().then(function(instance) {
            return instance.checkBusinessAddressExists(business_address);         
        }).then(function(result) {
            assert.equal(true, result, "The business address should exist on the master contract");
        });
    });

    
    //Anyone can set ownership but only once therefore this test is invalid
    /*// Only Master can set ownership
        it("should only allow account[0] to set ownership", function(){
        return Business.at(businessContractAddress).then(function(instance){
                instance.setOwnership(business_address, business_name,masterAddress,{'from' : accounts[8]});
        }).then(assert.fail)
        .catch(function(error){
            assert.include(
                error.message,
                "Only CreditRegister can add businesses.",
                "Error should be thrown when CreditRegister doesn't send message");
            });
    });*/


    // Ownership should be set to business wallet
    it("Business owner should be business wallet", function() {
        return Business.at(businessContractAddress).then(function(instance) {
            return instance.setOwnership(business_address, business_name);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "ownershipSet", "event should be ownershipSet");
            assert.equal(receipt.logs[0].args._businessName, business_name, "business in event must be " + business_name);
            assert.equal(receipt.logs[0].args._businessAddress, business_address, "business in event must be " + business_address);
            assert.equal(receipt.logs[0].args._contractAddress, businessContractAddress, "contract address in event must be " + businessContractAddress);
        });
    });

    // Business name must be set correctly
    it("should make Business Address the owner", function() {
        return Business.at(businessContractAddress).then(function(instance) {
            return instance.owner();       
        }).then(function(owner) {
            assert.equal(owner, business_address, "The business name should be the business name");
        });
    });

    // Business name must be set correctly
    it("should store Business Name correctly", function() {
        return Business.at(businessContractAddress).then(function(instance) {
            return instance.businessName();       
        }).then(function(businessName) {
            assert.equal(businessName, business_name, "The business name should be the business name");
        });
    });

    // Assigned should be set to true to ensure ownership is only assigned once
    it("should change assigned to true", function() {
        return Business.at(businessContractAddress).then(function(instance) {
            return instance.assigned();       
        }).then(function(assigned) {
            assert.equal(assigned, true, "The assigned indicator should be true");
        });
    }); 


    // Ownership can only be set once
    it("should only allow ownership to be set once", function(){
        return Business.at(businessContractAddress).then(function(instance){
                return instance.setOwnership(business_address, business_name);
        }).then(assert.fail)
        .catch(function(error){
            assert.include(
                error.message,
                "Contract has already been assigned ownership",
                "Error should be thrown when ownership set twice");
            });
    });
    // Only business account can create customer - ie business must exist

    // Customer creator is the business account

});