var io = require('socket.io-client');
var client = io.connect('http://localhost:7621', {reconnect: true});

// Add a connect listener
client.on('connect', function (client) {
    console.log('Client Connected on port: 7621.\n');
});

//Authenticate
client.emit('AuthenticatePlayerOne', 'dannyboi', 'dre@margh_shelled');
client.emit('AuthenticatePlayerTwo', 'matty7', 'win&win99');

client.on('InvalidAuthentication', (data) => { 
    console.log(data); 
}); 

//Ready Game
client.on('ReadyGame', (data) => { 
    console.log(data);
});

client.on('StartGame', (data) => { 
    console.log(data);
}); 

//Play Game
client.on('PlayGame', (data) => { 
    console.log(data); 
}); 

client.on('PlayerChoice', (playerID, dealerChoice) => {
    console.log("DEALER'S choice is " + dealerChoice);

    var choices = [1, 2, 3];

    var spotterChoice = selectRandom(choices);
    console.log("SPOTTER'S choice is " + spotterChoice + '\n');

    //Player wins round
    if(spotterChoice == dealerChoice) {
        client.emit('DetermineRound', playerID, 'win');
    }

    else {
        client.emit('DetermineRound', playerID, 'lose');
    }
});

client.on('VictoryOrDefeat', (data) => {
    console.log(data); 
});

client.on('end', (data) => {
    console.log(data);
    client.disconnect(0);
});

//Randomly select an item from an array
function selectRandom(items) {
    var random = items[Math.floor(Math.random() * items.length)];
  
    return random;
}