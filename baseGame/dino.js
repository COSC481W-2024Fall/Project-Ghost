// Load the dino image
import { canvas, ctx, gravity } from './game.js';

const dinoImage = new Image();
dinoImage.src = '/baseGame/assets/dino.png';

// Load crouching dino image
const dinocImage = new Image();
dinocImage.src = '/baseGame/assets/crouch.png';

// Load jump sound
const jumpSound = new Audio('/baseGame/sounds/jump.mp3'); // Replace with the actual path to your jump sound
jumpSound.volume = 0.3; // Adjust volume as needed

const dino = {
    x: 50,
    y: canvas.height - 50,
    width: 70,      // Full width
    height: 130,    // Full height
    hitboxWidth: 30,    // Custom hitbox width (adjust as needed)
    hitboxHeight: 110,  // Custom hitbox height (adjust as needed)
    dy: 0,
    jumping: false,
    jumpHeld: false,
    crouching: false,
    crouchHeld: false,

    draw() {
        const height = this.crouching ? this.height / 2 : this.height;
        const adjustedY = this.crouching ? this.y + this.height / 2 : this.y;

        // Draw the dino image
        if (this.crouching) {
            if (dinocImage.complete) {
                ctx.drawImage(dinocImage, this.x, adjustedY, this.width, height);
            } else {
                ctx.fillStyle = 'blue';
                ctx.fillRect(this.x, adjustedY, this.width, height);
            }
        } else {
            if (dinoImage.complete) {
                ctx.drawImage(dinoImage, this.x, adjustedY, this.width, height);
            } else {
                ctx.fillStyle = 'green'; // Fallback rectangle for standing
                ctx.fillRect(this.x, adjustedY, this.width, height);
            }
        }
    },

    update(deltaTime) {
        // Handle Jump input
        if (this.jumpHeld && !this.jumping && !this.crouching) {
            this.jumping = true;
            this.dy = -12;
            jumpSound.currentTime = 0; // Reset sound to the start
            jumpSound.play().catch(err => console.error('Jump sound play failed:', err)); // Play the jump sound
        }

        // Apply gravity when jumping
        if (this.jumping) {
            this.dy += gravity * deltaTime;
            this.y += this.dy * deltaTime;

            // Stop at ground level
            if (this.y + this.height >= canvas.height) {
                this.y = canvas.height - this.height;
                this.dy = 0;
                this.jumping = false;
            }
        }

        if (!this.jumping && this.crouchHeld) {
            this.crouching = this.crouchHeld;
        } else {
            this.crouching = false;
        }

        // Adjust height based on crouching status
        if (!this.jumping) {
            if (this.crouching) {
                this.height = 70;
                this.y = canvas.height - this.height;
            } else {
                this.height = 130;
                this.y = canvas.height - this.height;
            }
        }
    },

    jump(state) {
        this.jumpHeld = state;
    },

    crouch(state) {
        this.crouchHeld = state;
    },

    // Custom hitbox getters
    get hitbox() {
        // adjuster for hitbox when crouching
        const hitboxY = this.crouching ? this.y + 50 : this.y;

        return {
            x: this.x + (this.width - this.hitboxWidth) / 2,
            y: hitboxY + (this.height - this.hitboxHeight) / 2,
            width: this.hitboxWidth,
            height: this.hitboxHeight,
        };
    }
};

export { dino };
