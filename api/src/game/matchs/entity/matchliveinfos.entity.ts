export default interface MatchLiveInfos {
	room_socket: any,
	started: boolean,
	waiting: boolean,
	stopMatch: boolean,
	ballXPos: number,
	ballYPos: number,
	p1Ready: boolean,
	p2Ready: boolean,
	p1Pos: number,
	p2Pos: number
}