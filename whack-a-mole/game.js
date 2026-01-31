class WhackAMoleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameInterval = null;
        this.moleInterval = null;
        this.isPlaying = false;
        this.lastMoleIndex = -1;

        this.scoreDisplay = document.getElementById('score');
        this.timeDisplay = document.getElementById('time');
        this.startBtn = document.getElementById('start-btn');
        this.gameOverScreen = document.getElementById('game-over');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');
        this.holes = document.querySelectorAll('.hole');
        this.moles = document.querySelectorAll('.mole');

        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());

        this.moles.forEach((mole, index) => {
            mole.addEventListener('click', (e) => this.whackMole(e, index));
        });

        this.holes.forEach((hole, index) => {
            hole.addEventListener('click', (e) => {
                if (e.target === hole) {
                    // Clicked on hole, not mole - miss!
                }
            });
        });
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = 30;
        this.updateScore();
        this.updateTime();

        this.startBtn.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');

        this.removeOverlay();

        // Start the game timer
        this.gameInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTime();

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);

        // Start spawning moles
        this.spawnMole();
    }

    spawnMole() {
        if (!this.isPlaying) return;

        // Hide all moles first
        this.moles.forEach(mole => mole.classList.remove('up'));

        // Pick a random hole (different from last one)
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.holes.length);
        } while (randomIndex === this.lastMoleIndex);

        this.lastMoleIndex = randomIndex;

        // Show the mole
        const mole = this.moles[randomIndex];
        mole.classList.add('up');
        mole.classList.remove('whacked');

        // Random time for mole to stay up (600ms - 1200ms)
        const upTime = Math.random() * 600 + 600;

        // Hide the mole after random time
        setTimeout(() => {
            mole.classList.remove('up');

            // Spawn next mole after a short delay
            if (this.isPlaying) {
                const nextSpawnDelay = Math.random() * 300 + 200;
                setTimeout(() => this.spawnMole(), nextSpawnDelay);
            }
        }, upTime);
    }

    whackMole(e, index) {
        e.stopPropagation();

        if (!this.isPlaying) return;

        const mole = this.moles[index];

        if (mole.classList.contains('up') && !mole.classList.contains('whacked')) {
            mole.classList.add('whacked');
            this.score += 10;
            this.updateScore();

            // Play hit effect
            setTimeout(() => {
                mole.classList.remove('up');
                mole.classList.remove('whacked');
            }, 150);
        }
    }

    updateScore() {
        this.scoreDisplay.textContent = this.score;
    }

    updateTime() {
        this.timeDisplay.textContent = this.timeLeft;

        // Change color when time is running low
        if (this.timeLeft <= 10) {
            this.timeDisplay.parentElement.style.color = '#c0392b';
        } else {
            this.timeDisplay.parentElement.style.color = '#e74c3c';
        }
    }

    endGame() {
        this.isPlaying = false;

        clearInterval(this.gameInterval);
        clearInterval(this.moleInterval);

        // Hide all moles
        this.moles.forEach(mole => {
            mole.classList.remove('up');
            mole.classList.remove('whacked');
        });

        // Show game over screen
        this.finalScoreDisplay.textContent = this.score;
        this.addOverlay();
        this.gameOverScreen.classList.remove('hidden');
    }

    restartGame() {
        this.gameOverScreen.classList.add('hidden');
        this.startGame();
    }

    addOverlay() {
        if (!document.querySelector('.overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            document.body.appendChild(overlay);
        }
    }

    removeOverlay() {
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WhackAMoleGame();
});
