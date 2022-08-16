import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { isEquals } from './utils/utils';

describe('AppController', () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe('root', () => {
		it('test utils function', () => {

			let test1 = {id: 42, name: "tglory"};
			let test2 = {id: 42, name: "tglory"};
			expect(isEquals(test1, test2)).toBe(true);
		
			test1 = {id: 41, name: "tglory"};
			test2 = {id: 42, name: "tglory"};
			expect(isEquals(test1, test2)).toBe(false);
		
			test1 = null;
			test2 = null;
			expect(isEquals(test1, test2)).toBe(true);
		
			test1 = null;
			test2 = {id: 42, name: "tglory"};
			expect(isEquals(test1, test2)).toBe(false);
		
			test1 = {id: 42, name: "tglory"};
			test2 = null;
			expect(isEquals(test1, test2)).toBe(false);

			test1 = {id: 42, name: "tglory"};
			let test3 = {id: 42};
			expect(isEquals(test1, test3)).toBe(false);

			let test4 = {id: 42, name: "tglory", email: "tglory@student.42Lyon.fr"};
			test3 = {id: 42};
			expect(isEquals(test4, test3)).toBe(false);
		});
	});
});
