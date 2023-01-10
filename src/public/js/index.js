
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
        return await App.createdEvent();

    },

    createdEvent: async () => {
        let eventInstance;

            App.contracts.Event.deployed().then(function(instance) {
                eventInstance = instance;

            return eventInstance.getAvailableEvents.call();

            }).then(function(result) {
                console.log("--" + result)

                for(i=0 ; i< result.length ; i++){
                    console.log(result[i].name)
                    var item = createdEventItem(result[i].eventId,
                                        result[i].date, 
                                        result[i].name, 
                                        result[i].ticketInStock, 
                                        result[i].ticketPrice,
                                        result[i].tickets
                                        );
                    console.log(item);
                    
                    $(".container").append(item);       
                }
            }).catch(function(err) {
                alert("Error in the event" + err)
            });
    },

    purchaseTicket : async (eventID, price) => {

        await web3.eth.getAccounts(function(error, accounts) {
            
            if (error) {
                console.log(error);
            }

            const account = accounts[0];
            var weiPrice;

            App.contracts.Event.deployed().then(function(instance) {

                eventInstance = instance;

                return eventInstance.purchaseTicket(eventID, { from: account, value: price});
            }).then(function(result) {
                alert("Ticket purchased!!!!!!");
                window.location.href = "./";
                console.log(result);
            }).catch(function(err) {
                alert("Ticket not purchased");
            });

        });

    },

    


}

const createdEventItem = (eventid ,date, name, ticketInStock, ticketPrice, tickets) => {

    const priceInEther = Web3.utils.fromWei(ticketPrice, 'ether');

    const item = ` <div class="card">
    <div class="card__body">
      <img src="./images/logo.png" style="height: 70px; width : 70px ;">
      <b> <h1 style="color:red">${name}</h1> </b>
      <h3>Address</h3>
      <h3>Date: ${date} </h3>
      <h3>${priceInEther} ETH</h3>
    </div>
    
    <div class="card__footer">
      <div class="user">
      <input type="button" name="purchase-button" id="button-${eventid}" onclick="App.purchaseTicket(${eventid},${ticketPrice})"class="tag tag-red" value="Buy Ticket">
        <div class="user__info">
          <h5><b>Remaining Tickets: ${ticketInStock}</b></h5>
          <small><b>Total Tickets: ${tickets}</b></small>
        </div>
      </div>
    </div>
  </div>`

  return item;

}

$(function() {
    $(window).load(function() {
        App.init();

    });
});

