const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // All these fields will be encrypted in the frontend before sending
    encryptedSite: {
        type: String,
        required: true
    },
    siteIv: {
        type: String,
        required: true
    },
    encryptedUsername: {
        type: String,
        required: true
    },
    usernameIv: {
        type: String,
        required: true
    },
    encryptedPassword: {
        type: String,
        required: true
    },
    passwordIv: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Credential', CredentialSchema);
