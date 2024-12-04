class Background {
	draw() {
		if (this.is_loaded) {
			const scaledWidth = this.image.width / this.ratio;
			const scaledHeight = this.canvas.height;
			this.ctx.drawImage(
				this.image, this.x, 0,
				scaledWidth, scaledHeight,
			);
		}
	}
	
	canvas;
	ctx;
	image;
	is_loaded = false;
	x = 0;
	speed = 0.5;
	width;
	ratio;
	
	constructor(canvas, path) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.image = new Image();
		this.image.src = path;
		this.image.onload = () => {
			console.log("loaded")
			this.is_loaded = true;
			this.ratio = this.image.height / this.canvas.height;
			this.width = this.image.width / this.ratio;
		}
	}
}

export class BackgroundManager {
	updateBackground(gameSpeed, deltaTime) {
		let xOffset = 0;
		for (let i = 0; i < this.renderQueue.length; i += 1) {
			const image = this.renderQueue[i];
			if (i === 0) {
				image.x -= gameSpeed * deltaTime * image.speed;
			} else {
				image.x = xOffset;
			}
			image.draw();
			xOffset = image.x + image.width - 1;
			if (xOffset <= 0) {
				this.renderQueue.push(this.renderQueue.shift());
				i -= 1;
			}
		}
	}
	
	renderQueue = [];
	canvas;
	
	constructor(canvas) {
		this.canvas = canvas;
		this.renderQueue.push(
			new Background(canvas, '/baseGame/assets/sideScrollerBackground.png')
		)
		this.renderQueue.push(
			new Background(canvas, '/baseGame/assets/sideScrollerBackgroundFlipped.png')
			// new Background(canvas, "/baseGame/assets/range.png")
		)
	}
}