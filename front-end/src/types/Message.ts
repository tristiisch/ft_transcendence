export default interface Message {
	idMessage?: number,
	idChat?: number,
	date: string,
	message: string,
	idSender: number
	read: boolean,
	type?: string
}
