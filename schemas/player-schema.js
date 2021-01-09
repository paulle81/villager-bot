const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
};

const playerSchema = mongoose.Schema({
    _id: reqString,
    discordId: reqString,
});

module.exports = mongoose.model('player', playerSchema);