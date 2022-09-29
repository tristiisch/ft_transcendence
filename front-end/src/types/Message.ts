import type MessageType from '@/types/MessageType';

export default interface Message {
	idMessage?: number,
	idChat?: number,
	idSender: number,
	avatarSender: string,
	usernameSender: string, 
	message: string,
	send?: boolean,
	read: boolean,
	date: Date,
	type: MessageType,
	canUseButton: boolean 
}
