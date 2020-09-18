const Discord = require ('discord.js');
const config = require ('../config.json');
const loc = require ('../' + config.locale);

// A utility class for taking rolls, formatting them, and then returning the resultant information
class DiceRoller {

    // Parses [-]xdy or [-]z formatted roll string RollString
    // and returns the result in the format
    // [total, [r1, r2, ...]]
    static Roll(RollString) {
        var result = [];
        var dice;
        var faces;
        var rollarray = [];
        var negative = false;
        var roll = RollString.toLowerCase();

        // If negative prune the sign and set our negative bool
        if (roll.includes('-')) {
            negative = true;
            roll = roll.substring(1);
        }

        // Ensure roll has only digits and a single d character
        var digittest = roll.match(/[^\d]+/g);
        if (digittest !== null) {
            if (digittest.length > 1) return null;
            else if (digittest[0] !== 'd') return null;
        }
        
        // Determine if this roll is an actual roll or just a constant
        if (isNaN(roll)) {
            // Get the number of dice and faces
            // Set the number of dice to 1 if omitted (eg d6 => 1d6)
            dice = roll.match(/\w+(?=d)/);
            if (dice === null) {
                dice = 1;
            }
            faces = roll.match(/(?<=d)\d+/);

            // Something is wrong with the input that we can't intuitively fix
            if (faces === null) return null;

            var total = 0;
            for (var i = 0; i < dice; i++) {
                var value = Math.floor(Math.random() * faces + 1);
                total += value;

                // Check if this is a crit roll and bold it if so
                if (value == faces) {
                    value = '**' + value + '**';
                }
                rollarray.push(value);
            }
            
            if (negative) { 
                total = -total;
            }
        } else {
            total = roll;
            if (negative) {
                total = -total;
            }
            rollarray.push(Array.of(total));
        }
        result.push(total);
        result.push(rollarray);

        return result;
    }

    // Takes a string representing a roll request, process it, and send an embed
    // formatted with its information
    // Return null if string malformed
    static RollStringAndPostAsEmbed(Message, RollString) {
        var rollarray = RollString.split(/([+-])/g);
        var rollresults = [];
        var resultarray = [];
        var runningtotal = 0;
        var malformed = false;

        // Parse string into an array of individual rolls retaining only '-' operator
        var currentarg = '';
        for (var i = 0; i < rollarray.length; i++) {
            if (rollarray[i] !== '') {
                if (rollarray[i] !== '+') {
                    currentarg += rollarray[i];
                }
                if ((rollarray[i] !== '+' && rollarray[i] !== '-') || i === rollarray.length - 1) {
                    rollresults.push(currentarg);
                    currentarg = '';
                }
            }
        }

        // Use Roll() to populate runningtotal and resultarray
        // Will abort and set malformed to true if Roll() ever fails
        malformed = rollresults.some(el => {
            var rollresult = this.Roll(el);

            // Returning true to immediately break the some() loop
            if (rollresult === null) return true;

            // At this point none of the values of rollarray can be assumed to be numeric
            runningtotal +=+ rollresult[0];
            resultarray.push(rollresult[1]);
            
        });
        if (!malformed) {
            return this.SendRollEmbed(Message, RollString, runningtotal, resultarray);
        } else {
            return null;
        }
    }

    // Take a Message and a source string for display purpose
    // a total value, and an array of roll values
    // and format, push, and return an embed using that information
    static SendRollEmbed(Message, SourceString, Total, RollArray) {
        var embed = new Discord.MessageEmbed();

        var stringbuilder = '**' + Total + '**   (';
        for (var i = 0; i < RollArray.length; i++) {
            stringbuilder += '[';
            stringbuilder += RollArray[i].join(', ');
            stringbuilder += ']';
            if (i != RollArray.length - 1) {
                stringbuilder += ' ';
            }
        }
        stringbuilder += ')';

        embed.setAuthor(loc.text.rollembed.diceroller)
            .setDescription(SourceString)
            .setThumbnail(Message.author.avatarURL())
            .addField(loc.text.rollembed.result, stringbuilder);

        return Message.channel.send(embed);
    }
}

module.exports = DiceRoller;