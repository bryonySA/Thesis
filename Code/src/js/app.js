var Web3 = require('web3');
var TruffleContract = require('truffle-contract');
var buffer = require('buffer/').Buffer;
var IPFS = require('ipfs-http-client');

App = {
     web3Provider: null,
     contracts: {},
     account: 0x0,
     loading: false,
     web3: null,
     //existingMasterContractAddress: 0x0,
     existingMasterContractAddress: '0xe6cd3a3ee9aefdb7dea9a2a0087ffbc3efb58536',
     //existingLookupContractAddress: 0x0,
     existingLookupContractAddress: '0x85ada02a4ff81691e39f5d77b926a81cc4d9a0af',
     masterAddress: 0x0,
     lookupAddress: 0x0,


     //NB: Make sure you've run npm install web3
     init: function () {
          return App.initWeb3();
     },

     initWeb3: function () {
          // initialize web3
          if (web3) {
               // reuse the provider of the web3 object injected by MetaMask
               App.web3Provider = web3.currentProvider;
               this.web3 = web3;
          } else {
               // either create a new provider, here connecting to Ganache
               App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')
               // instantiate a new web3 object
               this.web3 = new Web3(App.web3Provider);
               // or handle the case that the user does not have MetaMask by showing her a message asking her to install Metamask
          }
          return App.initContract();
     },

     initContract: function () {
          $.getJSON('Master.json', function (MasterArtifact) {

               // get the contract artifact file and use it to instantiate a truffle contract abstraction
               App.contracts.Master = TruffleContract(MasterArtifact);

               // set the provider for our contract
               App.contracts.Master.setProvider(App.web3Provider);

               //update account info
               App.displayAccountInfo();
          });

          $.getJSON('Business.json', function (BusinessArtifact) {
               App.contracts.Business = TruffleContract(BusinessArtifact);
               App.contracts.Business.setProvider(App.web3Provider);
          });

          $.getJSON('Lookup.json', function (LookupArtifact) {
               App.contracts.Lookup = TruffleContract(LookupArtifact);
               App.contracts.Lookup.setProvider(App.web3Provider);
          });
     },

     returnMaster: function () {
          // Check whether we are using a new or existing instance of master contract
          // This is dependent on whether the existing address declared at the beginning of this function is 0x0 or not
          if (App.existingMasterContractAddress == 0x0) {
               // get the most recently deployed instance of the master contract
               return App.contracts.Master.deployed();
          } else {
               // get the existing master contract from its address
               return App.contracts.Master.at(App.existingMasterContractAddress);
          };
     },

     returnLookup: function () {
          // Check whether we are using a new or existing instance of lookup contract
          // This is dependent on whether the existing address declared at the beginning of this function is 0x0 or not
          if (App.existingLookupContractAddress == 0x0) {
               // get the most recently deployed instance of the master contract
               return App.contracts.Lookup.deployed();
          } else {
               // get the existing master contract from its address
               return App.contracts.Lookup.at(App.existingLookupContractAddress);
          };
     },


     displayAccountInfo: function () {
          if (!this.web3) {
               this.initWeb3();
          }
          var web3 = this.web3;
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


     displayContractInfo: function () {
          App.returnMaster().then(async function (instance) {
               masterAddress = instance.address;
               $("#masterContract").text(masterAddress);
          });
          App.returnLookup().then(async function (instance) {
               lookupAddress = instance.address;
               $("#lookupContract").text(lookupAddress);
          });
     },


     addBusiness: function () {
          console.log('Add Business button clicked');
          // get information from the modal
          var _businessName = $('#BusinessName').val();
          var _businessWalletAddress = $('#BusinessWalletAddress').val();

          // if the name or valid address was not provided
          if ((_businessName.trim() == '') || (web3.isAddress(_businessWalletAddress) != true)) {
               // we cannot add a business
               console.log('Cannot load business because name or address is invalid')
               return false;
          };

          console.log('Adding business (' + _businessName + ') - Please check Metamask');
          App.returnMaster().then(function (instance) {
               // call the addBusiness function, 
               // passing the business name and the business wallet address
               return instance.addBusiness(_businessWalletAddress, _businessName, {
                    from: App.account,
                    gas: 5000000
               });
          }).then(function (receipt) {
               console.log(receipt.logs[0].args._businessName + ' added');
               businessContractAddress = receipt.logs[0].args._contractAddress;
               console.log('Business contract address: ' + businessContractAddress);
               return businessContractAddress;
          }).then(function (contractAddress) {
               App.setOwnership(contractAddress);
               return App.displayActiveBusinesses();
               // log the error if there is one
          }).catch(function (error) {
               console.log(error);
          });
     },

     //This displays business details in the console for testing purposes
     displayBusinessConsole: function (contractAddress) {
          var contractAddress = contractAddress || $('#BusinessContractAddress').val();
          return App.contracts.Business.at(contractAddress).then(function (instance) {
               console.log('displaying ' + contractAddress);
               console.log('business contract address: ' + instance.address);
               return instance.owner();
          }).then(function (owner) {
               console.log('business owner: ' + owner);
               return App.contracts.Business.at(contractAddress)
          }).then(function (instance) {
               return instance.creator();
          }).then(function (creator) {
               console.log('business creator: ' + creator);
          });
     },

     //This displays all business details linked to the master account if the master account is signed in
     displayActiveBusinesses: function () {
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

          // check if the account is the master wallet

          App.returnMaster().then(function (instance) {
               masterInstance = instance;
               return instance.owner();
          }).then(function (owner) {
               if (owner == App.account) {
                    console.log("Displaying active businesses");
                    masterInstance.getAllBusinesses().then(function (businessAddresses) {
                         console.log("Array length " + businessAddresses.length);
                         businessAddresses.forEach(businessWalletAddress => {
                              console.log(businessWalletAddress);
                              return masterInstance.getBusinessDetails(businessWalletAddress).then(function (businessDetails) {
                                   if (businessDetails[2] == true) {
                                        App.displayBusiness(
                                             businessDetails[1],
                                             businessWalletAddress,
                                             businessDetails[0]
                                        );
                                   }
                              });
                         });
                    });

                    App.loading = false;

               } else {
                    console.log("Only Master Account can display businesses not " + App.Account);
               }
          });



     },


     displayBusiness: function (name, address, contract) {
          var businessRow = $('#businessRow');
          var businessTemplate = $('#businessTemplate');
          businessTemplate.find('.business-name').text(name);
          businessTemplate.find('.business-wallet').text(address);
          businessTemplate.find('.business-contract').text(contract);

          //add this business to the placeholder
          businessRow.append(businessTemplate.html());

     },


     setOwnership: function (contractAddress) {
          var _businessName = $('#BusinessName').val();
          var _businessWalletAddress = $('#BusinessWalletAddress').val();

          return App.contracts.Business.at(contractAddress).then(function (instance) {
               console.log('Setting ownership - Please check Metamask');
               return instance.setOwnership(_businessWalletAddress, _businessName, {
                    from: App.account,
                    gas: 5000000
               });
          }).then(function (receipt) {
               if (receipt.logs[0].event == "ownershipSet") {
                    console.log('Business contract event' + receipt.logs[0].args._contractAddress);
                    console.log('Ownership Set event(' + receipt.logs[0].args._businessName + ')');
                    console.log('Business address event: ' + receipt.logs[0].args._businessWalletAddress);
                    $('#BusinessName').val('');
                    $('#BusinessWalletAddress').val('');
               } else {
                    console.log("Wrong event: " + receipt.logs[0].event);
               };
          }).catch(function (error) {
               console.log(error);
          });
     },


     addCustomer: function () {
          console.log('Add Customer button clicked');
          // get information from the modal
          var _customerName = $('#CustomerName').val();
          var _customerAddress = $('#CustomerAddress').val();
          var _businessContractAddress;

          // if the name or valid address was not provided
          if ((_customerName.trim() == '') || (web3.isAddress(_customerAddress) != true)) {
               // we cannot add a business
               console.log('Cannot load customer because name or address is invalid')
               return false;
          };

          //get business contract address from their wallet = App.account stored on the master contract
          App.returnMaster().then(function (masterInstance) {
               console.log(App.account);
               // Gets the name and contract address of the business linked to account (Contract, Name, Active)
               return masterInstance.getBusinessDetails(App.account);
          }).then(function (businessDetails) {
               if (businessDetails[2] != true) {
                    console.log('This is not an active business. Customer cannot be loaded')
               } else
                    _businessContractAddress = businessDetails[0];
               console.log(_businessContractAddress);
               // get the instance of the business contract
               return App.contracts.Business.at(_businessContractAddress);
          }).then(function (businessInstance) {
               console.log('Adding customer (' + _customerName + ') - Please check Metamask');
               // call the addCustomer function, 
               // passing the business name and the business wallet address
               return businessInstance.addCustomer(_customerAddress, _customerName, lookupAddress, masterAddress, {
                    from: App.account,
                    gas: 5000000
               });
          }).then(function (receipt) {
               console.log(receipt.logs[0].args._customerName + ' added');
               console.log(receipt.logs[0].args._customerAddress + ' added');
               console.log(receipt.logs[0].args._businessWalletAddress + ' added');
               App.displayActiveCustomers();
               // log the error if there is one
          }).catch(function (error) {
               console.log(error);
          });
     },

     //This displays customer details in the console for testing purposes
     displayCustomerConsole: function (customerAddress) {
          var customerAddress = customerAddress || $('#displayCustomerAddress').val();
          var businessInstance;

          App.returnMaster().then(function (instance) {
               console.log(App.account);
               return instance.getBusinessDetails(App.account);
          }).then(function (businessDetails) {
               businessContractAddress = businessDetails[0];
               console.log(businessContractAddress)
               return App.contracts.Business.at(businessContractAddress);
          }).then(function (instance) {
               businessInstance = instance;
               console.log('displaying ' + businessContractAddress);
               console.log('business contract address: ' + instance.address);
               return businessInstance.getCustomerDetails(customerAddress);
          }).then(function (customerDetails) {
               console.log('customer address', customerAddress);
               console.log('customer name', customerDetails[0]);
               console.log('customer balance', customerDetails[1]);
               console.log('customer active', customerDetails[2]);
          });
     },

     //This displays all customers linked to the business account if the master account is signed in
     displayActiveCustomers: function () {
          // avoid reentry
          if (App.loading) {
               return;
          };
          App.loading = true;

          // refresh account info
          App.displayAccountInfo();

          var customerRow = $('#customerRow');
          customerRow.empty();

          //define placeholder for contract
          var businessContractAddress;
          var businessInstance;

          // check if the account is the master wallet

          App.returnMaster().then(function (instance) {
               console.log(App.account);
               return instance.getBusinessDetails(App.account);
          }).then(function (businessDetails) {
               businessContractAddress = businessDetails[0];
               console.log(businessContractAddress)
               return App.contracts.Business.at(businessContractAddress);
          }).then(function (instance) {
               businessInstance = instance;
               console.log(businessInstance);
               return instance.getAllCustomers();
          }).then(function (customerAddresses) {
               console.log("Array length " + customerAddresses.length);
               customerAddresses.forEach(customerWalletAddress => {
                    console.log(customerWalletAddress);
                    return businessInstance.getCustomerDetails(customerWalletAddress).then(function (customerDetails) {
                         console.log(customerDetails);
                         if (customerDetails[2] == true) {
                              App.displayCustomer(
                                   customerDetails[0],
                                   customerWalletAddress,
                                   customerDetails[1]
                              );
                         };
                    });
               });
          });
     },


     displayCustomer: function (name, address, balance) {
          var customerRow = $('#customerRow');
          var customerTemplate = $('#customerTemplate');
          customerTemplate.find('.customer-name').text(name);
          customerTemplate.find('.customer-wallet').text(address);
          customerTemplate.find('.customer-balance').text(balance);

          //add this business to the placeholder
          customerRow.append(customerTemplate.html());

     },


     processDocument: function (ipfsHash, docType) {
          if (docType == "invoice") {
               var _amount = -1 * $('#invoiceAmount').val();
               var _customerAddress = $('#invoiceCustomerAddress').val();
               var _dueDate = $('#invoiceDueDate').val();
               console.log('Invoicing customer: ', ipfsHash);
          } else {
               var _amount = $('#receiptAmount').val();
               var _customerAddress = $('#receiptCustomerAddress').val();
               var _dueDate = $('#receiptDueDate').val();
               console.log('Receipting customer: ', ipfsHash);
          }

          if (web3.isAddress(_customerAddress) != true) {
               // we cannot add a business
               console.log('Cannot process document because address is invalid');
               return false;
          };

          //get business contract address from their wallet = App.account stored on the master contract
          App.returnMaster().then(function (masterInstance) {
               console.log(App.account);
               // Gets the name and contract address of the business linked to account (Contract, Name, Active)
               return masterInstance.getBusinessDetails(App.account);
          }).then(function (businessDetails) {
               if (businessDetails[2] != true) {
                    console.log('This is not an active business. Customer cannot be invoiced or receipted')
               } else
                    _businessContractAddress = businessDetails[0];
               console.log(_businessContractAddress);
               // get the instance of the business contract
               return App.contracts.Business.at(_businessContractAddress);
          }).then(function (businessInstance) {
               console.log('Processing document (' + _customerAddress + ') - Please check Metamask');
               // call the addCustomer function, 
               // passing the business name and the business wallet address
               return businessInstance.processDocument(_customerAddress, _amount, ipfsHash, _dueDate, {
                    from: App.account,
                    gas: 4612388
               });
          }).then(function (receipt) {
               console.log(receipt.logs[0].args._customerAddress + ' added');
               console.log("New Balance: " + receipt.logs[0].args._customerBalance);
               console.log("IPFS Hash: " + receipt.logs[0].args._ipfsHash);
               $('#invoiceAmount').val('');
               $('#invoiceCustomerAddress').val('');
               $('#receiptAmount').val('');
               $('#receiptCustomerAddress').val('');
               App.displayActiveCustomers();
               // log the error if there is one
          }).catch(function (error) {
               console.log(error);
          });
     },

     //This displays all customers linked to the business account if the master account is signed in
     displayDocuments: function (_customerAddress) {
          // avoid reentry
          if (App.loading) {
               return;
          };
          App.loading = true;

          // refresh account info
          App.displayAccountInfo();
          $("#customerScore").text("");
          $("#viewerCustomerId").text("Customer Score for " + _customerAddress);
          $("#viewerCustomerScore").text("");

          //define placeholder for contract
          var businessContractAddress;
          var total = 0;
          var masterInstance;
          var lookupInstance;
          var customerAddress = _customerAddress || App.account;
          var businessName;
          var documentRow = $('#documentRow');
          documentRow.empty();
          var viewerDocumentRow = $('#viewerDocumentRow');
          viewerDocumentRow.empty();

          App.returnLookup().then(function (instance) {
               lookupInstance = instance;
               return App.returnMaster();
          }).then(function (instance) {
               masterInstance = instance;
               count = 0;
               return lookupInstance.getCustomerBusinessList(customerAddress);
          }).then(function (businessList) {
               console.log("Business List length " + businessList.length);
               businessList.forEach(businessWalletAddress => {
                    console.log(businessWalletAddress);
                    masterInstance.getBusinessDetails(businessWalletAddress).then(function (businessDetails) {
                         businessContractAddress = businessDetails[0];
                         businessName = businessDetails[1];
                         console.log(businessName);
                         return App.generateDocumentsByBusiness(businessContractAddress, businessName, customerAddress).then(function(totalForBusiness){
                              if (totalForBusiness< 0) {
                              console.log("Total for "+businessName+": "+totalForBusiness)
                              total = total + totalForBusiness;
                              }
                         });
               });
          });
          console.log("Overall total " + total);
          $("#customerScore").text(total);
          $("#viewerCustomerScore").text(total);
     });
     },

     generateDocumentsByBusiness: function(_businessContractAddress, _businessName, _customerAddress){
          var businessInstance;
          var customerAddress = _customerAddress || App.account;
          var totalForBusiness = 0;
          var dueDate;
          var ipfsHash;
          var documentAmount;
          var documentType;

          return App.contracts.Business.at(_businessContractAddress).then(function (instance) {
          businessInstance = instance;
          console.log(_businessName);
          return businessInstance.getCustomerDetails(customerAddress);
     }).then(async function (customerDetails) {
          //Add the balance if the customer owes money
          if (customerDetails[1] <= 0) {
               let totalForBusiness = await totalForBusiness + customerDetails[1];
               console.log('Current total for business', totalForBusiness);
          }
          return businessInstance.getCustomerDocumentsLength(customerAddress);
     }).then(function (documentCount) {
          console.log("number of documents for " + _businessName +" "  + documentCount)
          for (let i = 0; i < documentCount; i++) {
               console.log("generating " + i)
               businessInstance.getCustomerDocument(customerAddress, i).then(function (document) {
                    ipfsHash = document[0];
                    documentAmount =  document[1];
                    dueDate =   document[2];
                    if (documentAmount < 0) {
                         documentType = "Invoice";
                    } else {
                         documentType = "Receipt";
                    }
                    console.log("displaying "+ _businessContractAddress + i);
                    if (customerAddress == App.account){
                         App.displayDocumentToCustomer(
                              dueDate,
                              _businessName,
                              documentAmount,
                              documentType,
                              ipfsHash
                         );
                    }else {
                         App.displayDocumentToViewer(
                              dueDate,
                              _businessName,
                              documentAmount,
                              documentType
                         );
                    }
               });
          };
          return totalForBusiness;
     });
     },


     displayDocumentToCustomer: function (date, businessName, documentAmount, documentType, ipfsHash) {
          var documentRow = $('#documentRow');
          var documentTemplate = $('#documentTemplate');
          console.log("displaying to customer portal");
          documentTemplate.find('.document-date').text(date);
          documentTemplate.find('.document-business').text(businessName);
          documentTemplate.find('.document-amount').text(documentAmount);
          documentTemplate.find('.document-type').text(documentType);
          documentTemplate.find('.document-ipfs').text(ipfsHash);

          //add this document to the placeholder
          documentRow.append(documentTemplate.html());
     },

     displayDocumentToViewer: function (date, businessName, documentAmount, documentType) {
          var viewerDocumentRow = $('#viewerDocumentRow');
          var viewerDocumentTemplate = $('#viewerDocumentTemplate');
          console.log("displaying to viewer portal");
          viewerDocumentTemplate.find('.viewer-document-date').text(date);
          viewerDocumentTemplate.find('.viewer-document-business').text(businessName);
          viewerDocumentTemplate.find('.viewer-document-amount').text(documentAmount);
          viewerDocumentTemplate.find('.viewer-document-type').text(documentType);

          //add this document to the placeholder
          viewerDocumentRow.append(viewerDocumentTemplate.html());
     },

     addPermission: function(){
          console.log('Add Permission button clicked');
          // get information from the modal
          var _permissionAddress = $('#permissionAddress').val();
          var _permissionValidity = $('#permissionValidity').val();

          var _permissionValidityConverted = new Date(_permissionValidity).getTime() / 1000;
          console.log(_permissionValidityConverted);
          console.log(Date.now());
          return App.returnLookup().then(function(lookupInstance){
               lookupInstance.addPermissionToCustomerList(_permissionAddress, _permissionValidityConverted, {
                    from: App.account,
                    gas: 5000000
               });
               console.log('Permission Added');
          });
     },

     viewDocumentsAsExternal: function(){
          var customerAddress = $('#viewerRequestedAddress').val();
          return App.returnLookup().then(function(lookupInstance){
               return lookupInstance.checkPermission(customerAddress, App.account);
          }).then(function(result){
               console.log(result);
               if(result == true){
                    App.displayDocuments(customerAddress);
                    console.log("Documents Displayed")
               } else {
                    console.log("You do not have permission to view these documents")
                    $("#viewerCustomerId").text("You do not have permission to view " + customerAddress);
               };
          });
     },

     uploadInvoice: function() {
        
          const reader = new FileReader();

          // Set up the on load end function
          reader.onloadend = function (r, ev) {
               const ipfs = new IPFS({host:'ipfs.infura.io', port: 5001, protocol: 'https' }); // Connect to IPFS
               const buf = buffer.from(reader.result); // Convert data into buffer
               ipfs.add(buf, (err, result) => { // Upload buffer to IPFS
                  if (err) {
                      console.error(err)
                      return
                  }
                  let url = `https://ipfs.io/ipfs/${result[0].hash}`
                  console.log(`Url --> ${url}`)
                  App.processDocument(result[0].hash, "invoice");
               })
          }

          // Find the file and run the file reader on it
          const invoice = document.getElementById("invoice");
          setTimeout(() => reader.readAsArrayBuffer(invoice.files[0]), 500); // Read Provided File
      },

     uploadReceipt: function() {
          const reader = new FileReader();

          // Set up the on load end function
          reader.onloadend = function (r, ev) {
              const ipfs = new IPFS({host:'ipfs.infura.io', port: 5001, protocol: 'https' }); // Connect to IPFS
              const buf = buffer.from(reader.result); // Convert data into buffer
              ipfs.add(buf, (err, result) => { // Upload buffer to IPFS
                  if (err) {
                      console.error(err)
                      return
                  }
                  let url = `https://ipfs.io/ipfs/${result[0].hash}`
                  console.log(`Url --> ${url}`)
                  App.processDocument(result[0].hash, "receipt");
              })
          }

          // Find the file and run the file reader on it
          const receipt = document.getElementById("receipt");
          setTimeout(() => reader.readAsArrayBuffer(receipt.files[0]), 500); // Read Provided File
      },

};

$(function () {
     $(window).load(function () {
          App.init();
     });
     // placeholder for current account 
     var _account;

     // set the interval
     var accountInterval = setInterval(function () {
          // check for new account information and display it
          App.displayAccountInfo();
          //console.log("loading")
          // only reload the contract info if account has changed
          if (_account != App.account) {
               App.displayContractInfo();
               // update the current account
               _account = App.account;
          }
     }, 10);
});
