import { forwardRef, Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [UsersModule],
	providers: [FriendsService],
	controllers: [FriendsController]
})
export class FriendsModule {}
