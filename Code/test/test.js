var Business = artifacts.require("./Business.sol");
var Master = artifacts.require("./Master.sol");

// accounts[0] is our Master Account
//Master contract test
contract('Master', function(accounts) {
    //test Variables
    var business_name = "Lumkani";
    var business_address = accounts[1];
    //actual tests
    //Check business is added
    it("Should add a business", function() {
        return Master.deployed().then(function(instance) {
            MasterInstance = instance;
            console.log(MasterInstance.contractName);
            return MasterInstance.addBusiness(business_address, business_name);          
        }).then(function(receipt) {
            //console.log(instance.contractName);
            console.log(MasterInstance.contractName);
            console.log(receipt.logs[0].args._contractAddress);
            // check event
            BusinessInstance = receipt;
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "businessAdded", "event should be businessAdded");
            assert.equal(receipt.logs[0].args._businessName, business_name, "business in event must be " + business_name);
            //assert.equal(MasterInstance.allBusinesses[0], business_name, "business name must be in allBusinesses");
            
            return MasterInstance.checkBusinessExists(business_name);
        }).then(function(result) {
            assert.equal(result, true, "added business " + business_name + " must exist in mapping inside checkBusiness function");
        });
            
            // check if business exists
            //return MasterInstance.checkBusinessExists(business_name);
        //}).then(function(result) {
        //    assert.equal(result, true, "added business " + business_name + " must exist in mapping inside checkBusiness function");
        //});
    });


});

/*
mapping(address => address) businessAddressToContract;      //Maps the business wallet to the deployed contract
    mapping(string => address) businessNameToAddress;          //Maps the business name to its wallet address
    mapping(string => bool) businessExists;


//Business contract test
contract('Business', function(accounts) {
    //test Variables
    var business_name = "Lumkani";
    //var employeeWallet = accounts[2];
    //var InvestorWallet = accounts[3];
    var business_address = accounts[1];
    //var allowedTokens = 100;
    //var changeTokens = 150;
    //var employeeId = 1;
    //var ethAmount = 12;
    //var rateToPay = 20;
    //var rateToReceive = 20;
    
    //actual tests
    it("Should set ownership of contract to business address", function() {
        return Business.deployed().then(function(instance) {
            BusinessInstance = instance;
            BusinessInstance.setOwnership(business_address, business_name); //without this test will not work, onlyBusiness modifier requires it

            /*return CompanyInstance.addEmployee(allowedTokens, employeeWallet, { //must be triggered from company address or master address
                from: company_address
            });
        }).then(function(receipt) {
            //check event
            //console.log(receipt.logs[0]);
            assert.equal(receipt.logs.length, 1, "an event should have been triggered");
            assert.equal(receipt.logs[0].event, "employeeAdded", "event should be employeeAdded");
            assert.equal(receipt.logs[0].args.employeeWallet, employeeWallet, "employee Wallet in event must be " + employeeWallet);
            assert.equal(receipt.logs[0].args._employeeCounter.toNumber(), 1, "there show be 1 employee");

            //check check if employee exists
            return CompanyInstance.checkEmployee(employeeWallet);
        }).then(function(result) {
            assert.equal(result, true, "added employee wallet " + employeeWallet + " must exist in mapping inside checkEmployee function");
        });
    });
}); */