import type Notification from '@/types/Notification';
import { NotificationType } from '@/types/Notification';

const notifications = new Map<number, Notification[]>([
	[
		1,
		[
			{
				date: 'Sep 5, 2018 12:32:28',
				from: 'Boromir',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 12:33:23',
				from: 'Aragorn',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 2, 2018 10:20:17',
				from: 'Frodon',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 18:13:14',
				from: 'Gandalf',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 23:33:05',
				from: 'Legolas',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 5, 2018 12:32:28',
				from: 'Boromir',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 12:33:23',
				from: 'Aragorn',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 2, 2018 10:20:17',
				from: 'Frodon',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 18:13:14',
				from: 'Gandalf',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 23:33:05',
				from: 'Legolas',
				Request: NotificationType.FRIEND_REQUEST,
			},
		],
	],
	[
		6,
		[
			{
				date: 'Sep 5, 2018 12:32:28',
				from: 'Boromir',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 12:33:23',
				from: 'Aragorn',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 2, 2018 10:20:17',
				from: 'Frodon',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 18:13:14',
				from: 'Gandalf',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 23:33:05',
				from: 'Legolas',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 5, 2018 12:32:28',
				from: 'Boromir',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 12:33:23',
				from: 'Aragorn',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 2, 2018 10:20:17',
				from: 'Frodon',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 18:13:14',
				from: 'Gandalf',
				Request: NotificationType.FRIEND_REQUEST,
			},
			{
				date: 'Sep 1, 2018 23:33:05',
				from: 'Legolas',
				Request: NotificationType.FRIEND_REQUEST,
			},
		],
	],
]);

export default notifications;
