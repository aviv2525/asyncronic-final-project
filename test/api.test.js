const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/user');
const Cost = require('../models/cost');


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

describe('POST /api/add', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await User.deleteMany();
        await Cost.deleteMany();

        // יצירת משתמש לבדיקה
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

    it('should add a cost item for an existing user', async () => {
        const costItem = {
            userid: 123123,
            description: 'coffee',
            category: 'food',
            sum: 15
        };

        const res = await request(app)
            .post('/api/add')
            .send(costItem);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.userid).toBe(123123);
        expect(res.body.description).toBe('coffee');
        expect(res.body.category).toBe('food');
        expect(res.body.sum).toBe(15);
    });
});

describe('GET /api/users/:id', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await User.deleteMany();
        await Cost.deleteMany();

        // משתמש לבדיקה
        await User.create({
            id: 123123,
            first_name: 'mosh',
            last_name: 'israeli',
            birthday: new Date('1990-01-01'),
            marital_status: 'single'
        });

        // הוספת שתי הוצאות
        await Cost.create([
            { userid: 123123, description: 'milk', category: 'food', sum: 10 },
            { userid: 123123, description: 'book', category: 'education', sum: 30 }
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return user details and total cost', async () => {
        const res = await request(app).get('/api/users/123123');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 123123);
        expect(res.body).toHaveProperty('first_name', 'mosh');
        expect(res.body).toHaveProperty('last_name', 'israeli');
        expect(res.body).toHaveProperty('total', 40); // 10 + 30
    });
});

describe('GET /api/report', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
        await User.deleteMany();
        await Cost.deleteMany();

        // משתמש לבדיקה
        await User.create({
            id: 123123,
            first_name: 'mosh',
            last_name: 'israeli',
            birthday: new Date('1990-01-01'),
            marital_status: 'single'
        });

        // הוצאות עבור חודש מאי 2025
        await Cost.create([
            {
                userid: 123123,
                description: 'gym',
                category: 'sport',
                sum: 50,
                date: new Date('2025-05-12')
            },
            {
                userid: 123123,
                description: 'groceries',
                category: 'food',
                sum: 80,
                date: new Date('2025-05-20')
            }
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should return a monthly report grouped by category', async () => {
        const res = await request(app).get('/api/report?id=123123&year=2025&month=5');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('userid', 123123);
        expect(res.body).toHaveProperty('year', 2025);
        expect(res.body).toHaveProperty('month', 5);
        expect(Array.isArray(res.body.costs)).toBe(true);

        const foodCategory = res.body.costs.find(cat => cat.food);
        const sportCategory = res.body.costs.find(cat => cat.sport);

        expect(foodCategory.food[0]).toMatchObject({
            sum: 80,
            description: 'groceries',
            day: 20
        });

        expect(sportCategory.sport[0]).toMatchObject({
            sum: 50,
            description: 'gym',
            day: 12
        });
    });
});
