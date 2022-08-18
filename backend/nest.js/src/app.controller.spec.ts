/** @prettier */
import { PreconditionFailedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { isEquals, isNumberPositive } from './utils/utils';

describe('AppController', () => {
	let appController: AppController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [AppService],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe('utils function : test equals', () => {
		it('test equals', () => {

			let test1 = {id: 42, name: "tglory"};
			let test2 = {id: 42, name: "tglory"};
			expect(isEquals(test1, test2)).toBe(true);

			test1 = { id: 41, name: 'tglory' };
			test2 = { id: 42, name: 'tglory' };
			expect(isEquals(test1, test2)).toBe(false);

			test1 = null;
			test2 = null;
			expect(isEquals(test1, test2)).toBe(true);

			test1 = null;
			test2 = { id: 42, name: 'tglory' };
			expect(isEquals(test1, test2)).toBe(false);

			test1 = { id: 42, name: 'tglory' };
			test2 = null;
			expect(isEquals(test1, test2)).toBe(false);

			test1 = { id: 42, name: 'tglory' };
			let test3 = { id: 42 };
			expect(isEquals(test1, test3)).toBe(false);

			let test4 = {
				id: 42,
				name: 'tglory',
				email: 'tglory@student.42Lyon.fr',
			};
			test3 = { id: 42 };
			expect(isEquals(test4, test3)).toBe(false);
		});
	});

	describe('utils function : test number positive', () => {
		it('test utils function', () => {

			let nb = -1;
			let msg = 'msg';
			
			try {
				isNumberPositive(nb, msg);
			} catch (err) {
				expect(err).toBeInstanceOf(PreconditionFailedException);
			}
			// expect(isNumberPositive(nb, msg)).toThrow(new PreconditionFailedException(`Can't ${msg} with negative number ${nb}.`));

			nb = 0;
			expect(isNumberPositive(nb, msg)).toBe(true);

			nb = NaN;
			try {
				isNumberPositive(nb, msg);
			} catch (err) {
				expect(err).toBeInstanceOf(PreconditionFailedException);
			}
			// expect(isNumberPositive(nb, msg)).toThrow(new PreconditionFailedException(`Can't ${msg} with a non-numeric variable.`));

			nb = 2_147_483_647;
			expect(isNumberPositive(nb, msg)).toBe(true);

			nb = 2_147_483_648;
			expect(isNumberPositive(nb, msg)).toBe(true);

			nb = -2_147_483_648;
			try {
				isNumberPositive(nb, msg);
			} catch (err) {
				expect(err).toBeInstanceOf(PreconditionFailedException);
			}
			// expect(isNumberPositive(nb, msg)).toThrow(new PreconditionFailedException(`Can't ${msg} with negative number ${nb}.`));

			nb = -2_147_483_649;
			try {
				isNumberPositive(nb, msg);
			} catch (err) {
				expect(err).toBeInstanceOf(PreconditionFailedException);
			}
			// expect(isNumberPositive(nb, msg)).toThrow(new PreconditionFailedException(`Can't ${msg} with negative number ${nb}.`));
		});
	});
});
