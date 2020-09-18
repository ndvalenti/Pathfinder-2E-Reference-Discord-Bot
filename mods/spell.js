const Discord = require ('discord.js');
const config = require ('../config.json');
const limits = require ('../data/embedlimits.json');
const loc = require ('../' + config.locale);
const locale = loc.text.spellembed;

class Spell {
    // Accepts raw json data and formats it to fit this class
    constructor(JSONBlock)
    {
        this.nethysUrl = JSONBlock.nethysUrl;
        this.name = JSONBlock.name;
        this.traits = JSONBlock.traits;
        this.type = JSONBlock.type;
        this.level = JSONBlock.level;
        this.source = JSONBlock.source;
        this.components = JSONBlock.components;
        this.action = JSONBlock.action;
        this.trigger = JSONBlock.trigger;
        this.area = JSONBlock.area;
        this.description = JSONBlock.description;
        this.range = JSONBlock.range;
        this.targets = JSONBlock.targets;
        this.duration = JSONBlock.duration;
        this.savingthrow = JSONBlock.savingthrow;
        this.requirements = JSONBlock.requirements;
        this.traditions = JSONBlock.traditions;
        this.cost = JSONBlock.cost;
        this.effect = JSONBlock.effect;
    }

    // Compare function for .sort() implementation
    // Does not ignore upper and lowercase
    static Compare (A, B) {
        if (A.name < B.name) return -1;
        if (A.name > B.name) return 1;
        return 0;
    }

    // Takes the message of an issued command and an array of Spell objects, 
    // formats it into an embed, and posts the resultant embed at index into discord
    // returns a pointer to the embed if successful or null if failed
    static PostSpellResultArrayAsEmbed(Message, ResultsArray, Index = 0) {
        if (Array.isArray(ResultsArray) && ResultsArray.length > 0) {
            return ResultsArray[Index].PostSpellAsEmbed(Message, ResultsArray, Index);
        } else {
            return null;
        }
    }

    // Passed from PostSpellResultEmbed as an individual class object
    PostSpellAsEmbed(Message, ResultsArray, Index) {
        const embed = new Discord.MessageEmbed();

        var title = this.name + ' (' + this.type + ' ' + this.level + ')';
        var author = locale.spelllookup;
        var attname = locale.attributes;
        var descname = locale.description;
        var description = this.source;
        var url = this.nethysUrl;
        var attributesblock = this.AttributeBuilder();
        var descriptionblock = this.DescriptionBuilder();
        var truncatedattributesblock = attributesblock;
        var truncateddescriptionblock = descriptionblock;
        var footer = '';
        if (ResultsArray.length > 1 && config.allownextprevreact) {
            footer += locale.result + ' ' + (Index + 1) + ' ' + locale.of + ' ' + ResultsArray.length;
        }

        // Discord's embed limits are defined at https://discordjs.guide/popular-topics/embeds.html#editing-the-embedded-message-content
        // Trim content as necessary, limits defined in embedlimits.json
        if (title.length >= limits.title) {
            title = title.substring(0, limits.title - 4);
            title += '...';
        }
        if (description.length >= limits.description) {
            description = description.substring(0, limits.description - 4);
            description += '...';
        }
        if (attname.length >= limits.fieldname) {
            attname = attname.substring(0, limits.fieldname - 4);
            attname += '...';
        }
        if (descname.length >= limits.fieldname) {
            descname = descname.substring(0, limits.fieldname - 4);
            descname += '...';
        }
        if (truncatedattributesblock.length >= limits.fieldvalue) {
            truncatedattributesblock = truncatedattributesblock.substring(0, limits.fieldvalue - 4);
            truncatedattributesblock += '...';
        }
        if (truncateddescriptionblock.length >= limits.fieldvalue) {
            truncateddescriptionblock = truncateddescriptionblock.substring(0, limits.fieldvalue - 4);
            truncateddescriptionblock += '...';
        }
        if (footer.length >= limits.footer) {
            footer = footer.substring(0, limits.footer - 4);
            footer += '...';
        }
        if (author.length >= limits.author) {
            author = author.substring(0, limits.author - 4);
            author += '...';
        }
        var total = title.length + description.length + attname.length + descname.length + 
            truncatedattributesblock.length + truncateddescriptionblock.length + footer.length + author.length + url.length;
        if (total.length > limits.total) {
            description = description.substring(0, limits.total - description.length - 4);
            description += '...';
        }

        embed.setAuthor(author)
            .setTitle(title)
            .setThumbnail(Message.author.avatarURL())
            .setURL(url)
            .setDescription(description)
            .setFooter(footer)
            .addFields(
                { name: attname, value: truncatedattributesblock },
                { name: descname, value: truncateddescriptionblock }
            );
            
        
        var sent = Message.channel.send(embed).then(async sentEmbed => {
            // React to our own embed to allow for easy modification
            // Pencil to DM untruncated post, left and right to scroll through results
            // This will delete and resend embed and can be considered
            // api spam if overused, can be disabled in config if necessary
            var filterbuilder = [];

            if (config.allowfulltextreact === true) {
                if (descriptionblock.length >= limits.fieldvalue - 1) {
                    filterbuilder.push('📝');
                    await sentEmbed.react('📝');
                }
            }
            if (config.allownextprevreact === true) {
                if (Index !== 0) {
                    filterbuilder.push('⬅️');
                    await sentEmbed.react('⬅️');
                }
                if (Index !== ResultsArray.length -1) {
                    filterbuilder.push('➡️');
                    await sentEmbed.react('➡️');
                }
            }

            // Only collect the proper reacts from non-self users
            const filter = (reaction, user) => {
                return filterbuilder.includes(reaction.emoji.name) && user.id === Message.author.id;
            };

            sentEmbed.awaitReactions(filter, { max: 1, time: 60000, errors: ['time']})
                .then(collected => {
                    const reaction = collected.first();

                    // React and collect reactions to resubmit other search results or get full text dm
                    if (reaction.emoji.name === '⬅️') {
                        if (Index !== 0) {
                            Index -= 1;
                            ResultsArray[Index].PostSpellAsEmbed(Message, ResultsArray, Index);
                            sentEmbed.delete();
                        }
                    } else if (reaction.emoji.name === '➡️') {
                        if (Index !== ResultsArray.length - 1) {
                            Index += 1;
                            ResultsArray[Index].PostSpellAsEmbed(Message, ResultsArray, Index);
                            sentEmbed.delete();
                        }
                    } else if (reaction.emoji.name === '📝') {
                        // Send the entire spell text through dms
                        // This will take several dms and can be api spam if used too often
                        // Option only available if description was truncated
                        // Nothing else has a valid reason to be truncated
                        var substrlength = 0;
                        var s = title + '\n' 
                                + '**' + attname + '**' + '\n'
                                + attributesblock + '\n'
                                + '**' + descname + '**' + '\n'
                                + descriptionblock + '\n'
                                + url;

                        // Prune output to dm char limit breaking at last line before limit reached
                        while (s.length > limits.dm - 1) {
                            // Try to break at a line break, but settle for a space if there isn't one in range
                            substrlength = s.substring(0, limits.dm - 1).lastIndexOf('\n');
                            if (substrlength > limits.dm - 1) {
                                substrlength = s.substring(0, limits.dm - 1).lastIndexOf(' ');
                            }
                            Message.author.send(s.substring(0, substrlength));
                            s = s.substring(substrlength, s.length);
                        }
                        Message.author.send(s);
                    }

                }).catch(() => {});
                
        });
        return sent;
    }

    AttributeBuilder() {
        var result = '';
        var inline = false;
        
        if (Array.isArray(this.traits) && this.traits.length > 0) {
            result += this.traits.join(', ') + '\n\n';
        }
        if (Array.isArray(this.traditions) && this.traditions.length > 0) {
            result += '**' + locale.traditions + '** ' + this.traditions.join(', ') + '\n';
        }
    
        if (Array.isArray(this.action) && this.action.length > 0) {
            result += '**' + locale.casttime + '** ' + this.action.join(' ' + locale.to + ' ');
            inline = true;
        } else if (typeof this.action !== 'undefined') {
            result += '**' + locale.casttime + '** ' + this.action;
            inline = true;
        }
    
        if (typeof this.cast !== 'undefined') {
            result += ' (' + this.cast + ')';
        }
        if (inline) {
            result += '\n';
        }
        inline = false;
    
        if (typeof this.trigger !== 'undefined') {
            result += '**' + locale.trigger + '** ' + this.trigger;
            inline = true;
        }
        if (typeof this.range !== 'undefined') {
            if (inline) {
                result += '; ';
            }
            result += '**' + locale.range + '** ' + this.range;
            inline = true;
        }
        if (typeof this.area !== 'undefined') {
            if (inline) {
                result += '; ';
            }
            result += '**' + locale.area + '** ' + this.area;
            inline = true;
        }
        if (typeof this.targets !== 'undefined') {
            if (inline) {
                result += '; ';
            }
            result += '**' + locale.targets + '** ' + this.targets;
            inline = true;
        }
        if (typeof this.duration !== 'undefined') {
            if (inline) {
                result += '; ';
            }
            result += '**' + locale.duration + '** ' + this.duration;
            inline = true;
        }
        if (inline) {
            result += '\n';
        }
        inline = false;
    
        if (typeof this.requirements !== 'undefined') {
            result += '**' + locale.requirements + '** ' + this.requirements;
            inline = true;
        }
        if (typeof this.cost !== 'undefined') {
            if (inline) {
                result += '; ';
            }
            result += '**' + locale.cost + '** ' + this.cost;
            inline = true;
        }
        if (inline) {
            result += '\n';
            inline = false;
        }
    
        if (typeof this.savingthrow !== 'undefined') {
            result += '**' + locale.savingthrow + '** ' + this.savingthrow + '\n';
        }
        return result;
    }

    DescriptionBuilder() {
        var result = '';
        if (typeof this.description !== 'undefined') {
            result += this.description + '\n';
        }
        if (typeof this.effect !== 'undefined') {
            result += '**' + this.name + ' ' + locale.effect + '** ' + this.effect + '\n';
        }
        return result;
    }
}

module.exports = Spell;