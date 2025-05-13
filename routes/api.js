const express = require('express');
const router = express.Router();
const Cost = require('../models/cost');
const User = require('../models/user');


// POST /api/add
router.post('/add', async (req, res) => {
    try {
        const { userid, description, category, sum, date } = req.body;

        if (!userid || !description || !category || !sum) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newCost = new Cost({
            userid,
            description,
            category,
            sum,
            date: date || Date.now()
        });

        const savedCost = await newCost.save();
        res.status(201).json(savedCost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/report?id=123123&year=2025&month=5
router.get('/report', async (req, res) => {
    try {
        const { id, year, month } = req.query;

        if (!id || !year || !month) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1); // תחילת החודש הבא

        const costs = await Cost.find({
            userid: Number(id),
            date: {
                $gte: startDate,
                $lt: endDate
            }
        });

        const categories = ['food', 'health', 'housing', 'sport', 'education'];

        const grouped = categories.map(category => {
            const items = costs
                .filter(cost => cost.category === category)
                .map(cost => ({
                    sum: cost.sum,
                    description: cost.description,
                    day: new Date(cost.date).getDate()
                }));
            return { [category]: items };
        });

        res.json({
            userid: Number(id),
            year: Number(year),
            month: Number(month),
            costs: grouped
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/:id
router.get('/users/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        // שלב 1: שליפת המשתמש
        const user = await User.findOne({ id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // שלב 2: שליפת כל ההוצאות שלו
        const costs = await Cost.find({ userid: id });

        // חישוב סך ההוצאות
        const total = costs.reduce((sum, cost) => sum + cost.sum, 0);

        res.json({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            total
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/addUser — מוסיף משתמש (לבדיקה בלבד)
router.post('/addUser', async (req, res) => {
    try {
        const { id, first_name, last_name, birthday, marital_status } = req.body;

        if (!id || !first_name || !last_name || !birthday || !marital_status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newUser = new User({
            id,
            first_name,
            last_name,
            birthday: new Date(birthday),
            marital_status
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/about
router.get('/about', async (req, res) => {
    try {
        const team = await User.find({}, { _id: 0, first_name: 1, last_name: 1 });
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
