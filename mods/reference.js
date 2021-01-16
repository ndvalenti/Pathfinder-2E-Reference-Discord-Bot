const Discord = require ('discord.js');
const config = require ('../config.json');
const limits = require ('../data/embedlimits.json');
const loc = require ('../' + config.locale);
const locale = loc.text.refembed;

class Reference {
    // Accepts raw json data and formats it to fit this class
    constructor(JSONBlock) 
    {
        this.name = JSONBlock.name;
        this.description = JSONBlock.description;
        this.action = JSONBlock.action;
    }

    // Takes the message of an issued command and a single instance of this class
    // and posts it as a formatted embed
    static PostReferenceResultEmbed(Message, Results) {
        if (Array.isArray(Results) && Results.length > 0) {
            return Results[0].PostReferenceAsEmbed(Message);
        } else {
            return null;
        }
    }

    // Passed from PostReferenceResultEmbed as an individual class object
    PostReferenceAsEmbed(Message) {
        const embed = new Discord.MessageEmbed();

        var desc = '';
        if (this.action !== undefined) {
            desc = '**' + locale.casttime + '** ' + this.action + '\n';
        }
        desc += this.description;
        var truncateddesc = desc;
        if (truncateddesc.length >= limits.fieldvalue) {
            truncateddesc = truncateddesc.substring(0, limits.fieldvalue - 4);
            truncateddesc += '...';
        }

        embed.setAuthor(this.name)
            .setThumbnail(Message.author.avatarURL())
            .setDescription(truncateddesc);

        var sent = Message.channel.send(embed).then(async sentEmbed => {
            // React to our own embed to allow users to receive full text
            // if it has been truncated
            var filterbuilder = [];

            if (config.allowfulltextreact === true) {
                if (this.description.length >= limits.fieldvalue - 1) {
                    filterbuilder.push('📝');
                    await sentEmbed.react('📝');
                }
            }

            // Only collect the proper reacts from non-self users
            const filter = (reaction, user) => {
                return filterbuilder.includes(reaction.emoji.name) && user.id === message.author.id;
            };

            sentEmbed.awaitReactions(filter, { max: 1, time: 60000, errors: ['time']})
                .then(collected => {
                    const reaction  = collected.first();

                    if (reaction.emoji.name === '📝') {
                        // Send the entire reference text through dms
                        // This may take several dms and can be disabled in the config
                        // Option only available if description was truncated
                        var substrlength = 0;
                        var s = '**' + this.name + '**\n' + desc;

                        // Prune output to dm char limit breaking at last line before limit reached
                        while (s.length > limits.dm - 1) {
                            substrlength = s.substring(0, limits.dm - 1).lastIndexOf(' ');
                            Message.author.send(s.substring(0, substrlength));
                            s = s.substring(substrlength, s.length);
                        }
                        Message.author.send(s);
                    }
                }).catch(() => {});
        });
        return sent;
    }
}

module.exports = Reference;