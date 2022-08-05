import { forwardRef, Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entity/friendship.entity';

@Module({
	imports: [UsersModule, TypeOrmModule.forFeature([Friendship])],
	providers: [FriendsService],
	controllers: [FriendsController]
})
export class FriendsModule {}
