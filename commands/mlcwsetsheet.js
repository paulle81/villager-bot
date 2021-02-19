const mlcwSheetSchema = require('../schemas/mlcw-sheet-schema');

exports.run = async (_client, message) => {
    const { member, channel, content, guild } = message;

    if (!member.hasPermission('ADMINISTRATOR')) {
        channel.send('You do not have permissions to `mlcwSetSheet`');
        return;
    }

    let mlcwSheet = content;
    const split = mlcwSheet.split(' ');

    if (split.length < 3) {
        channel.send('Please provide your MLCW sheet');
        return;
    }

    mlcwSheet = split.pop();

    await mlcwSheetSchema.findOneAndUpdate(
        {
            _id: `mlcw${guild.id}`,
        },
        {
            _id: `mlcw${guild.id}`,
            channelId: channel.id,
            mlcwSheet,
        },
        {
            upsert: true,
        },
    );
    channel.send(`${mlcwSheet} is now set`);
};
