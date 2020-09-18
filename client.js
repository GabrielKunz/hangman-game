const io = require("socket.io-client");
const socket = io.connect("http://localhost:3000");

var game_title = "\n ===========================================================================================\n|    _________ __              ____  ____                                                   |\n|   |  _   _  [  |            |_   ||   _|                                                  |\n|   |_/ | | \\_|| |--.  .---.    | |__| |  ,--.  _ .--.   .--./) _ .--..--.  ,--.  _ .--.    |\n|       | |    | .-. |/ /__\\\\   |  __  | `'_\\ :[ `.-. | / /'`\\;[ `.-. .-. |`'_\\ :[ `.-. |   |\n|      _| |_   | | | || \\__.,  _| |  | |_// | |,| | | | \\ \\._// | | | | | |// | |,| | | |   |\n|     |_____| [___]|__]'.__.' |____||____\\'-;__[___||__].',__` [___||__||__]'-;__[___||__]  |\n|                                                      ( ( __))                             |\n|                                                                                           |\n ========================= A cooperative real-time terminal game ===========================\n"

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
 
console.log(game_title + "\nType a letter or word to start the game.\n")
var recursiveAsyncReadLine = function () {
  rl.question('', function (msg) {
    if (msg == 'exit'){
        console.log('Bye!')
        socket.disconnect();
        return rl.close();
    } //we need some base case, for recursion
       //closing RL and returning from function.
 
    socket.emit('chat message', msg)
    recursiveAsyncReadLine(); //Calling this function again to ask new question
  });
};
 
recursiveAsyncReadLine();

socket.on('chat message', function(msg,socket){
    console.log('\033[2J'); //remove this to keep messages on screen
    console.log(msg);
})