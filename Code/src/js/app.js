App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false,

     //NB: Make sure you've run npm install web3
     init: function() {
          return App.initWeb3();
     },

     initWeb3: function() {
          // initialize web3
          if(typeof web3 != undefined) {
               // reuse the provider of the web3 object injected by MetaMask
               App.web3Provider = web3.currentProvider;
          } else {
               // either create a new provider, here connecting to Ganache
               App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
               // instantiate a new web3 object
               web3 = new Web3(App.web3Provider);
               // or handle the case that the user does not have MetaMask by showing her a message asking her to install Metamask
          }
          return App.initContract();
     },

     initContract: function() {
          $.getJSON('Master.json', function(MasterArtifact){
               // get the contract artifact file and use it to instantiate a truffle contract abstraction
               App.contracts.Master = TruffleContract(MasterArtifact);
               // set the provider for our contract
               App.contracts.Master.setProvider(App.web3Provider);
               //update account info
               App.displayAccountInfo();
           });

          $.getJSON('Business.json', function(BusinessArtifact) {
               App.contracts.Business = TruffleContract(BusinessArtifact);
               App.contracts.Business.setProvider(App.web3Provider);
           });

           //$.getJSON('Customer.json', function(CustomerArtifact) {
             //  App.contracts.Customer = TruffleContract(CustomerArtifact);
              // App.contracts.Customer.setProvider(App.web3Provider);
          // });

     },

     displayAccountInfo: function () {
          // get current account information
          web3.eth.getCoinbase(function (err, account) {
               // if there is no error
               if (err === null) {
                    //set the App object's account variable
                    App.account = account;
                    // insert the account address in the p-tag with id='account'
                    $("#account").text(account);
                    // retrieve the balance corresponding to that account
                    web3.eth.getBalance(account, function (err, balance) {
                         // if there is no error
                         if (err === null) {
                              // insert the balance in the p-tag with id='accountBalance'
                              $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
                         }
                    });
               }
           });    
     },

    addBusiness: function () {
          console.log('button clicked');
          // get information from the modal
          var _businessName = $('#BusinessName').val();
          var _businessAddress = $('#BusinessAddress').val();
          // if the name was not provided
          if ((_businessName.trim() == '') || (web3.isAddress(_businessAddress)!= true)) {
                    // we cannot add a business
                    console.log('Cannot load business because name or address is invalid')
                    return false;
          };

          // get the instance of the master contract
          App.contracts.Master.deployed().then(function (instance) {
                    // call the addBusiness function, 
                    // passing the business name and the business wallet address
                    console.log('Adding business (' + _businessName + ')')
                    return instance.addBusiness(_businessAddress, _businessName, {
                         from: App.account,
                         gas: 5000000
                    });  
          }).then(function (receipt) {
               App.setOwnership();

          // log the error if there is one
          }).catch(function (error) {
                    console.log(error);
          });
     },
     /*addCustomer: function () {
          console.log('button clicked');
          // get information from the modal
          var _customerName = $('#CustomerName').val();
          var _customerAddress = $('#CustomerAddress').val();
          // if the name was not provided
          if ((_customerName.trim() == '') || (web3.isAddress(_customerAddress)!= true)) {
                    // we cannot add a customer
                    console.log('Cannot load customer');
                    return false;
          };

          // get the instance of the Customer contract
          App.contracts.Business.deployed().then(function (instance) {
                    // call the addCustomer function, 
                    // passing the custmer name and the customer wallet address
                    console.log('Adding customer (' + _customerName + ')');
                    console.log('Business contract is ' + instance.address);
                    console.log('Business owner is ' + instance.owner);
                    instance.addCustomer(_customerAddress, _customerName, {
                         from: App.account,
                         gas: 5000000
                    });  
          }).catch(function (error) {
                    console.log(error);
          });

     },*/

     setOwnership: function(){
          var _businessName = $('#BusinessName').val();
          var _businessAddress = $('#BusinessAddress').val();
          console.log("success");
          var masterInstance;
          App.contracts.Master.deployed().then(function(instance) {
               masterInstance = instance;
               console.log(masterInstance.address);
          }); 

          App.contracts.Business.deployed().then(function(instance) {
               console.log('Setting ownership');
               console.log(masterInstance.address);
               console.log(instance.assigned());

               ///////// FIX THIS
               //////Hard coded for now zzz

               instance.setOwnership(_businessAddress, _businessName, 0x3Da47F4DA0e1f26e634B5e21E97D235331B2eCf8, {
                    from:App.account,
                    gas:500000
               });
               console.log('Ownership Set (' + _businessName + ')');
               console.log(instance.address);
               $('#BusinessName').val('');
               $('#BusinessAddress').val('');
          }).catch(function(error){
               console.log(error);
          });
     },
};

$(function() {
     $(window).load(function() {
          App.init();
     });
});
