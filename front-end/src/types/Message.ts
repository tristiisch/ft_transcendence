export default interface Message {
	idMessage?: number,
	idChat?: number,
	idSender: number,
	message: string,
	send?: boolean,
	read: boolean,
	date: string,
	type?: string
}
