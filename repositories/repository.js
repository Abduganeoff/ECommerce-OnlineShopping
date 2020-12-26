const fs = require('fs');
const crypto = require('crypto');

module.exports = class Repository {
    constructor (fileName) {
        if (!fileName) {
            throw new Error("User repository requires a fileName");
        }

        this.fileName = fileName;

        try {
            fs.accessSync(this.fileName);
        } catch (err) {
            fs.writeFileSync(this.fileName, '[]');
        }
    }

    async getAll() {
        return JSON.parse(await fs.promises.readFile(this.fileName));
    }

    async create(attrs) {
        attrs.userId = this.randomId();

        const records = await this.getAll();
        records.push(attrs);

        await this.writeAll(records);

        return attrs;
    }

    async writeAll(records) {
        await fs.promises.writeFile(this.fileName, JSON.stringify(records, null, 2));
    }

    randomId() {
        return crypto.randomBytes(4).toString('hex');
    }

    async getOne(id) {
        const records = await this.getAll();

        return records.find(x => x.userId === id);
    }

    async delete(id) {
        const records = await this.getAll();
        const deletedRecords = records.filter(x => x.userId !== id);
        await this.writeAll(deletedRecords);
    }

    async update(id, attrs) {
        const records = await this.getAll();
        const record = records.find(x => x.userId === id);

        if (!record) {
            throw new Error(`Record with id ${id} not found`);
        }

        Object.assign(record, attrs);

        await this.writeAll(records);
    }

    async getOneBy(filters) {
        const records = await this.getAll();

        for (let record of records) {
            let flag = true;

            for (let key in filters) {
                if (record[key] !== filters[key]) {
                    flag = false;
                }
            }

            if (flag) {
                return record;
            }
        }
    }
    
}