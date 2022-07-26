import { rest } from 'msw';
import axios from 'axios';
import users from '@/data/users';
import matchs from '@/data/matchs';
import friends from '@/data/friends';

export default [

	rest.post('/user/:id', async (req, res, ctx) => {
		const data = await req.json();
		return res(ctx.status(200));
	}),

	rest.get('/users', (req, res, ctx) => {
		return res(ctx.json(users));
	}),

	rest.get('/user/:username', (req, res, ctx) => {
		return res(ctx.json(users.find((user) => user.username === req.params.username)));
	}),

	rest.get('/user/friends/:username', (req, res, ctx) => {
		return res(ctx.json(friends.get(req.params.username as string)));
	}),

	rest.post('/user/friend-request', async (req, res, ctx) => {
		const data = await req.json();
		const tab = friends.get(data.fromUser);
		if (tab) tab.push(data.friendUser);
		else friends.set(data.fromUser, data.friendUser);
		console.log(friends);
		return res(ctx.status(200));
	}),

	rest.post('/user/unfriend-request', async (req, res, ctx) => {
		const data = await req.json();
		const tab = friends.get(data.fromUser) as string[];
		for (let i = 0; i < tab.length; i++) {
			if (tab[i] === data.friendUser) tab.splice(i, 1);
		}
		console.log(friends);
		return res(ctx.status(200));
	}),

	rest.get('/matchs', (req, res, ctx) => {
		return res(ctx.json(matchs));
	}),

	rest.post('/login-request', async (req, res, ctx) => {
		const data = await req.json();
		if (data.code == '' || data.state !== import.meta.env.VITE_CLIENT_STATE) return res(ctx.status(400));
		console.log(data.code, data.state)
		const url = import.meta.env.VITE_OAUTH_URL;
		console.log(url)
		const postData = {
			grant_type: 'authorization_code',
			client_id: import.meta.env.VITE_CLIENT_ID,
			client_secret: import.meta.env.VITE_CLIENT_SECRET,
			code: data.code,
			redirect_uri: import.meta.env.VITE_REDIRECT_URI,
		};
		console.log(postData)
		const result = await axios
			.post(url, postData)
		console.log(result)
		const headersRequest = { 'Authorization': 'Bearer ' + result.data.access_token };
		const userInfo = await axios.get(import.meta.env.VITE_42_API_ME, { headers: headersRequest })
		console.log(userInfo)
		return res(ctx.json({
			id: userInfo.data.login,
			accessToken: 'fake-jwt-token',
			username: '',
			avatar: userInfo.data.image_url
		}));
		//return res(ctx.status(404));
	}),
];
