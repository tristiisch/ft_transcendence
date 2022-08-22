import { createCanvas, loadImage } from 'canvas'

export async function startMatch(io)
{
	const width = 3989
	const height = 2976
	var x = width/2
	var y = height/2
	var dx = -2
	var dy = 2

	const svg_data = "data:image/svg+xml,%3csvg width='3989' height='2976' xmlns='http://www.w3.org/2000/svg'%3e%3cg id='Layer_1'%3e%3ctitle%3eLayer 1%3c/title%3e%3cpath id='svg_6' d='m1862.47097%2c72.7879l432.4622%2c3.04322l461.09618%2c4.16973l456.00486%2c40.00043l208.00221%2c40.00043l124.00132%2c48.00051l108.00115%2c72.00077l104.00111%2c120.00128l52.00055%2c88.00094l52.00055%2c180.00192l24.00026%2c308.00328l16.00017%2c384.00409l-8.00009%2c444.00473l-32.00034%2c460.0049l-40.00043%2c176.00187l-96.00102%2c168.00179l-124.00132%2c116.00124l-124.00132%2c68.00072l-164.00175%2c36.00038l-604.00643%2c60.00064l-664.00707%2c24.00026l-704.0075%2c-12.00013l-660.00703%2c-64.00068l-184.00196%2c-48.00051l-180.00192%2c-116.00124l-104.00111%2c-128.00136l-64.00068%2c-136.00145l-28.0003%2c-116.00124l-44.00047%2c-548.00584l-8.00009%2c-428.00456l56.0006%2c-668.00711l52.00055%2c-172.00183l84.00089%2c-128.00136l104.00111%2c-100.00106l196.00209%2c-88.00094l212.00226%2c-40.00043l508.00541%2c-36.00038l582.45734%2c-11.21299z' opacity='NaN' stroke='black' fill='white'/%3e%3c/g%3e%3c/svg%3e"
	let canvas = createCanvas(3989, 2976)
	canvas.width = 3989
	canvas.height = 2976
	var context = canvas.getContext('2d')
	loadImage("https://i.ibb.co/9ZrtvT4/stage.png").then((img) => {
		context.drawImage(img, 0, 0, 3989, 2976)
		setInterval(function() {
			// console.log(context.getImageData(x, y, 1, 1).data)
			if (x + dx < 0 || x + dx > width) { dx = -dx }
			if (y + dy < 0 || y + dy > height) { dy = -dy }
			let rgba = context.getImageData(x + dx, y, 1, 1).data
			let rgba2 = context.getImageData(x, y + dy, 1, 1).data
			if (!(rgba[0] === 255 && rgba[1] === 255 && rgba[2] === 255 && rgba[2] === 255))
				dx = -dx
			if (!(rgba2[0] === 255 && rgba2[1] === 255 && rgba2[2] === 255 && rgba2[2] === 255))
				dy = -dy
			x += dx
			y += dy
			io.emit("ball", x, y)
		}, 1)

	})
}