import { rest } from 'msw';
import axios from 'axios';
import users from '@/data/users';
import matchs from '@/data/matchs';
import matchsHistory from '@/data/matchsHistory';
import friends from '@/data/friends';
import Status from '@/types/Status';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

function generateQRCode(): string {
	const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';

	const user = 'jlaronch';
	const service = 'ft-transcendence';
	const otpauth = authenticator.keyuri(user, service, secret);
	let imagePath = '';

	qrcode.toDataURL(otpauth, (err, imageUrl) => {
		if (err) {
			console.log('Could not generate QR code', err);
			return;
		}
		imagePath = imageUrl;
	});
	return imagePath;
}

export default [
	rest.get('/users', (req, res, ctx) => {
		return res(ctx.json(users));
	}),

	rest.get('/users/me/:id', (req, res, ctx) => {
		return res(ctx.json(users.find((user) => user.id === req.params.id)));
	}),

	rest.post('/users/me/:id/set-username', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		if (users.find((user) => user.username === data.username)) return res(ctx.status(403), ctx.json({ message: `username ${data.username} already exist.` }));
		const user = users.find((user) => user.id === req.params.id);
		if (user) user.username = data.username;
		return res(ctx.status(200));
	}),

	rest.post('/users/me/:id/set-avatar', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		const user = users.find((user) => user.id === req.params.id);
		if (user) user.avatar = data.avatar;
		return res(ctx.status(200));
	}),

	rest.get('/users/:username', (req, res, ctx) => {
		console.log(req.params.username);
		return res(ctx.json(users.find((user) => user.username === req.params.username)));
	}),

	rest.get('/users/:username/friends', (req, res, ctx) => {
		return res(ctx.json(friends.get(req.params.username as string)));
	}),

	rest.get('/users/:username/matchs', (req, res, ctx) => {
		return res(ctx.json(matchs));
	}),

	rest.get('/users/:username/matchsHistory', (req, res, ctx) => {
		return res(ctx.json(matchsHistory.get(req.params.username as string)));
	}),

	rest.post('/users/:username/friend-request', async (req, res, ctx) => {
		const data = await req.json();
		const tab = friends.get(req.params.username as string) as string[];
		if (tab) tab.push(data.target);
		else friends.set(req.params.username as string, [data.target]);
		console.log(friends);
		return res(ctx.status(200));
	}),

	rest.post('/users/:username/unfriend-request', async (req, res, ctx) => {
		const data = await req.json();
		const tab = friends.get(req.params.username as string) as string[];
		for (let i = 0; i < tab.length; i++) {
			if (tab[i] === data.target) tab.splice(i, 1);
		}
		console.log(friends);
		return res(ctx.status(200));
	}),

	rest.post('/auth/login', async (req, res, ctx) => {
		const data = await req.json();
		if (data.code == '' || data.state !== import.meta.env.VITE_CLIENT_STATE) return res(ctx.status(400));
		console.log(data.code, data.state);
		const url = import.meta.env.VITE_OAUTH_URL;
		console.log(url);
		const postData = {
			grant_type: 'authorization_code',
			client_id: import.meta.env.VITE_CLIENT_ID,
			client_secret: import.meta.env.VITE_CLIENT_SECRET,
			code: data.code,
			redirect_uri: import.meta.env.VITE_REDIRECT_URI,
		};
		console.log(postData);
		const result = await axios.post(url, postData);
		console.log(result);
		const headersRequest = { Authorization: 'Bearer ' + result.data.access_token };
		const userInfo = await axios.get(import.meta.env.VITE_42_API_ME, { headers: headersRequest });
		console.log(userInfo);
		users.push({
			id: userInfo.data.login,
			username: '',
			rank: 0,
			nbVictory: 0,
			nbDefeat: 0,
			avatar: userInfo.data.image_url,
			'2fa': '',
			current_status: Status.OFFLINE,
		});
		return res(
			ctx.json({
				id: userInfo.data.login,
				accessToken: 'fake-jwt-token',
			})
		);
		//return res(ctx.status(404));
	}),
	rest.post('/auth/2fa/login', async (req, res, ctx) => {
		const data = await req.json();
		const otpToken = data.otpToken;

		const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';
		//const token = totp.generate(secret);
		//const token = authenticator.generate(secret);
		try {
			const isValid = authenticator.check(otpToken, secret);
			console.log(isValid);
			return res(ctx.status(200));
		} catch (err) {
			console.log(err);
			return res(ctx.status(403), ctx.json({ message: `code is not valid` }));
		}
	}),

	rest.post('/auth/2fa/enable', (req, res, ctx) => {
		const data = generateQRCode();
		console.log(data);
		return res(ctx.set('Content-Length', 'image/png'), ctx.json(data));
	}),

	rest.post('/auth/2fa/disable', (req, res, ctx) => {
		return res(ctx.status(200));
	}),
];
