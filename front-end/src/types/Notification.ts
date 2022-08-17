export enum NotificationType {
	UNKNOWN,
	FRIEND_REQUEST,
	MATCH_REQUEST,
}

export default interface Notification {
	date: string,
	from: string,
	Request: NotificationType,
}

