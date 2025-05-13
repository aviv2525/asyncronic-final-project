const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/user');

describe('GET /api/about', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await User.deleteMany(); // ננקה משתמשים קודמים
        await User.create({
            id: 123123,
            first_name: 'mosh',
            last_name: 'israeli',
            birthday: new Date('1990-01-01'),
            marital_status: 'single'
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return an array (even empty)', async () => {
        const res = await request(app).get('/api/about');
        console.log('RESPONSE:', res.body); // debug
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('first_name');
            expect(res.body[0]).toHaveProperty('last_name');
        }
    });
});
