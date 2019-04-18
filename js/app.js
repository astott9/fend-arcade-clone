const scoreboard = document.querySelector('.scoreboard'),
      score = document.querySelector('.score'),
      winPanel = document.querySelector('.win__panel'),
      restartButton = document.querySelector('.restart');
      enemies = ['blue','brown','green','red','yellow'],
      numEnemies = getRandomNumber(2,5),
      yPositions = [60,142,224,307],
      collisionTolerance = [50,10],
      gems = ['Blue', 'Orange', 'Red'];
      numGems = getRandomNumber(0,3);

/**
 * Class representing an Enemy
 */
class Enemy {
    /**
     * Create an Enemy
     */
    constructor() {
        this.sprite = `images/enemy-bug-${enemies[getRandomNumber(0,4)]}.png`;
        this.reset();
    }

    /**
     * Called by the game engine in the main loop, update the x position of this item as
     * a function of speed. If it goes off the right side of the board, reset its location.
     * Also check if this Enemy has collided with the Player, if so, update the score and
     * reset the Player's location
     * @param {number} dt
     */
    update(dt) {
        this.x = this.x + (this.speed * dt);
        if (this.x > 505) this.reset();
        if (this.x >= player.x - collisionTolerance[0] && this.x <= player.x + collisionTolerance[0] &&
            this.y >= player.y - collisionTolerance[1] && this.y <= player.y + collisionTolerance[1]){
                player.updateScore('ouch');
                player.reset();
            }
    };

    /**
     * Render the image on the canvas at this item's x,y position
     */
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    /**
     * Reset this item's x,y position and speed using a random number generator
     */
    reset() {
        this.x = getRandomNumber(-300,-100);
        this.y = yPositions[getRandomNumber(0,2)];
        this.speed = getRandomNumber(200,800);
    }
}

/**
 * Class representing a Player
 */
class Player {
     /**
     * Create a Player
     */
    constructor() {
        this.sprite = 'images/char-boy.png';
        this.updateScore('start');
        this.reset();
    }

    /**
     * Called by the game engine in the main loop, check if the player has reached
     * the top of the board (water). If so, update the score & reset the player
     * to its starting position
     */
    update() {
        if (this.y < 0) {
            this.updateScore('win');
            this.reset();
        }
    };

    /**
     * Render the image on the canvas at this item's x,y position
     */
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    /**
     * Event handler for certain key presses, to either move the player around the gameboard,
     * or reset the game.
     * @param {string} key
     */
    handleInput(key) {
        switch(key) {
            case 'left':
                if(this.x >= 100) this.x = this.x - 100;
                break;
            case 'up':
                if(this.y >= 68) this.y = this.y - 83;
                break;
            case 'right':
                if(this.x <= 300) this.x = this.x + 100;
                break;
            case 'down':
                if(this.y <= 318) this.y = this.y + 83;
                break;
            case 'enter':
                if(winPanel.className.includes('open')) restartGame();
                break;
        }
    }

    /**
     * @description Update the score based on certain conditions, that is:
     * if the game is starting, score is 0,
     * if the player collides with an enemy, lose 50
     * if the player collides with a collectible, add 100
     * if the player wins by reaching the water, add 100
     * Lastly, if the score reaches 1000, the game ends
     * @param {string} condition
     */
    updateScore(condition) {
        scoreboard.classList.remove('scoredboard-decrease');
        scoreboard.classList.remove('scoredboard-increase');

        switch(condition) {
            case 'start':
                currentScore = 0;
                break;
            case 'ouch':
                currentScore = currentScore - 50;
                setTimeout(function (){
                    scoreboard.classList.add('scoredboard-decrease');
                },1);
                break;
            case 'win':
            case 'gem':
                currentScore = currentScore + 100;
                setTimeout(function (){
                    scoreboard.classList.add('scoredboard-increase');
                },1);
                if (currentScore >= 1000) winPanel.classList.add('win__panel-open');
                break;
        }
        score.innerHTML = currentScore;
    }

    /**
     * Reset the player to the starting position
     */
    reset() {
        this.x = 200;
        this.y = 400;
    }
}

/**
 * Class representing a Collectible
 */
class Collectible {
     /**
     * Create a Collectible
     */
    constructor() {
        this.sprite = `images/Gem ${gems[getRandomNumber(0,2)]}.png`;
        this.reset();
    }

    /**
     * Called by the game engine in the main loop, check if the player has collided
     * with this item
     */
    update() {
        if (this.x >= player.x - collisionTolerance[0] && this.x <= player.x + collisionTolerance[0] &&
            this.y >= player.y - collisionTolerance[1] && this.y <= player.y + collisionTolerance[1]){
                player.updateScore('gem');
                this.remove();
            }
    };

    /**
     * Render the image on the canvas at this item's x,y position
     */
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };

    /**
     * Remove this item from the gameboard by placing it off screen
     */
    remove() {
        this.x = -300;
        this.y = -300;
    }

    /**
     * Reset this item to a random position on the gameboard
     */
    reset() {
        this.x = getRandomNumber(0,4) * 100;
        this.y = yPositions[getRandomNumber(0,3)];
    }
}

let currentScore = 0,
    allEnemies = [],
    player = new Player(),
    allGems = [];

for (let i=0; i<numEnemies; i++) {
    allEnemies.push(new Enemy());
}

for (let i=0; i<numGems; i++) {
    allGems.push(new Collectible());
}

/**
 * @description Generate a random number within a given range
 * @param {number} min
 * @param {number} max
 * @returns {number} random number between min and max (inclusive)
 */
function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Listen for cursor keys pressed (for player movement), or enter (restart the game)
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        13: 'enter',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

/**
 * Listen for the restart button being clicked - to restart the game
 */
restartButton.addEventListener('click', function () {
    restartGame();
});

/**
 * Restart the game by reloading the page
 */
function restartGame(){
    location.reload();
}