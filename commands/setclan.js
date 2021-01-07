const mongo = require('../modules/mongo');
const clanSchema = require('../schemas/clan-schema');

const cache = {};

exports.run = async (_client, message) => {
    const { member, channel, content, guild } = message;

    if (!member.hasPermission('ADMINISTRATOR')) {
        channel.send('You do not have permissions to `setclan`');
        return;
    }

    let clanTag = content;
    const split = clanTag.split(' ');

    if (split.length < 3) {
        channel.send('Please provide your clantag');
        return;
    }

    clanTag = split.pop();

    cache[guild.id] = [channel.id, clanTag];

    await mongo().then(async mongoose => {
        try {
            await clanSchema.findOneAndUpdate(
                {
                    _id: guild.id,
                },
                {
                    _id: guild.id,
                    channelId: channel.id,
                    clanTag,
                },
                {
                    upsert: true,
                },
            );
            channel.send(`${clanTag} is now set`);
        }
        finally {
            mongoose.connection.close();
        }
    });
};

// module.exports = cache;