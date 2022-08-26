
export enum NotificationType {
	UNKNOWN,
	FRIEND_REQUEST,
	MATCH_REQUEST,
}

export default interface Notification {
	id: number,
	from_userId: number
	date: string,
	message: string,
	type: NotificationType,
}

