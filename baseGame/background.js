class Background {
	draw() {
		if (this.is_loaded) {
			const scaledWidth = this.width;
			this.ctx.drawImage(
				this.image, this.x, 0,
				scaledWidth, this.canvas.height,
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
	
	constructor(canvas, path) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.image = new Image();
		this.image.src = path;
		this.image.onload = () => {
			this.is_loaded = true;
			const ratio = (this.image.height / canvas.height) || 1;
			this.width = (this.image.width / ratio) || canvas.width;
		};
	}
}

export class BackgroundManager {
	updateBackground(gameSpeed, deltaTime) {
		let xOffset = 0;
		let pushes = 0;
		for (let i = 0; i < this.renderQueue.length; i += 1) {
			const image = this.renderQueue[i];
			if (!image.is_loaded) {
				continue;
			}
			if (i === 0) {
				image.x -= gameSpeed * deltaTime * image.speed;
			} else {
				image.x = xOffset;
			}
			image.draw();
			xOffset = image.x + image.width - 1;
			if (xOffset <= 0) {
				this.renderQueue.push(this.renderQueue.shift());
				pushes += 1;
				i -= 1;
			}
			if (pushes > this.renderQueue.length) {
				console.log("quit from push");
				console.log(xOffset);
				image.x = 0;
				return;
			}
		}
	}
	
	renderQueue = [];
	canvas;
	
	constructor(canvas) {
		this.canvas = canvas;
		this.renderQueue.push(
			new Background(canvas, '/baseGame/assets/sideScrollerBackground.png')
		);
		this.renderQueue.push(
			new Background(canvas, '/baseGame/assets/sideScrollerBackgroundFlipped.png')
		);
	}
}
