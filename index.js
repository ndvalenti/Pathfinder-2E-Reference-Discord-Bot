const Discord = require ('discord.js');
const client = new Discord.Client();

const config = require ('./config.json');
const loc = require ('./' + config.locale);
const spelljson = require ('./' + config.spell);
const refjson = require ('./' + config.reference);

const Spell = require ('./mods/spell.js');
const Reference = require ('./mods/reference.js');
const DiceRoller = require ('./mods/diceroller.js');

const prefix = config.prefix;

// Arrays to hold the necessary reference information scraped from data files
var SpellArray = [];
var ConditionsArray = [];
var MonsterAbilityArray = [];
var WeaponTraitsArray = [];
var ExplorationArray = [];

client.on('ready', () => {
    CreateDataStructs();
    console.log('Failbot online');
});

client.on('message', async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Ignore messages that are not properly prefixed
    if (!message.content.startsWith(prefix)) return;

    // Confirm that this user has bot permissions in current context
    if (config.roles !== '') {
        if (message.channel.type !== 'dm') {
            if (!message.member.hasPermission([config.roles])) {
                return message.author.send(ApplyCodeBlockMarkdown(loc.text.permissionfail));
            }
        } else if (config.allowdm === false) {
            return;
        }
    }

    // Split the message into the command and arguments taken from loc (localization file set in config.json)
    const args = message.content.slice(prefix.length).split(/\s+/g);
    const cmd = args.shift().toLowerCase();

    switch(cmd) {
        // Help Command
        case loc.command.help.name:
        case loc.command.help.short:
            var HelpEmbed = new Discord.MessageEmbed();
            var helpcmd;

            // Match arguments to a specific command and display its help text
            // If no or unmatching arguments are supplied display generic help instead
            // Individual commands will handle their own help text if no arguments are supplied
            if (args.length !== 0) {
                Object.values(loc.command).some(el => {
                    if (el.name === args[0] || el.short === args[0]) {
                        helpcmd = el;
                        HelpEmbed.setAuthor(loc.text.help).setDescription(ApplyCommandPrefixToLocalizedText(el.help));
                        return true;
                    }
                });
            }
            if (args.length === 0 || helpcmd === undefined) {
                HelpEmbed.setAuthor(loc.command.help.title).setDescription(ApplyCommandPrefixToLocalizedText(loc.command.help.text));
            }
            message.channel.send(HelpEmbed);
            break;

        // Roll Command
        case loc.command.roll.name:
        case loc.command.roll.short:
            if (args.length !== 0) {
                // Reformat args into a single string
                // As a rule we expect args to have already trimmed all whitespace into array separators so we don't have to worry about it here
                var rollstring = args.join('');
                var postresult = DiceRoller.RollStringAndPostAsEmbed(message, rollstring);

                if (postresult === null) {
                    message.channel.send(ApplyCodeBlockMarkdown(loc.command.roll.fail));
                }
            } else {
                var HelpEmbed = new Discord.MessageEmbed();
                HelpEmbed.setAuthor(loc.text.help).setDescription(ApplyCommandPrefixToLocalizedText(loc.command.roll.help));
                message.channel.send(HelpEmbed);
            }
            break;

        // Spell Lookup Command
        case loc.command.spell.name:
        case loc.command.spell.short:
            if (args.length !== 0) {
                var results = GetNameSearchResult(args, SpellArray);
                var postresult = Spell.PostSpellResultArrayAsEmbed(message, results);

                if (postresult === null) {
                    message.channel.send(ApplyCodeBlockMarkdown(loc.command.spell.fail));
                }
            } else {
                var HelpEmbed = new Discord.MessageEmbed();
                HelpEmbed.setAuthor(loc.text.help).setDescription(ApplyCommandPrefixToLocalizedText(loc.command.spell.help));
                message.channel.send(HelpEmbed);
            }
            break;
        
        // Condition Lookup Command
        case loc.command.condition.name:
        case loc.command.condition.short:
            if (args.length !== 0) {
                var results = GetNameSearchResult(args, ConditionsArray);
                var postresult = Reference.PostReferenceResultEmbed(message, results);

                if (postresult === null) {
                    message.channel.send(ApplyCodeBlockMarkdown(loc.command.condition.fail));
                }
            } else {
                var HelpEmbed = new Discord.MessageEmbed();
                HelpEmbed.setAuthor(loc.text.help).setDescription(ApplyCommandPrefixToLocalizedText(loc.command.condition.help));
                message.channel.send(HelpEmbed);
            }
            break;

        // Monster Ability Lookup Command
        case loc.command.monsterability.name:
        case loc.command.monsterability.short:
            if (args.length !== 0) {
                var results = GetNameSearchResult(args, MonsterAbilityArray);
                var postresult = Reference.PostReferenceResultEmbed(message, results);

                if (postresult === null) {
                    message.channel.send(ApplyCodeBlockMarkdown(loc.command.monsterability.fail));
                }
            } else {
                var HelpEmbed = new Discord.MessageEmbed();
                HelpEmbed.setAuthor(loc.text.help).setDescription(ApplyCommandPrefixToLocalizedText(loc.command.monsterability.help));
                message.channel.send(HelpEmbed);
            }
            break;

        // Weapon Trait Lookup Command
        case loc.command.weapontrait.name:
        case loc.command.weapontrait.short:
            if (args.length !== 0) {
                var results = GetNameSearchResult(args, WeaponTraitsArray);
                var postresult = Reference.PostReferenceResultEmbed(message, results);

                if (postresult === null) {
                    message.channel.send(ApplyCodeBlockMarkdown(loc.command.weapontrait.fail));
                }
            } else {
                var HelpEmbed = new Discord.MessageEmbed();
                HelpEmbed.setAuthor(loc.text.help).setDescription(ApplyCommandPrefixToLocalizedText(loc.command.weapontrait.help));
                message.channel.send(HelpEmbed);
            }
            break;

        // Exploration Action Lookup Command
        case loc.command.exploration.name:
        case loc.command.exploration.short:
            if (args.length !== 0) {
                var results = GetNameSearchResult(args, ExplorationArray);
                var postresult = Reference.PostReferenceResultEmbed(message, results);

                if (postresult === null) {
                    message.channel.send(ApplyCodeBlockMarkdown(loc.command.explorationaction.fail));
                }
            } else {
                var HelpEmbed = new Discord.MessageEmbed();
                HelpEmbed.setAuthor(loc.text.help).setDescription(ApplyCommandPrefixToLocalizedText(loc.command.exploration.help));
                message.channel.send(HelpEmbed);
            }
            break;

        // List Command
        case loc.command.list.name:
        case loc.command.list.short:
            if (args.length !== 0) {
                var listtarget = '';
                if (args.length > 0) {
                    listtarget = args[0].trim();
                }

                var result = BuildListEmbed(listtarget);
                message.channel.send(result);
            } else {
                var HelpEmbed = new Discord.MessageEmbed();
                HelpEmbed.setAuthor(loc.text.help).setDescription(ApplyCommandPrefixToLocalizedText(loc.command.list.help));
                message.channel.send(HelpEmbed);
            }
            break;

        // Invalid Command
        default:
            message.channel.send(ApplyCommandPrefixToLocalizedText(ApplyCodeBlockMarkdown(loc.command.default.text)));
            break;
    }
});

// Perform a fuzzy search of any Object SearchArray with a name member variable
// using args as the search term, then sort the results for relevance and return the array
function GetNameSearchResult(args, SearchArray) {
    const searchstr = args.join(' ').toLowerCase();
    var regexfilter = new RegExp(searchstr, 'i');
    var results = [];

    SearchArray.forEach(el => {
        if (el.name.match(regexfilter)) results.push(el);
    });

    // Improve search results somewhat by sorting results by the 
    // index of their match
    results.sort(function (a, b) {
        const a1 = a.name.toLowerCase().indexOf(searchstr);
        const b1 = b.name.toLowerCase().indexOf(searchstr);
        if (a1 < b1) return -1;
        if (b1 < a1) return 1;
        return 0;
    });

    return results;
}

// Build and return an embed where arg is a valid chat command
// The embed will contain a formatted list of all name values in the
// corresponding object array
function BuildListEmbed(arg) {
    const embed = new Discord.MessageEmbed();

    var title = '';
    var body = [];
    switch (arg) {
        case loc.command.condition.name:
        case loc.command.condition.short:
            title = loc.text.refembed.condition;
            ConditionsArray.forEach (el => { body.push(el.name); });
            break;
        case loc.command.monsterability.name:
        case loc.command.monsterability.short:
            title = loc.text.refembed.monsterability;
            MonsterAbilityArray.forEach (el => { body.push(el.name); });
            break;
        case loc.command.weapontrait.name:
        case loc.command.weapontrait.short:
            title = loc.text.refembed.weapontrait;
            WeaponTraitsArray.forEach (el => { body.push(el.name); });
            break;
        case loc.command.exploration.name:
        case loc.command.exploration.short:
            title = loc.text.refembed.explorationaction;
            ExplorationArray.forEach (el => { body.push(el.name); });
            break;
        default:
            return ApplyCodeBlockMarkdown(loc.command.list.fail);
    }
    title = title + ' ' + loc.text.refembed.list;
    embed.setAuthor(title).setDescription(ApplyCodeBlockMarkdown(body.join(', ')));
    return embed;
}

// Populate data arrays from json sources
function CreateDataStructs() {
    spelljson.forEach(el => {
        var spell = new Spell(el);
        SpellArray.push(spell);
    });
    SpellArray.sort(Spell.Compare);

    refjson.conditions.forEach(el => {
        var condition = new Reference(el);
        ConditionsArray.push(condition);
    });

    refjson.monsterabilities.forEach(el => {
        var monsterability = new Reference(el);
        MonsterAbilityArray.push(monsterability);
    });

    refjson.weapontraits.forEach(el => {
        var weapontrait = new Reference(el);
        WeaponTraitsArray.push(weapontrait);
    });

    refjson.exploration.forEach(el => {
        var exploration = new Reference(el);
        ExplorationArray.push(exploration);
    });
}

// Change any localized text to correctly display the prefix in config.json if it is not the default (!)
function ApplyCommandPrefixToLocalizedText(s) { 
    if (prefix === '!') return s;
    return s.replace(/\!/g, prefix); 
}

// Markdown string s as a codeblock and return it
function ApplyCodeBlockMarkdown(s) {
    return ('```' + s + '```');
}

client.login(config.token);