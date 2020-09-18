const io = require('socket.io');
const server = io.listen(3000);
//Array to store sockets ids
var socketsCreated = [];

//Hangman Screen & Game Play
var game_title = "\n ===========================================================================================\n|    _________ __              ____  ____                                                   |\n|   |  _   _  [  |            |_   ||   _|                                                  |\n|   |_/ | | \\_|| |--.  .---.    | |__| |  ,--.  _ .--.   .--./) _ .--..--.  ,--.  _ .--.    |\n|       | |    | .-. |/ /__\\\\   |  __  | `'_\\ :[ `.-. | / /'`\\;[ `.-. .-. |`'_\\ :[ `.-. |   |\n|      _| |_   | | | || \\__.,  _| |  | |_// | |,| | | | \\ \\._// | | | | | |// | |,| | | |   |\n|     |_____| [___]|__]'.__.' |____||____\\'-;__[___||__].',__` [___||__||__]'-;__[___||__]  |\n|                                                      ( ( __))                             |\n|                                                                                           |\n ========================= A cooperative real-time terminal game ===========================\n"
var possible_words = ['casa', 'carro', 'papagaio', 'computador', 'cachorro', 'gato', 'amanda', 'gabriel', 'debora'];
var hangman = [ "\n   ____     \n  |    |    \n  |         \n  |         \n  |         \n  |         \n _|_        \n|   |______ \n|          |\n|__________|\n",
                "\n   ____     \n  |    |    \n  |    o    \n  |         \n  |         \n  |         \n _|_        \n|   |______ \n|          |\n|__________|\n",
                "\n   ____     \n  |    |    \n  |    o    \n  |   /     \n  |         \n  |         \n _|_        \n|   |______ \n|          |\n|__________|\n",
                "\n   ____     \n  |    |    \n  |    o    \n  |   /|    \n  |         \n  |         \n _|_        \n|   |______ \n|          |\n|__________|\n",
                "\n   ____     \n  |    |    \n  |    o    \n  |   /|\\  \n  |         \n  |         \n _|_        \n|   |______ \n|          |\n|__________|\n",
                "\n   ____     \n  |    |    \n  |    o    \n  |   /|\\  \n  |    |    \n  |         \n _|_        \n|   |______ \n|          |\n|__________|\n",
                "\n   ____     \n  |    |    \n  |    o    \n  |   /|\\  \n  |    |    \n  |   /     \n _|_        \n|   |______ \n|          |\n|__________|\n",
                "\n   ____     \n  |    |    \n  |    o    \n  |   /|\\  \n  |    |    \n  |   / \\  \n _|_        \n|   |______ \n|          |\n|__________|\n"    ];

var letters = [];
var words = [];
var word_attempt
var word = possible_words[Math.floor(Math.random() * possible_words.length)];
var word_hiden =  [word.length];
var userIdMax = 0;
var h_index = 0;
var letter_found = false;
var number_of_players = 0;

//Initialize word hiden
for (let i = 0; i < word.length; i++) {
    word_hiden[i] = '_';
}


//Detect connection and disconnection
server.on('connection', function(socket){
    console.log(`>>New user connected (id = ${socket.id}).`);
    socketsCreated.push(socket.id);
    if (userIdMax != 0){
        userIdMax = userIdMax + 1;
    }
    number_of_players++;

    socket.on('disconnect', function(socket){
        console.log(`>>A user has left the chat (id = ${socket.id}).`)
        number_of_players--;
    })

})

//Log message receiveid by a user
server.on('connection', function(socket){
    socket.on('chat message', function(msg){
        console.log('>>Message received:' + msg);
      });
})

//Broadcast and communication with the client
//Also calls the gameplay functions
server.on('connection', function(socket){
    socket.on('chat message', function(msg){
        //socket.emit('chat message', 'You said: ' + msg);

        //Find socket id to identify user
        userId = socketsCreated.indexOf(socket.id);

        //Gameplay
        isWord = check_message(msg);

        if (isWord == true) {
            compare_word(msg);
        }
        else {
            compare_letter(msg);
        }

        //Display game for players
        display();
        
    });
  });

function check_message(msg) {
    if (msg.length > 1) {
        return true
    } else {
        return false
    }
}

function compare_word(msg) {
    if (msg == word) {
        for (let i = 0; i < word.length; i++) {
            word_hiden[i] = word.charAt(i);
            h_index = 99
        }
    } else {
        if (!words.includes(msg)) {
            words.push(msg);   
        }
    } 
}

function compare_letter(msg) {
    letter_found = false;
    for (let i = 0; i < word.length; i++) {
        if (msg == word.charAt(i)) {
            word_hiden[i] = msg;
            letter_found = true;

            //check if the word is correct
            if (!(word_hiden.toString()).includes('_')) {
                word_attempt = ""
                for (let i = 0; i < word_hiden.length; i++) {
                    if (word_hiden[i] != '_') {
                        word_attempt += word_hiden[i];
                    }
                }
                compare_word(word_attempt)
            }
        }
    }

    if (!letter_found) {
        //store letter
        letters.push(msg);
        h_index++;
    }
}

function display() {
    
    switch (h_index) {
        case 7:
            //Man hanged
            man_dead = "\n   ____     \n  |    |    \n  |    o    \n  |   /|\\  \n  |    |    \n  |   / \\  \n _|_        \n|   |______ \n|          |\n|__________|\n"
            server.emit('chat message', game_title + man_dead + "\nThe man is dead. Good luck next time! The word was " + word + "\n\nType another letter to start a new game (type 'exit' to quit.)\n")
            reset_game();
            break;
        case 99:
            //Man saved
            man_alive = "\n   ____     \n  |    |    \n  |    \n  | 		Thank you!	\n  |    \\o\n  |     |\\ \n _|_    |    \n|   |__/ \\_ \n|          |\n|__________|\n"
            server.emit('chat message', game_title + man_alive + "\nYou all saved a man's life. Great job! The word was " + word + "\n\nType another letter to start a new game (type 'exit' to quit.)\n")
            reset_game();
            break;
        default:
            //Game hasn't finish yet
            if (number_of_players == 1) {
                header_text = "You are playing alone :(";
            }
            else {
                header_text = "You are playing with another " + number_of_players + " players!"
            }
            server.emit('chat message', "\n" + header_text + hangman[h_index] + "\nWord: " +  word_hiden.join(" ") + "\nAttempts - Letters: " + letters + "\nAttempts - Words: " + words + "\n")
            break;
    }
}

function reset_game() {
    letters = [];
    words = [];
    word = possible_words[Math.floor(Math.random() * possible_words.length)];
    word_hiden =  [word.length];
    userIdMax = 0;
    h_index = 0;
    letter_found = false;

    for (let i = 0; i < word.length; i++) {
        word_hiden[i] = '_';
    }
}