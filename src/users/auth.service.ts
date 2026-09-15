import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { promisify } from 'util';
import { randomBytes, scrypt } from 'crypto';

const promisifiedScrypt = promisify(scrypt); // scrypt is a callback-based function, so we need to promisify it to use async/await

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signup(email: string, password: string) {
    // check if email is in use
    const user = await this.userService.find(email);
    if (user.length) {
      throw new BadRequestException('Email is already in use');
    }

    // generate a salt
    const salt = randomBytes(8).toString('hex');
    // generate a hash
    const hash = (await promisifiedScrypt(password, salt, 32)) as Buffer;
    // join the salt and hash together
    const result = salt + '.' + hash.toString('hex');

    // create a new user
    return this.userService.create(email, result);
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = (await promisifiedScrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid email or password');
    }

    return user;
  }
}
