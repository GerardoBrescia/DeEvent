    AppHeader = {
    
        web3Provider: null,
        contracts: {},
    
        init: async () => {
            return await AppHeader.initWeb3();        
        },
    
        initWeb3: async () => {
            // Modern dapp browsers...
            if (window.ethereum) {
                AppHeader.web3Provider = window.ethereum;
                try {
                // Request account access
                await window.ethereum.request({ method: "eth_requestAccounts" });;
                } catch (error) {
                // User denied account access...
                console.error("User denied account access")
                }
            }
            // Legacy dapp browsers...
            else if (window.web3) {
                AppHeader.web3Provider = window.web3.currentProvider;
            }
            // If no injected web3 instance is detected, fall back to Ganache
            else {
                AppHeader.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            }
            web3 = new Web3(AppHeader.web3Provider);
    
            return await AppHeader.initContract();
        },
    
        initContract: async () => {
            await $.getJSON('../build/contracts/Event.json', function(data) {
                // Get the necessary contract artifact file and instantiate it with @truffle/contract
                const EventArtifact = data;
                AppHeader.contracts.Event = TruffleContract(EventArtifact);
              
                // Set the provider for our contract
                AppHeader.contracts.Event.setProvider(AppHeader.web3Provider);          
            });

            return AppHeader.verifyAdmin();
        },
    
        verifyAdmin: async () => {
            let eventInstance;
    
            await web3.eth.getAccounts(function(error, accounts) {
                
                if (error) {
                    console.log(error);
                }
    
                const account = accounts[0];
                AppHeader.contracts.Event.deployed().then(function(instance) {
                    eventInstance = instance;
    
                    return eventInstance.owner.call();

                }).then(function(owner) {

                    if(owner != account)
                    $(".create_hiding").hide();
                    else
                    $(".create_hiding").show();

                }).catch(function(err) {
                    alert("Error in the event" + err)
                });
    
            });
    
        }
    
    }

$(function() {
    $(window).load(function() {
        AppHeader.init();
    });
});
    
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    //document.getElementById("header").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    //document.getElementById("header").style.marginLeft= "0";
};