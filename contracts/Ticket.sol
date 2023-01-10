// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Ticket is ERC721 {

using Counters for Counters.Counter;

//Indirizzo del contratto Event
address public eventAddress;
//Variabile che permette di gestire gli id dei ticket
Counters.Counter private ticketIds;
//per tenere traccia di tutte le info relative ai ticket
mapping (uint256 => TicketInfo) tickets;
//mapping di tutti i token posseduti da un indirizzo
mapping (address => uint256[]) ownedTickets;

constructor(address _eventAddress) ERC721("Ticket" , "TCK"){
    eventAddress = _eventAddress;
} 

struct TicketInfo {
    //Identifiativo del ticket
    uint ticketId;
    //Identificativo dell'evento al quale è associato il ticket
    uint256 eventId;
    //variabile che indica se il biglietto è stato utilizzato o no
    bool used;
}

modifier onlyEventContract() {
    require(msg.sender == eventAddress, "Caller must be Event contract");
    _;
}

//funzione per acquistare un ticket
function buy(address buyer, uint256 eventId) external onlyEventContract returns (uint256) {
    
    uint256 newTicketId = ticketIds.current();

    //Il mint può fallire, quindi meglio fare prima il mint
    _mint(buyer, newTicketId);
    
    //Incremento l'id del biglietto 
    ticketIds.increment();
    //lo inserisco all'interno della lista che mi servirà per tenere traccia 
    tickets[newTicketId] = TicketInfo(newTicketId ,eventId, false);

    //Lo inserisco tra quelli posseduti da un indirizzo
    ownedTickets[buyer].push(newTicketId);

    return newTicketId;

}

function getAllMyTickets() public view returns (TicketInfo[] memory){

    uint256[] memory allTicketsId;

    allTicketsId = ownedTickets[msg.sender];

    TicketInfo[] memory toReturnTickets = new TicketInfo[](allTicketsId.length);

    for(uint i = 0; i < allTicketsId.length; i++) {
        toReturnTickets[i]  = tickets[allTicketsId[i]];
    }

    return toReturnTickets;

}

}
