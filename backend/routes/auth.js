const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route POST api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, loginPassword, encryptedVaultToken, vaultTokenIv, vaultTokenSalt } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedLoginPassword = await bcrypt.hash(loginPassword, salt);

        user = new User({
            email,
            loginPassword: hashedLoginPassword,
            encryptedVaultToken,
            vaultTokenIv,
            vaultTokenSalt
        });

        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route POST api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, loginPassword } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(loginPassword, user.loginPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                vaultMeta: {
                    encryptedVaultToken: user.encryptedVaultToken,
                    vaultTokenIv: user.vaultTokenIv,
                    vaultTokenSalt: user.vaultTokenSalt
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route GET api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-loginPassword');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
