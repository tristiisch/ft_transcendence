export default interface Message {
	idMessage?: number,
	idChat?: number,
	date: string,
	message: string,
	idSender: number
	send?: boolean,
	read: boolean,
	type?: string
}
