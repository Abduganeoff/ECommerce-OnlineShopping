const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const scrypt = util.promisify(crypto.scrypt);

const Repository = require('./repository');


class UsersRepository extends Repository {

    async create(attrs) {
        attrs.userId = this.randomId();

        const records = await this.getAll();
        const salt = crypto.randomBytes(8).toString('hex');
        const bufferedHash = await scrypt(attrs.password, salt, 64);

        const record = {
            ...attrs,
            password: `${bufferedHash.toString('hex')}.${salt}`
        };

        records.push(record);

        await this.writeAll(records);

        return record;
    }

    async comparePasswords(saved, supplied) {
        const [hashed, salt] = saved.split('.');

        const suppliedBufHash = await scrypt(supplied, salt, 64);

        return hashed === suppliedBufHash.toString('hex');
    }
}

module.exports = new UsersRepository('users.json');

