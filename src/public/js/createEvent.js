let value;

App = {

    web3Provider: null,
    contracts: {},

    init: async () => {
        return await App.initWeb3();        
    },

    initWeb3: async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
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
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return await App.initContract();
    },

    initContract: async () => {
        await $.getJSON('../build/contracts/Event.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            const EventArtifact = data;
            App.contracts.Event = TruffleContract(EventArtifact);
          
            // Set the provider for our contract
            App.contracts.Event.setProvider(App.web3Provider);          
        });
        await $.getJSON('../build/contracts/Ticket.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            const TicketArtifact = data;
            App.contracts.Ticket = TruffleContract(TicketArtifact);
          
            // Set the provider for our contract
            App.contracts.Ticket.setProvider(App.web3Provider);          
        });
    },

    createEvent: async (name, tickets, ticketsInStock, ticketPrice, data) => {
        let eventInstance;

        await web3.eth.getAccounts(function(error, accounts) {
            
            if (error) {
                console.log(error);
            }

            const account = accounts[0];
            App.contracts.Event.deployed().then(function(instance) {
                eventInstance = instance;

                weiPrice = Web3.utils.toWei(String(ticketPrice) , 'ether');

                return eventInstance.createEvent(name, tickets, ticketsInStock, weiPrice, data, { from: account });
            }).then(function(result) {
                alert("Event created!!!!!!");
                console.log(result);
            }).catch(function(err) {
                alert("Error in the event" + err)
            });

        });

    }

}

$(function() {
    $(window).load(function() {
        App.init();
        $("#create_event").click(async () => {   

            const name = $("#event_name").val();
            const tickets = $("#tot_tickets").val();
            const ticketprice = $("#price_ticket").val();
            const data = $("#data").val();
            

            if (name == '' || tickets == '' || ticketprice == '' || data == '') {
                toastr.error("Error in input fields...");
            } else {
                await App.createEvent(name, tickets, tickets, ticketprice, data);
            }

        });
    });
});