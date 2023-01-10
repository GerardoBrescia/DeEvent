//Ottengo il ticket e l'evento
var Ticket = artifacts.require("Ticket.sol");
var Event = artifacts.require("Event.sol");

//Un contratto ha bisgono della reference dell'altro
module.exports = function(deployer) {
  // Faccio il deploy del contratto Ticket con un indirizzo provvisorio  
  deployer.deploy(Event)//.then(() => {
    //IL ticket evento lo dispiego con l'indirizzo giusto del contract Ticket
  //  return deployer.deploy(Ticket, Event.address)
  //});
};