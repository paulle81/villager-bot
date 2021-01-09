const mongoose = require('mongoose');

module.exports = async () => {
    await mongoose.connect(process.env.MONGO_PATH, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    return mongoose;
};