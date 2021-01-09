const playerSchema = require('../schemas/player-schema');

exports.run = async (_client, message) => {
    const { member, channel, content } = message;
    let discordId = member.user.id;

    let playerTag = content;
    const split = playerTag.split(' ');

    if (split.length < 3) {
        channel.send('Please provide your playerTag');
        return;
    }

    if (split.length === 4) {
        if (!member.hasPermission('ADMINISTRATOR')) {
            channel.send('You do not have permissions to `addplayer` for other players');
            return;
        }

        playerTag = split[2];
        discordId = split.pop().match(/<@!([0-9]+)>/)[1];
    }
    else {
        playerTag = split.pop();
    }

    await playerSchema.findOneAndUpdate(
        {
            _id: playerTag,
        },
        {
            _id: playerTag,
            discordId,
        },
        {
            upsert: true,
        },
    );
    channel.send(`${playerTag} is now set for <@${discordId}>`);
};