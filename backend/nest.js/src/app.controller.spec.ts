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
		it('test equals 1', () => {
			const test1 = { id: 42, name: 'tglory' };
			const test2 = { id: 42, name: 'tglory' };
			expect(isEquals(test1, test2)).toBe(true);
			expect(isEquals(test2, test1)).toBe(true);
		});
		it('test equals 2', () => {
			const test1 = { id: 41, name: 'tglory' };
			const test2 = { id: 42, name: 'tglory' };
			expect(isEquals(test1, test2)).toBe(false);
			expect(isEquals(test2, test1)).toBe(false);
		});
		it('test equals 3', () => {
			const test1 = null;
			const test2 = null;
			expect(isEquals(test1, test2)).toBe(true);
			expect(isEquals(test2, test1)).toBe(true);
		});
		it('test equals 3', () => {
			const test1 = null;
			const test2 = { id: 42, name: 'tglory' };
			expect(isEquals(test1, test2)).toBe(false);
			expect(isEquals(test2, test1)).toBe(false);
		});
		it('test equals 4', () => {
			const test1 = { id: 42, name: 'tglory' };
			const test2 = null;
			expect(isEquals(test1, test2)).toBe(false);
			expect(isEquals(test2, test1)).toBe(false);
		});
		it('test equals 4', () => {
			const test1 = { id: 42, name: 'tglory' };
			const test2 = { id: 42 };
			expect(isEquals(test1, test2)).toBe(false);
			expect(isEquals(test2, test1)).toBe(false);
		});
		it('test equals 5', () => {
			const test1 = {
				id: 42,
				name: 'tglory',
				email: 'tglory@student.42Lyon.fr',
			};
			const test2 = { id: 42 };
			expect(isEquals(test1, test2)).toBe(false);
			expect(isEquals(test2, test1)).toBe(false);
		});
	});

	describe('utils function : test number positive', () => {
		it('test utils function 1', () => {
			const nb = -1;
			const msg = 'msg';
			try {
				isNumberPositive(nb, msg);
			} catch (err) {
				expect(err).toBeInstanceOf(PreconditionFailedException);
			}
		});
		it('test utils function 2', () => {
			const msg = 'msg';
			const nb = 0;
			expect(isNumberPositive(nb, msg)).toBe(true);
		});
		it('test utils function 3', () => {
			const msg = 'msg';
			const nb = NaN;
			try {
				isNumberPositive(nb, msg);
			} catch (err) {
				expect(err).toBeInstanceOf(PreconditionFailedException);
			}
		});
		it('test utils function 4', () => {
			const msg = 'msg';
			const nb = 2_147_483_647;
			expect(isNumberPositive(nb, msg)).toBe(true);
		});
		it('test utils function 5', () => {
			const msg = 'msg';
			const nb = 2_147_483_648;
			expect(isNumberPositive(nb, msg)).toBe(true);
		});
		it('test utils function 6', () => {
			const msg = 'msg';
			const nb = -2_147_483_648;
			try {
				isNumberPositive(nb, msg);
			} catch (err) {
				expect(err).toBeInstanceOf(PreconditionFailedException);
			}
		});
		it('test utils function 7', () => {
			const msg = 'msg';
			const nb = -2_147_483_649;
			try {
				isNumberPositive(nb, msg);
			} catch (err) {
				expect(err).toBeInstanceOf(PreconditionFailedException);
			}
		});
	});
});
