import Konva from 'konva'

export async function startMatch(io)
{
	const width = 1
	const height = 2976/3989
	var x = 0
	var y = 0
	var dx = 0.0005
	var dy = 0.0005
	setInterval(function() {
		if (x + dx < 0 || x + dx > width) { dx = -dx; }
		if (y + dy < 0 || y + dy > height) { dy = -dy; }
		x += dx
		y += dy
		io.emit("ball", x, y)
	}, 1)
}