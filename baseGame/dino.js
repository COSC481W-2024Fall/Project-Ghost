import {canvas, ctx, gravity} from '/baseGame/game.js';

const dino = {
    x: 50,
    y: canvas.height - 50, // Start on the ground
    width: 30,
    height: 50,
    dy: 0,
    jumping: false,
    crouching: false,

    draw() {
        const height = this.crouching ? this.height / 2 : this.height;
        const adjustedY = this.crouching ? this.y + this.height / 2 : this.y; 
        ctx.fillStyle = this.crouching ? 'blue' : 'green'; 
        ctx.fillRect(this.x, adjustedY, this.width, height);
    },

    update() {
        // Apply gravity when jumping
        if (this.jumping) {
            this.dy += gravity;
            this.y += this.dy;

            // Stop at ground level
            if (this.y + this.height >= canvas.height) {
                this.y = canvas.height - this.height;
                this.dy = 0;
                this.jumping = false;
            }
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

    jump() {
        if (!this.jumping && !this.crouching) { 
            this.jumping = true;
            this.dy = -12; 
        }
    },

    crouch(state) {
        if (!this.jumping) {
            this.crouching = state;
        }
    }
};
export {dino};