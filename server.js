var app = require('express')();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var clientID = '';
var playerOneAuthenticated = false;
var playerTwoAuthenticated = false;
var playerOneID = '';
var playerTwoID = '';

io.on('connection', function (socket) {
  clientID = socket.id;

  //Authenticate player one
  if(!playerOneAuthenticated) {
    socket.on('AuthenticatePlayerOne', function (username, password) {  
      if(username == 'dannyboi' && password == 'dre@margh_shelled') {
        console.log('Player 1 connected. Client ID: ' + clientID);

        playerOneID = clientID;
        playerOneAuthenticated = true;

        //socket.emit('ReadyGame', clientID, 'Player 1 connected. Client ID: ' + clientID);
        //startGame(socket, playerOneID, playerTwoID);
      }
  
      else {
        socket.emit('InvalidAuthentication', 'Invalid username or password.\n');
      }
    });
  }
  
  //Authenticate player two
  else if(playerOneAuthenticated) {
    socket.on('AuthenticatePlayerTwo', function (username, password) {
      //Authenticate player two, check first if player one is already conntected
      if(username == 'matty7' && password == 'win&win99') {
        console.log('Player 2 connected. Client ID: ' + clientID);
        
        playerTwoID = clientID;
        playerTwoAuthenticated = true;

        socket.emit('StartGame', 'Find the Queen game has started.\n');
        socket.broadcast.emit('StartGame', 'Find the Queen game has started.\n');

        //Start game
        startGame(socket, playerOneID, playerTwoID);
      }

      else {
        socket.emit('InvalidAuthentication', 'Invalid username or password.\n');
      }
    });
  }
});

server.listen(7621, function () {
  console.log('Server connected on port: 7621.\n');
});

//Game logic
function startGame(socket, playerOneID, playerTwoID) {
  if(playerOneID != '' && playerTwoID != '') {

    rounds = 5;
    playerOneRole = '';
    playerTwoRole = '';
    choices = [1, 2, 3];
    playerOneWins = 0;
    playerTwoWins = 0;
    victoryMsg = 'Victory';
    defeatMsg = 'Defeat';

    //Assign players to an array
    players = [playerOneID, playerTwoID];
    console.log('Player IDs: ' + players + '\n');

    //Game should last 5 rounds
    for(var i = 0; i < rounds; i++) {
      //Randomly assign players to be either dealer or spotter
      //The first player picked will be the dealer and the latter the spotter
      if(selectRandom(players) == playerOneID) {
        socket.emit('PlayGame', 'Player 1 is DEALER and Player 2 is SPOTTER.');
        socket.broadcast.emit('PlayGame', 'Player 1 is DEALER and Player 2 is SPOTTER.');
        playerOneRole = 'DEALER';
        playerTwoRole = 'SPOTTER';

        var playerOneChoice = selectRandom(choices);
        socket.emit('PlayerChoice', playerOneID, playerOneChoice);

        //Switch roles
        if(playerOneRole == 'DEALER') {
          playerOneRole = 'SPOTTER';
          playerTwoRole = 'DEALER';
        }
      }

      //Player two is the dealer
      else {
        socket.emit('PlayGame', 'Player 2 is DEALER and Player 1 is SPOTTER.');
        socket.broadcast.emit('PlayGame', 'Player 2 is DEALER and Player 1 is SPOTTER.');
        playerOneRole = 'SPOTTER';
        playerTwoRole = 'DEALER';

        var playerTwoChoice = selectRandom(choices);
        socket.emit('PlayerChoice', playerTwoID, playerTwoChoice);

        //Switch roles
        if(playerTwoRole == 'DEALER') {
          playerOneRole = 'DEALER';
          playerTwoRole = 'SPOTTER';
        }
      }

      //Listen for win/loss
      socket.on('DetermineRound', function (playerID, result) {
        //Player one wins
        if(playerID == players[0] && result == 'win') {
          playerOneWins++;

          console.log('Player 1: ' + victoryMsg);
          socket.broadcast.emit('VictoryOrDefeat', 'Player 1: ' + victoryMsg);
          socket.emit('VictoryOrDefeat', 'Player 1: ' + victoryMsg);
        }

        //Player one loses
        else if(playerID == players[0] && result == 'lose') {
          console.log('Player 1: ' + defeatMsg);
          socket.broadcast.emit('VictoryOrDefeat', 'Player 1: ' + defeatMsg);
          socket.emit('VictoryOrDefeat', 'Player 1: ' + defeatMsg);
        }

        //Player two wins
        if(playerID == players[1] && result == 'win') {
          playerTwoWins++;

          console.log('Player 2: ' + victoryMsg);
          socket.broadcast.emit('VictoryOrDefeat', 'Player 2: ' + victoryMsg);
          socket.emit('VictoryOrDefeat', 'Player 2: ' + victoryMsg);
        }

        //Player two loses
        else if(playerID == players[1] && result == 'lose') {
          console.log('Player 2: ' + defeatMsg);
          socket.broadcast.emit('VictoryOrDefeat', 'Player 2: ' + defeatMsg);
          socket.emit('VictoryOrDefeat', 'Player 2: ' + defeatMsg);
        };
      });
    }
  }

  //Disconnect
  socket.broadcast.emit('end', 'Thanks for playing.\n');
  socket.emit('end', 'Thanks for playing.\n');
}

//Randomly select an item from an array
function selectRandom(items) {
  var random = items[Math.floor(Math.random() * items.length)];

  return random;
}
