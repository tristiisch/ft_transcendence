//import { createCanvas, loadImage } from 'canvas'
import { Console } from 'console';

//import { startMatch } from "../game/matchs/matchs.sockets"
//import { createCanvas, loadImage } from 'canvas'

export async function startMatch(socket) {
	const width = 3989;
	const height = 2976;
	var x = width / 2;
	var y = height / 2;
	var dx = 2;
	var dy = -2;

	const blocker_width = width / 50;
	const blocker_height = height / 5;
	const p1_xpos = width / 10;
	const p2_xpos = width - width / 10;
	var p1_ypos = height / 2 - blocker_height / 2;
	var p2_ypos = height / 2 - blocker_height / 2;

	socket.on('p1_dy', dy => {
		console.log(dy);
	});
	// socket.on('p1_dy', function(dy: number) {
	// 	//console.log(dy)
	// 	p1_ypos += dy
	// })
	// socket.on('p2_dy', function(dy: number) {
	// 	p2_ypos += dy
	// })

	// let canvas = createCanvas(3989, 2976)
	// canvas.width = 3989
	// canvas.height = 2976
	// var context = canvas.getContext('2d')
	// loadImage("https://i.ibb.co/9ZrtvT4/stage.png").then((img) => {
	// 	context.drawImage(img, 0, 0, 3989, 2976)
	setInterval(function () {
		// console.log(context.getImageData(x, y, 1, 1).data)
		if (x + dx < 0 || x + dx > width) {
			dx = -dx;
		}
		if (y + dy < 0 || y + dy > height) {
			dy = -dy;
		}
		// let rgba = context.getImageData(x + dx, y, 1, 1).data
		// let rgba2 = context.getImageData(x, y + dy, 1, 1).data
		// if (y > 300 && y < 2700 && !(rgba[0] === 255 && rgba[1] === 255 && rgba[2] === 255 && rgba[2] === 255))
		// 	dx = -dx
		// if (x > 200 && x < 3800 && !(rgba2[0] === 255 && rgba2[1] === 255 && rgba2[2] === 255 && rgba2[2] === 255))
		// 	dy = -dy
		x += dx;
		y += dy;
		socket.emit('ball', x, y);
	}, 1);
	// })
}
