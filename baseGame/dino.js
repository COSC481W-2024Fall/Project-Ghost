import { canvas, ctx, gravity } from './game.js';

// Load the dino image
const dinoImage = new Image();
dinoImage.src = '/assets/dino-rework.png';  // Adjust the path if necessary

const dino = {
    x: 50,
    y: canvas.height - 50, // Start on the ground
    width: 80,
    height: 100,
    dy: 0,
    jumping: false,
    jumpHeld: false,
    crouching: false,
    crouchHeld: false,

    draw() {
        const height = this.crouching ? this.height / 2 : this.height;
        const adjustedY = this.crouching ? this.y + this.height / 2 : this.y; 

        if (dinoImage.complete) {
            // Draw the dino image, scaling it if crouching
            ctx.drawImage(dinoImage, this.x, adjustedY, this.width, height);
        } else {
            // If image hasn't loaded yet, use a temporary rectangle
            ctx.fillStyle = this.crouching ? 'blue' : 'green';
            ctx.fillRect(this.x, adjustedY, this.width, height);
        }
    },

    update(deltaTime) {
        // Handle Jump input
        if (this.jumpHeld && !this.jumping && !this.crouching) { 
            this.jumping = true;
            this.dy = -12; 
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
                this.height = 25;
                this.y = canvas.height - this.height;
            } else {
                this.height = 50;
                this.y = canvas.height - this.height;
            }
        }
    },

    jump(state) {
        this.jumpHeld = state;
    },

    crouch(state) {
        this.crouchHeld = state;
    }
};

export { dino };
