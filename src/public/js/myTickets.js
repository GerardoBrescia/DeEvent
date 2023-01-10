
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

            App.data = data;
                  
        });


        return await App.ownedTickets();

    },

    ownedTickets: async () => {

        let event;
        let eventContract;

        //App.contracts.Ticket.methods.getAllMyTickets().call();

        App.contracts.Event.deployed().then(function(eventInstance) {

            eventContract = eventInstance

            return eventInstance.ticketAddress.call();

        }).then(async function(address, eventInstance) {

                const accounts = await web3.eth.getAccounts();

                const account = accounts[0];

                console.log(account);

                App.contracts.Ticket = new web3.eth.Contract(App.data.abi, address);

                tickets = await App.contracts.Ticket.methods.getAllMyTickets().call({from : account});

                
                for(i=0 ; i< tickets.length ; i++){
                
                    event = await eventContract.getAnEventById.call(tickets[i].eventId);

                    var item = createTicketItem(tickets[i].ticketId , tickets[i].eventId, event.name, event.date);
                    
                    $(".container").append(item);      
                }

                console.log(tickets);

            }).catch(function(err) {
                alert("Error in the event" + err)
            }); 
      
    },

}

const createTicketItem = (ticketId , eventId, eventName, date) => {

    const item = ` <div class="cardticket">
    <div class="card__body">

      <div id="qrcode${ticketId}"></div>
      <script type="text/javascript">
        new QRCode(document.getElementById("qrcode${ticketId}"),
                {
                    text : "${eventId}/${ticketId}", 
                    width : 120,
                    height: 120,
                }
            );
      </script>
      <b> <h3 style="color:red">${eventName}</h3> </b>
      <h3>Ticket ID: ${ticketId} </h3>
      
    </div>
    
    <div class="card__footer">
      <div class="user">
        <div class="user__info">
          <small><b>Date: ${date}</b></small>
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

