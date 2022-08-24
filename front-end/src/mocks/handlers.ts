import { rest } from 'msw';
import axios from 'axios';
import users from '@/data/users';
import matchs from '@/data/matchs';
import matchsHistory from '@/data/matchsHistory';
import discussions from '@/data/discussions';
import notifications from '@/data/notifications'
import friends from '@/data/friends';
import channels from '@/data/Channels';
import Status from '@/types/Status';
import type Message from '@/types/Message';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import type User from '@/types/User';

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

	rest.patch('/users/register/:id', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		return res(ctx.status(200));
	}),

	rest.patch('/users/me/:id/set-username', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		if (users.find((user) => user.username === data.username)) return res(ctx.status(403), ctx.json({ message: `username ${data.username} already exist.` }));
		const user = users.find((user) => user.id === parseInt(req.params.id as string))
		if (user) {
			user.username = data.username;
		}
		return res(ctx.status(200));
	}),

	rest.patch('/users/me/:id/set-avatar', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		if (users.find((user) => user.username === data.username)) return res(ctx.status(403), ctx.json({ message: `username ${data.username} already exist.` }));
		const user = users.find((user) => user.id === parseInt(req.params.id as string))
		if (user) {
			user.avatar = data.avatar;
		}
		return res(ctx.status(200));
	}),

	rest.get('/users/me/:id', (req, res, ctx) => {
		const user = users.find((user) => user.id === parseInt(req.params.id as string))
		if (user) return res(ctx.json(user));
		else return res(ctx.status(403), ctx.json({ message: `user don't exist` }));
	}),

	rest.get('/users/:id', (req, res, ctx) => {
		console.log(req.params.id);
		const user = users.find((user) => user.id === parseInt(req.params.id as string))
		console.log(user)
		if (user) return res(ctx.json(user));
		else return res(ctx.status(403), ctx.json({ message: `user don't exist` }));
	}),

	rest.get('/friends/names/:id', (req, res, ctx) => {
		return res(ctx.json(friends.get(parseInt(req.params.id as string))))
	}),

	rest.get('/matchs/current', (req, res, ctx) => {
		return res(ctx.json(matchs));
	}),

	rest.get('/chat/channels', (req, res, ctx) => {
		return res(ctx.json(channels));
	}),

	rest.get('/notifications/:id', (req, res, ctx) => {
		return res(ctx.json(notifications.get(parseInt(req.params.id as string))));
	}),

	rest.get('/chat/discussionsHistoric/:id', (req, res, ctx) => {
		return res(ctx.json(discussions.get(parseInt(req.params.id as string))));
	}),

	rest.post('/chat/addDiscussion/:id', async (req, res, ctx) => {
		const data = await req.json();
		// discussions.set(parseInt(req.params.id as string), [{ user: users.find((user) => user.id === data.id) as User, messages: [] as Message[] }]);
		return res(ctx.status(200));
	}),

	rest.post('/chat/addChannel/:id', async (req, res, ctx) => {
		const data = await req.json();
		// discussions.set(parseInt(req.params.id as string), [{ user: users.find((user) => user.id === data.id) as User, messages: [] as Message[] }]);
		return res(ctx.status(200));
	}),

	rest.post('/matchs/history/:id', async (req, res, ctx) => {
		return res(ctx.json(matchsHistory.get(parseInt(req.params.id as string))));
	}),

	rest.post('/friends/request/add/:id', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data)
		return res(ctx.status(200));
	}),

	rest.post('/friends/accept/:id', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		const tab = friends.get(parseInt(req.params.id as string)) as User[];
		console.log(tab)
		if (tab) tab.push(users.find((user) => user.id === data.id) as User);
		else friends.set(parseInt(req.params.id as string), [users.find((user) => user.id === data.id) as User]);
		return res(ctx.status(200));
	}),

	rest.post('/friends/remove/:id', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		const tab = friends.get(parseInt(req.params.id as string)) as User[];
		console.log(tab)
		console.log(data.username)
		for (let i = 0; i < tab.length; i++) {
			if (tab[i].id === data.id) tab.splice(i, 1);
		}
		return res(ctx.status(200));
	}),

	rest.post('/friends/request/remove/:id', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		return res(ctx.status(200));
	}),

	rest.post('/auth/login', async (req, res, ctx) => {
		const data = await req.json();
		if (data.code == '') return res(ctx.status(400));
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
		try {
			const result = await axios.post(url, postData);
			console.log(result);
			const headersRequest = { Authorization: 'Bearer ' + result.data.access_token };
			const userInfo = await axios.get(import.meta.env.VITE_42_API_ME, { headers: headersRequest });
			console.log(userInfo);
			return res(
				ctx.json({
					auth: {
						user_id: 6, // voir si on le garde ou pas
						token:'fake-jwt-token',
						has_2fa: false},
					user: {
						id: 6,
						login_42: userInfo.data.login,
						username: 'nlaronch',
						rank: 0,
						nbVictory: 0,
						nbDefeat: 0,
						avatar: userInfo.data.image_url,
						status: Status.OFFLINE,
					}
				})
			);
		} catch {
			return res(ctx.status(404), ctx.json({ message: 'Error of connection' }));
		}
	}),

	rest.post('/auth/2fa/login', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data)
		const otpToken = data.otpToken;
		/*const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD';
		const token = totp.generate(secret);
		const token = authenticator.generate(secret);
		try {
			authenticator.check(otpToken, secret);
		} catch (err) {
			return res(ctx.status(403), ctx.json({ message: `code is not valid` }));
		}*/
		if (otpToken)
			return res(ctx.status(200), ctx.json({ token: 'fake-jwt-token' }));
		else
			return res(ctx.status(403), ctx.json({ message: `code is not valid` }));
	}),

	rest.get('/auth/2fa/enable', (req, res, ctx) => {
		const data = generateQRCode();
		console.log(data);
		return res(ctx.set('Content-Length', 'image/png'), ctx.json(data));
	}),

	rest.get('/auth/2fa/disable', (req, res, ctx) => {
		return res(ctx.status(200));
	}),

	rest.get('/auth/2fa/qr-code', (req, res, ctx) => {
		const data = generateQRCode();
		console.log(data);
		return res(ctx.set('Content-Length', 'image/png'), ctx.json(data));
	}),
];
