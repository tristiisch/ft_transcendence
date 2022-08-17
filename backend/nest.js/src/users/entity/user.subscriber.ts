/** @prettier */
import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
	listenTo() {
		return User;
	}

	async afterLoad(user: User): Promise<void> {
		// user.getAvatar();
		// user.setAvatar();
	}
}
