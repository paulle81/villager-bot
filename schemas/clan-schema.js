const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
};

const clanSchema = mongoose.Schema({
    _id: reqString,
    channelId: reqString,
    clanTag: reqString,
});

module.exports = mongoose.model('clans', clanSchema);