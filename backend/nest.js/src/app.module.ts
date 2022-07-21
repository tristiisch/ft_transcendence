import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule} from '@nestjs/serve-static';
import { join } from 'path';
import { PostgreModule } from './postgre/postgre.module';

@Module({
  imports: [

    /**
     * Controller for front (we won't used it)
     */
    /*ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../frontend/dist'),
    }),*/

    PostgreModule,
  ],
 controllers: [AppController],
 providers: [AppService],
})
export class AppModule {}
