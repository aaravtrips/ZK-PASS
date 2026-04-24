const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    loginPassword: {
        type: String,
        required: true
    },
    // The test string "vault-check" encrypted with a key derived from Master Password
    encryptedVaultToken: {
        type: String,
        required: true
    },
    vaultTokenIv: {
        type: String,
        required: true
    },
    vaultTokenSalt: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
