
export enum NotificationType {
	UNKNOWN,
	FRIEND_REQUEST,
	MATCH_REQUEST,
}

export default interface Notification {
	id: number,
	from_user_id: number
	date: string,
	message: string,
	type: NotificationType,
}

