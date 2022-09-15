import type User from "./User";

export enum NotificationType {
	UNKNOWN,
	FRIEND_REQUEST,
	MATCH_REQUEST,
	FRIEND_ACCEPT,
	FRIEND_DECLINE
}

export default interface Notification {
	id: number,
	from_user?: User,
	from_user_id: number
	date: string,
	message: string,
	type: NotificationType,
}

