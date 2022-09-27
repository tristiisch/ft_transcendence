/** @prettier */
import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { UserAuth } from './user-auth.entity';

@EventSubscriber()
export class UserAuthSubscriber implements EntitySubscriberInterface<UserAuth> {
	listenTo() {
		return UserAuth;
	}

	async afterLoad(user: UserAuth): Promise<void> {
		user.has_2fa = user.twoFactorSecret != null;
	}
}
