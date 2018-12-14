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
var masterContractAddress;
var business_name2 = "SpazaShop";
var business_address2;
var business_contract_address2;
var customer_name1 = "Claire";
var customer_address1;
var lookupContractAddress;
var emptyBusinessDetails;

//Master contract test
contract('Master', function(accounts) {
    
    // account variables
    business_address1 = accounts[1];
    invalid_business_address = accounts[9];
    business_address2 = accounts[2];
    master_account = accounts[0];

    // get details for other tests
    it("should allow me to store the masterContractAddress", function(){
    return Master.deployed().then(function(instance){
        masterContractAddress = instance.address;
        return instance.getBusinessDetails(business_address1).then(function(emptyDetails){
            emptyBusinessDetails = emptyDetails;
        });
    });
    });

    it("should allow me to store the lookupContractAddress", function(){
        return Lookup.deployed().then(function(instance){
            lookupContractAddress = instance.address;
            console.log(lookupContractAddress);
        });
        });


    //actual tests

    //Check owner of master is set to account[0]
    it("should make account[0] the owner of Master account", function(){
        return Master.deployed().then(function(instance){
            return instance.owner();
        }).then(function(owner){
            assert.equal(owner, master_account,"owner on Master contract wasn't properly set");
        });
    });    

    // Check that account[1] cannot add a business
    // https://ethereum.stackexchange.com/questions/9103/how-can-you-handle-an-expected-throw-in-a-contract-test-using-truffle-and-ethere
    it("should only let master account add a business", function(){
        return Master.deployed().then(function(instance){
                return instance.addBusiness(invalid_business_address, invalid_business_name,{'from' : business_address1});
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
            assert.equal(receipt.logs[0].args._businessWalletAddress, business_address1, "business in event must be " + business_address1);
            business_contract_address1 = receipt.logs[0].args._contractAddress;
        });
    });

    //Should allow second business to be added if wallet address is different
    it("should add a second business and emit businessAdded event if address is different", function() {
        return Master.deployed().then(function(instance) {
            return instance.addBusiness(business_address2, business_name2);         
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "businessAdded", "event should be businessAdded");
            assert.equal(receipt.logs[0].args._businessName, business_name2, "business in event must be " + business_name2);
            assert.equal(receipt.logs[0].args._businessWalletAddress, business_address2, "business in event must be " + business_address2);
            business_contract_address2 = receipt.logs[0].args._contractAddress;
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

    //Should add both businesses to allBusinesses
    it("should add both businesses to allBusinesses array", function() {
        return Master.deployed().then(function(instance) {
            return instance.getAllBusinesses();         
        }).then(function(result){
            assert.equal(result[0],business_address1,"First business should be added to allBusinesses array");
            assert.equal(result[1],business_address2,"Second business should be added to allBusinesses array");
        });
    });

    //Should update the business details
    it("should update the business address to contract mapping", function() {
        return Master.deployed().then(function(instance) {
            return instance.getBusinessDetails(business_address1);         
        }).then(function(result){
            assert.equal(result[0],business_contract_address1,"Address to contract mapping incorrect");
            assert.equal(result[1],business_name1,"Address to name mapping incorrect");
            assert.equal(result[2],true,"Address to active indicator mapping incorrect");
        });
    });

    //Creator must be master wallet
    it("should update creator to master wallet", function(){
    return Business.at(business_contract_address1).then(function(instance){
            return instance.creator();
        }).then(function(creator){
            console.log('business creator: ' + creator);
            assert.equal(creator,masterContractAddress,"Creator must be master account");
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

    // Correct event should be emitted when ownership set for each business
    it("should emit ownershipSet event when ownership has been set for business1", function() {
        return Business.at(business_contract_address1).then(function(instance) {
            return instance.setOwnership(business_address1, business_name1);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "ownershipSet", "event should be ownershipSet");
            assert.equal(receipt.logs[0].args._businessName, business_name1, "business in event must be " + business_name1);
            assert.equal(receipt.logs[0].args._businessWalletAddress, business_address1, "business in event must be " + business_address1);
            assert.equal(receipt.logs[0].args._contractAddress, business_contract_address1, "contract address in event must be " + business_contract_address1);
        });
    });
    it("should emit ownershipSet event when ownership has been set for business2", function() {
        return Business.at(business_contract_address2).then(function(instance) {
            return instance.setOwnership(business_address2, business_name2);
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "ownershipSet", "event should be ownershipSet");
            assert.equal(receipt.logs[0].args._businessName, business_name2, "business in event must be " + business_name2);
            assert.equal(receipt.logs[0].args._businessWalletAddress, business_address2, "business in event must be " + business_address2);
            assert.equal(receipt.logs[0].args._contractAddress, business_contract_address2, "contract address in event must be " + business_contract_address2);
        });
    });

    // Ownership should be set to business wallet for business1
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

//});

//contract('Business', function(accounts){
    //business_address1 = accounts[1];
    //business_address2 = accounts[2];
    customer_address1 = accounts[3];
    //opening_balance1 = 60;

    // Only the business owner can add a client to the list
    it("should not allow any account other than business owner to add customer to business list", function(){
        return Business.at(business_contract_address1).then(function(instance){
                return instance.addCustomer(customer_address1, customer_name1, lookupContractAddress, masterContractAddress, {'from' : business_address2});
        }).then(assert.fail)
        .catch(function(error){
            assert.include(
                error.message,
                "Only the business owner can add customers",
                "Error should be thrown when account[2] creates contract for business1");
            });
    });

    // Customer should not exist on lookup contract so business list should be empty
    it("should not have added any businesses to the customers list", function(){
        return Lookup.deployed().then(function(instance){
                return instance.getCustomerBusinessList(customer_address1);
        }).then(function(businessList) {
            assert.equal(businessList.length, 0, "an empty array should be returned");
        });
    });

    // Business owner can add a client to the list
    it("should allow business owner to add customer to business list", function(){
        return Business.at(business_contract_address1).then(function(instance){
                return instance.addCustomer(customer_address1, customer_name1, lookupContractAddress, masterContractAddress, {'from' : business_address1});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "customerAdded", "event should be customerAdded");
            assert.equal(receipt.logs[0].args._customerName, customer_name1, "customer name in event must be " + customer_name1);
            assert.equal(receipt.logs[0].args._customerAddress, customer_address1, "custmer address in event must be " + customer_address1);
        });
    });

    // Customer should appear on allCustomers list for business1
    it("should add customer to business1's list of customers", function(){
        return Business.at(business_contract_address1).then(function(instance){
                return instance.getAllCustomers().then(function(customers) {
                    assert.equal(customers.length, 1, "allCustomers array should have 1 element");
                    assert.equal(customers[0], customer_address1, "customer address should be on list");
        });
    });
    });

    // Business2's customer list should be empty
    it("should not return any customers for business2 yet", function(){
        return Business.at(business_contract_address2).then(function(instance){
            return instance.getAllCustomers().then(function(customers) {
                assert.equal(customers.length, 0, "allCustomers array should be empty for business2");
            });
    });
    });
    
    // Customer can only be added to the same business list once
    it("should only allow customer to be added to business list once", function(){
        return Business.at(business_contract_address1).then(function(instance){
                return instance.addCustomer(customer_address1, customer_name1, lookupContractAddress, masterContractAddress, {'from' : business_address1});
            }).then(assert.fail)
            .catch(function(error){
                assert.include(
                    error.message,
                    "This customer is already active. Please use amend function",
                    "Error should be thrown if customer is already active on the business list or has a non-zero balance");
                });
    });

    // Customer should exist on lookup contract and list should have business1 on it
    it("should include business1 on the customers list", function(){
        return Lookup.deployed().then(function(instance){
                return instance.getCustomerBusinessList(customer_address1);
        }).then(function(businessList) {
            assert.equal(businessList.length, 1, "only one business should be returned");
            assert.equal(businessList[0], business_address1, "only one business should be returned");
        });
    });

    // Customer can be added to a second business list
    it("should allow for a customer to be added to a different business list", function(){
        return Business.at(business_contract_address2).then(function(instance){
                return instance.addCustomer(customer_address1, customer_name1, lookupContractAddress, masterContractAddress, {'from' : business_address2});
            }).then(function(receipt) {
                assert.equal(receipt.logs.length, 1, "an event should have been triggered");
                assert.equal(receipt.logs[0].event, "customerAdded", "event should be customerAdded");
                assert.equal(receipt.logs[0].args._customerName, customer_name1, "customer name in event must be " + customer_name1);
                assert.equal(receipt.logs[0].args._customerAddress, customer_address1, "custmer address in event must be " + customer_address1);
            });
    });


    // Customer should exist on lookup contract and list should have business1 and business2 on it
    it("should include business1 and business2 on the customers list", function(){
        return Lookup.deployed().then(function(instance){
                return instance.getCustomerBusinessList(customer_address1);
        }).then(function(businessList) {
            assert.equal(businessList.length, 2, "only one business should be returned");
            assert.equal(businessList[0], business_address1, "only one business should be returned");
            assert.equal(businessList[1], business_address2, "only one business should be returned");
        });
    });

    //Business can be deactivated

    //Inactive business can't add customer

    // Get Customer Details works
    it("should return customer details", function(){
        return  Business.at(business_contract_address2).then(function(instance){
            return instance.getCustomerDetails(customer_address1);
        }).then(function(details) {
            console.log(details);
            console.log(details[1].toNumber());
            assert.equal(details[0], customer_name1, "customer name should be stored");
            assert.equal(details[1], 0, "customer balance should be stored");
            assert.equal(details[2], true, "customer active should be stored");
        });
    });


})