const express = require('express');
const router = express.Router();
const Credential = require('../models/Credential');
const auth = require('../middleware/auth');

// @route GET api/vault
// @desc Get all user credentials
router.get('/', auth, async (req, res) => {
    try {
        const credentials = await Credential.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(credentials);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route POST api/vault
// @desc Add new credential
router.post('/', auth, async (req, res) => {
    try {
        const { encryptedSite, siteIv, encryptedUsername, usernameIv, encryptedPassword, passwordIv } = req.body;

        const newCredential = new Credential({
            userId: req.user.id,
            encryptedSite,
            siteIv,
            encryptedUsername,
            usernameIv,
            encryptedPassword,
            passwordIv
        });

        const credential = await newCredential.save();
        res.json(credential);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route DELETE api/vault/:id
// @desc Delete credential
router.delete('/:id', auth, async (req, res) => {
    try {
        const credential = await Credential.findById(req.params.id);

        if (!credential) {
            return res.status(404).json({ message: 'Credential not found' });
        }

        // Make sure user owns credential
        if (credential.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Credential.findByIdAndDelete(req.params.id);
        res.json({ message: 'Credential removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
