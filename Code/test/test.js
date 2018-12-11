var Business = artifacts.require("./Business.sol");
var Master = artifacts.require("./Master.sol");
var Lookup = artifacts.require("./Lookup.sol");
// accounts[0] is CreditRegisters' Master Account

//global test Variables - accounts can only be assigned after deployment
var business_name1 = "Lumkani";
var business_address1;
var invalid_business_name = "Invalid";
var invalid_business_address;
var business_contract_address1;
var masterAddress;
var business_name2 = "SpazaShop";
var business_address2;
var customer_name1 = "Claire";
//var customer_address1 = accounts[3];
var lookupAddress;
var emptyBusinessDetails;

//Master contract test
contract('Master', function(accounts) {
    
    // account variables
    business_address1 = accounts[1];
    invalid_business_address = accounts[9];
    business_address2 = accounts[2];

    // get details for other tests
    it("should allow me to store the masterAddress", function(){
    return Master.deployed().then(function(instance){
        masterAddress = instance.address;
        return instance.getBusinessDetails(business_address1).then(function(emptyDetails){
            emptyBusinessDetails = emptyDetails;
        });
    });
    });

    it("should allow me to store the lookupAddress", function(){
        return Lookup.deployed().then(function(instance){
            lookupAddress = instance.address;
            console.log(lookupAddress);
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

    // Check that the invalid business from previous test was not added to the mapping table (ie. return should be zeros or equivalent)
    it("should not add the invalid business address to the mapping", function() {
        return Master.deployed().then(function(instance) {
            return instance.getBusinessDetails(invalid_business_address).then(function(result) {
            assert.equal(emptyBusinessDetails[0], result[0], "The invalid business address contract should not exist on the master contract");
            assert.equal(emptyBusinessDetails[1], result[1], "The invalid business address name should not exist on the master contract");
            assert.equal(emptyBusinessDetails[2], result[2], "The invalid business address active indicator should not exist on the master contract");
        });
    });
    });

    //Check correct event is emitted when new business is added
    it("should add a business and emit businessAdded event", function() {
        return Master.deployed().then(function(instance) {
            return instance.addBusiness(business_address1, business_name1);         
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "businessAdded", "event should be businessAdded");
            assert.equal(receipt.logs[0].args._businessName, business_name1, "business in event must be " + business_name1);
            assert.equal(receipt.logs[0].args._businessAddress, business_address1, "business in event must be " + business_address1);
            business_contract_address1 = receipt.logs[0].args._contractAddress;
        });
    });

    //Should not allow business to be added twice
    it("should not add a business if the wallet already exists", function() {
        return Master.deployed().then(function(instance) {
            return instance.addBusiness(business_address1, business_name1);         
        }).then(assert.fail)
            .catch(function(error){
                assert.include(
                error.message,
                "Business wallet already exists",
                "Error should be thrown wallet already exists");
            });
    });
  

    //Should update the business details
    it("should update the business address to contract mapping", function() {
        return Master.deployed().then(function(instance) {
            return instance.getBusinessDetails(business_address1);         
        }).then(function(result){
            assert.equal(result[0],business_contract_address1,"Address to contract mapping incorrect")
            assert.equal(result[1],business_name1,"Address to name mapping incorrect")
            assert.equal(result[2],true,"Address to active indicator mapping incorrect")
        });
    });

    //Creator must be master wallet
    it("should update creator to master wallet", function(){
    return Business.at(business_contract_address1).then(function(instance){
            return instance.creator();
        }).then(function(creator){
            console.log('business creator: ' + creator);
            assert.equal(creator,masterAddress,"Creator must be master account");
        });
    });

    // Assigned should be false until ownership has been set
    it("should set assigned to false initially", function(){
    return Business.at(business_contract_address1).then(function(instance){
            return instance.assigned();
        }).then(function(assigned){
            assert.equal(assigned,false,"before ownership is set, assigned must be false");
        });
    });

    // Correct event should be emitted when ownership set
    it("should emit ownershipSet event when ownership has been set", function() {
        return Business.at(business_contract_address1).then(function(instance) {
            return instance.setOwnership(business_address1, business_name1);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "ownershipSet", "event should be ownershipSet");
            assert.equal(receipt.logs[0].args._businessName, business_name1, "business in event must be " + business_name1);
            assert.equal(receipt.logs[0].args._businessAddress, business_address1, "business in event must be " + business_address1);
            assert.equal(receipt.logs[0].args._contractAddress, business_contract_address1, "contract address in event must be " + business_contract_address1);
        });
    });

    // Ownership should be set to business wallet
    it("should set owner to Business Address", function() {
        return Business.at(business_contract_address1).then(function(instance) {
            return instance.owner();       
        }).then(function(owner) {
            assert.equal(owner, business_address1, "The owner should be the business address");
        });
    });

    // Business name must be set correctly
    it("should store Business Name correctly", function() {
        return Business.at(business_contract_address1).then(function(instance) {
            return instance.businessName();       
        }).then(function(businessName) {
            assert.equal(businessName, business_name1, "The business name should be the business name");
        });
    });

    // Assigned should be set to true to ensure ownership is only assigned once
    it("should change assigned to true after ownership set", function() {
        return Business.at(business_contract_address1).then(function(instance) {
            return instance.assigned();       
        }).then(function(assigned) {
            assert.equal(assigned, true, "The assigned indicator should be true once ownership has been set");
        });
    }); 


    // Ownership can only be set once
    it("should only allow ownership to be set once", function(){
        return Business.at(business_contract_address1).then(function(instance){
                return instance.setOwnership(business_address1, business_name1);
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

contract('Business', function(accounts){

})