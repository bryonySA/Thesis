
// Code to link to IPFS 
// Must run npm install --save ipfs-api first
//https://medium.com/@sebinatx/building-a-fully-decentralized-user-profile-dapp-on-ethereum-and-ipfs-e55afac35718
//https://www.npmjs.com/package/ipfs-api
//var ipfsAPI = require('ipfs-api')
//var ipfs = ipfsAPI({host:'localhost',port: '5001',protocol:'http'})

App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false,

     //NB: Make sure you've run npm install web3
     init: function() {
          //ipfs.id(function(err, res) {
          //     if (err) throw err
          //     console.log('Connected to IPFS node!', res.id, res.agentVersion, res.protocolVersion);
           //    });
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

          //$.getJSON('Lookup.json', function(LookupArtifact) {
            //   App.contracts.Lookup = TruffleContract(LookupArtifact);
            //   App.contracts.Lookup.setProvider(App.web3Provider);
           //});

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
          console.log('Add Business button clicked');
          // get information from the modal
          var _businessName = $('#BusinessName').val();
          var _businessAddress = $('#BusinessAddress').val();
          //var masterAddress;
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
                    //masterAddress = instance.address;
                    //console.log('Master contract ID: '+masterAddress);
                    console.log('Adding business (' + _businessName + ') - Please check Metamask');
                    return instance.addBusiness(_businessAddress, _businessName, {
                         from: App.account,
                         gas: 5000000
                    }); 
                    //console.log(instance.checkBusinessAddressExists());
          }).then(function (receipt) {
               console.log(receipt.logs[0].args._businessName + ' added');
               businessContractAddress = receipt.logs[0].args._contractAddress;
               console.log('Business contract address: ' + businessContractAddress);
               return businessContractAddress;
          }).then(function(contractAddress) {
                    App.setOwnership(contractAddress);
                    return contractAddress;
          // log the error if there is one
          }).catch(function (error) {
                    console.log(error);
          });
     },

     //This displays business details in the console for testing purposes
     displayBusinessConsole: function(contractAddress) {
          var contractAddress = contractAddress || $('#BusinessContractAddress').val();
          return App.contracts.Business.at(contractAddress).then(function(instance){
               console.log('displaying ' + contractAddress);
               console.log('business contract address: ' + instance.address);
               return instance.owner();
          }).then(function(owner){
               console.log('business owner: ' + owner) ;
               return App.contracts.Business.at(contractAddress)
          }).then(function(instance){
               return instance.creator();
          }).then(function(creator){
               console.log('business creator: ' + creator);
          });
     },

     //This displays all business details linked to the master account if the master account is signed in
     displayBusinesses: function(){
          // avoid reentry
          if (App.loading) {
               return;
          };
          App.loading = true;

          // refresh account info
          App.displayAccountInfo();
          
          var businessRow = $('#businessRow');
          businessRow.empty();
          //define placeholder for contract
          var masterInstance;
          var businessName;
          var businessContract;
          var businessAddress;
          // check if the account is the master wallet
          
          return App.contracts.Master.deployed().then(function(instance){
               masterInstance = instance;
               return instance.owner();
           }).then(function (owner) { 
               if (owner == App.account){
                    console.log("Displaying businesses");
                    // return masterInstance.getAllBusinesses().then(function(businessAddresses) {
                    masterInstance.getAllBusinesses().then(function(businessAddresses) {
                         //var businessRow = $('#businessRow');
                         //businessRow.empty();
                         console.log("Array length "+businessAddresses.length);
                         //fill template for each business
                         //for (let i = 0; i < businessAddresses.length; i++){
                         businessAddresses.forEach(businessAddress => {
                              //App.newFunc(i,businessAddresses, masterInstance);
                         
                              //console.log("start i = " + i);
                              //businessAddress = businessAddresses[i];
                              console.log(businessAddress);
                              /*businessName = masterInstance.getNameFromAddress(businessAddress);
                              businessContract = masterInstance.getContractFromAddress(businessAddress);
                              App.displayBusiness(
                                   businessName,
                                   businessAddress,
                                   businessContract
                              );*/
                              return masterInstance.getNameFromAddress(businessAddress).then(function (name) {
                                   businessName = name;
                                   console.log(businessName);
                                   return masterInstance.getContractFromAddress(businessAddress);
                              }).then(function (contract){
                                   businessContract = contract;
                                   console.log(businessContract);
                              }).then(function(){
                                   App.displayBusiness(
                                        businessName,
                                        businessAddress,
                                        businessContract
                                   );
                                   //console.log("i = "+i);
                              }); 
                         //});
                         //};
                         });
                    });

                    App.loading =false;

               } else {
                    console.log("Only Master Account", + owner +" can display businesses not " + App.Account);
               }
          });

          
     
     },

     /*newFunc: function(i, businessAddresses,masterInstance){
          console.log("start i = " + i);
          businessAddress = businessAddresses[i];
          console.log(businessAddress);
          masterInstance.getNameFromAddress(businessAddress).then(function (name) {
               businessName = name;
               console.log(businessName);
               return masterInstance.getContractFromAddress(businessAddress);
          }).then(function (contract){
               businessContract = contract;
               console.log(businessContract);
          }).then(function(){
               App.displayBusiness(
                    businessName,
                    businessAddress,
                    businessContract
               );
               console.log("i = "+i);
          }); 
     },*/

     displayBusiness: function(name, address, contract){
          var businessRow = $('#businessRow');
          var businessTemplate = $('#businessTemplate');
          businessTemplate.find('.panel-title').text(name);
          businessTemplate.find('.business-wallet').text(address);
          businessTemplate.find('.business-contract').text(contract);
          
          //add this business to the placeholder
          businessRow.append(businessTemplate.html());

     },


     setOwnership: function(contractAddress){
          var _businessName = $('#BusinessName').val();
          var _businessAddress = $('#BusinessAddress').val();
          
          return App.contracts.Business.at(contractAddress).then(function(instance){
               console.log('Setting ownership - Please check Metamask');
               return instance.setOwnership(_businessAddress, _businessName, {
                    from:App.account,
                    gas:5000000
               });
          }).then(function(receipt){
               if (receipt.logs[0].event == "ownershipSet") {  
                    console.log('Business contract event' + receipt.logs[0].args._contractAddress);
                    console.log('Ownership Set event(' + receipt.logs[0].args._businessName + ')');
                    console.log('Business address event: '+receipt.logs[0].args._businessAddress);    
                    $('#BusinessName').val('');
                    $('#BusinessAddress').val('');
               } else {
                    console.log("Wrong event: " + receipt.logs[0].event);
               };
          }).catch(function(error){
               console.log(error);
          });
     },
};

$(function() {
     $(window).load(function() {
          App.init();
     });
     // placeholder for current account 
     var _account;
     
     // set the interval
     var accountInterval = setInterval(function () {
     // check for new account information and display it
     App.displayAccountInfo();

     // check if current account is still the same, if not
     if (_account != App.account) {
               // load the new zombie list
               //App.reloadZombies();
               
               // update the current account
               _account = App.account;
     }
     }, 100);
});
