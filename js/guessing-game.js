/* 

Write your guess-game code here! Don't forget to look at the test specs as a guide. You can run the specs
by running "testem".

In this file, you will also include the event listeners that are needed to interact with your HTML file when
a user clicks a button or adds a guess to the input field.

*/

/* ---------- Game logic ---------- */
function generateWinningNumber() {
    return Math.floor( Math.random() * 100 + 1 );
}

// Fisher-Yates Shuffle algorithm:
// allows us to shuffle an array in place in constant time
// https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    // j    = number of times we're swapping elements
    // temp = temporary variable to swap
    // i    = random index we are swapping with 
    let j = array.length, temp, i;

    while(j) {
        // Get random index to swap
        i = Math.floor( Math.random() * j-- );

        // Swap
        temp = array[j];
        array[j] = array[i];
        array[i] = temp;
    }

    return array;
}

function newGame() {
    return new Game();
}

class Game {
    constructor() {
        this.playersGuess = null;
        this.pastGuesses = new Array;
        this.winningNumber = generateWinningNumber();
    }

    difference() {
        return Math.abs(this.playersGuess - this.winningNumber);
    }

    isLower() {
        return this.playersGuess < this.winningNumber;
    } 

    playersGuessSubmission(guess) {
        guess = Number(guess);
        if (guess < 1 || 100 < guess || 
            isNaN(guess)) {
            throw 'That is an invalid guess.';
        } else {
            this.playersGuess = guess;
            return this.checkGuess();
        }
    }

    checkGuess() {
        let prompt;

        if (this.playersGuess === this.winningNumber) {
            prompt = 'You Win!';
        } else if (this.pastGuesses.includes(this.playersGuess)) {
            return 'You have already guessed that number.';
        } else if (this.pastGuesses.length === 4 && this.playersGuess !== this.winningNumber) {
            prompt = 'You Lose.';
        } else if (this.difference() < 10) {
            prompt = 'You\'re burning up!';
        } else if (this.difference() < 25) {
            prompt = 'You\'re lukewarm.';
        } else if (this.difference() < 50) {
            prompt = 'You\'re a bit chilly.';
        } else if (this.difference() < 100) {
            prompt = 'You\'re ice cold!';
        }

        this.pastGuesses.push(this.playersGuess);
        return prompt;
    }

    provideHint() {
        let hint = [this.winningNumber];
        const max = this.isLower() ? this.winningNumber - 5 : this.winningNumber + 5 
        while (hint.length < 3) {
            const newNumber = Math.floor( Math.random() * (max - game.winningNumber) + game.winningNumber);
            if (!hint.includes(newNumber)) hint.push(newNumber);
        }

        return shuffle(hint);
    }
}

/* ----------  UI functionality ---------- */
let game = newGame();

// Element objects
const prompt = document.getElementById('main-prompt');
const message = document.getElementById('message');
const input = document.getElementById('guess');
const submit = document.getElementById('submit');
const hint = document.getElementById('hint');
const reset = document.getElementById('reset');

/* ---------- Helper functions ---------- */
// pause the screen for when the player wins/loses
function pauseScreen(result) {
    updateList(result);
    prompt.innerHTML = `${result} Would you like to try again?`;
    message.innerHTML = result === 'You Win!' ? 'Congrats!' : `Should have guessed ${game.winningNumber} :c`;
    reset.innerHTML = 'Play Again!';
    input.disabled = true;
    submit.disabled = true;
    hint.disabled = true;
}

// change messages user sees and calls updateList()
function updateScreen(result) {
    if (result === 'That is an invalid guess.') {
        // Handle invalid guess
        prompt.innerHTML = `Oops! ${input.value} is not a valid guess.`;
        message.innerHTML = 'Input a number between 1 to 100!';
    } else if (result === 'You have already guessed that number.') {
        // Handle previously guessed numbers
        prompt.innerHTML = result;
        message.innerHTML = 'Input a number between 1 to 100!';
    } else {
        // Prompt is the return value from Game object
        prompt.innerHTML = result;
        updateList(result);
        // Message to user to guide their next guess
        const higherOrLower = game.isLower() ? 'Higher' : 'Lower';
        message.innerHTML = `Guess ${higherOrLower}!`;
    }
}

// adds any new guesses the play has made and changes the background
// of the lifs according to how close the guess was
function updateList(result) {
    // Create and append new list element to the history
    const listElement = document.querySelector(`#history li:nth-child(${game.pastGuesses.length})`);
    listElement.innerHTML = game.playersGuess;
    if (result === 'You\'re burning up!') {
        listElement.style.background = 'crimson';
    } else if (result === 'You\'re lukewarm.') {
        listElement.style.background = 'gold';
    } else if (result === 'You\'re a bit chilly.') {
        listElement.style.background = 'darkturquoise';
    } else if (result === 'You\'re ice cold!'){
        listElement.style.background = 'dodgerblue';
    } else if (result === 'You Win!') {
        listElement.style.background = 'lawngreen';
    } else {
        listElement.style.background = 'indigo';
    }
}

/* ---------- Event Handlers ---------- */
/**
 * Get user guess:
 *  - determine if user won or lost or can continue
 *    - if win or lose, pause the screen until reset
 *  - display pastGuesses
 * Clear input element
 * Display prompt
 */
function handleSubmitBtn() {
    try {
        const result = game.playersGuessSubmission( input.value );
        if (result === 'You Win!' || result === 'You Lose.') {
            pauseScreen(result);
        } else {
            updateScreen(result);
        }
    } catch (error) {
        updateScreen(error);
    }
    
    input.value = '';
}
// submit button handlers with enter key
document.onkeydown = event => {
    // Not sure which property to use
    // .which most likely jquery (front end) library
    const key = event.which || event.keyCode || event.key || event.code;
    if (key === 13 || key === 'Enter') {
        handleSubmitBtn();
    }
}

// Hint event handler: get the hints, show them, disable the button
function handleHintBtn() {
    if (game.pastGuesses.length < 3) {
        prompt.innerHTML = 'A little early for a hint, don\'t you think?';
    } else {
        let hints = game.provideHint();
        prompt.innerHTML = `The answer is one of the following: ${hints[0]}, ${hints[1]}, and ${hints[2]}`;
        hint.disabled = true;
    }
}

// Reset event handler: create a new game, change all the prompts, reenable buttons, clear history
function handleResetBtn() {
    game = newGame();
    prompt.innerHTML = 'Guess my number!';
    message.innerHTML = 'I am thinking of a number between 1-100.<br>You have 5 guesses and 1 hint.<br>Good luck.';
    input.disabled = false;
    submit.disabled = false;
    
    // Reset past guesses
    for (let i = 1; i <= 5; i++) {
        const listElement = document.querySelector(`#history li:nth-child(${i})`);
        listElement.innerHTML = '-';
        listElement.style.background = 'lightgrey';
    }

    hint.disabled = false;
    reset.innerHTML = 'Reset';
}

/* ---------- Event Listeners ---------- */
// Submit event handler for click and when user presses enter
submit.addEventListener('click', handleSubmitBtn );

// Hint event listener
hint.addEventListener('click', handleHintBtn );

// Reset event listener
reset.addEventListener('click', handleResetBtn ) 