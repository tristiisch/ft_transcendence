import { rest } from 'msw';
import users from "@/data/users";
import matchs from "@/data/matchs";
import friends from "@/data/friends";

export default [
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
		return res(
			ctx.json(matchs)
		);
	}),

	rest.post('/login-request', async (req, res, ctx) => {
		const data = await req.json();
		console.log(data);
		return res(ctx.status(200));
	}),
];
