const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true,
};

const mlcwSheetSchema = mongoose.Schema({
    _id: reqString,
    channelId: reqString,
    mlcwSheet: reqString,
});

module.exports = mongoose.model('mlcwSheet', mlcwSheetSchema);