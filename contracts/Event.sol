// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Ticket.sol";

contract Event is Ownable{

using Counters for Counters.Counter;

struct EventInfo{

    //id dell'evento
    uint256 eventId;
    //nome dell'evento 
    string name;
    //numero di ticket totali per l'evento
    uint256 tickets;
    //numero di ticket rimanenti
    uint256 ticketInStock;
    //prezzo dell'evento in wei
    uint256 ticketPrice;
    //data in cui si svolgerà l'evento
    string date;
    // booleano che definisce se è possibile acquistare un biglietto
    bool purchasable;
    
}

Counters.Counter private eventIds;
Counters.Counter private purchasableEvents;
mapping (uint256 => EventInfo) events;

Ticket public ticketContract;
address public ticketAddress;

constructor (){
    ticketContract = new Ticket(address(this));
    ticketAddress = address(ticketContract);
}

//Metodo che permette la creazione di un evento
function createEvent (
    string memory name, 
    uint256 tickets, 
    uint256 ticketInStock, 
    uint256 ticketPrice,
    string memory date
) external onlyOwner returns (uint256){

    uint256 newEventId = eventIds.current(); 
    events[newEventId] = EventInfo(newEventId, name, tickets, ticketInStock , ticketPrice, date, true);
    eventIds.increment(); 
    purchasableEvents.increment();  
    return newEventId;

}

//Metodo per l'acquisto di un biglietto

function purchaseTicket(uint256 eventId) external payable returns (uint256){

    //L'evento deve esistere (Controllare che sia acquistabile)
    require(events[eventId].purchasable == true, "Tickets not purchasable");

    //Devono esserci dei bigietit disponibili
    require(events[eventId].ticketInStock > 0, "Tickets Sold Out!");

    //Chi vuole acquistare deve aver inviato abbastanza denaro
    require(msg.value == events[eventId].ticketPrice, "You haven't sent enough money");

    //Prendo il contratto del ticket 
    uint256 ticketId = ticketContract.buy(msg.sender, eventId);

    events[eventId].ticketInStock--;

    if(events[eventId].ticketInStock == 0){
        events[eventId].purchasable = false;
        purchasableEvents.decrement();
    }
    

    return ticketId;
}

function getAvailableEvents() public view returns (EventInfo[] memory){

    uint numberOfEvents = purchasableEvents.current();
    
    EventInfo[] memory toReturnEvents = new EventInfo[](numberOfEvents);
    for(uint i = 0; i < numberOfEvents; i++) {
        if(events[i].purchasable){
            toReturnEvents[i] = events[i];
        }
    }
    return toReturnEvents;

}

function getAnEventById(uint eventId) public view returns (EventInfo memory){

    return events[eventId];

}

function transfer() public onlyOwner{

    address payable addressToTransfer;
    addressToTransfer = payable(owner());
    addressToTransfer.transfer(address(this).balance);
    
}



}