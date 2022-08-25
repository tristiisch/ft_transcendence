/** @prettier */
import { User } from 'src/users/entity/user.entity';

export class NotificationFront {
	id: number;
	from_user_id: number;
	message: string;
	date: string;
}
