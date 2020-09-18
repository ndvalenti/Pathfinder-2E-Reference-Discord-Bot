# Pathfinder 2E Reference Bot

This bot is an unofficial basic diceroller and provider of lookup functionality for spells, conditions, monster abilities, weapon traits, and exploration actions using the Pathfinder 2E ruleset. It is designed to speed up combat and exploration specifically by providing ready access to the kinds of information players and GMs are most likely to need to reference during those play stages.

This bot was created for use in my own online games and comes as-is with no warranties or guarantees.

## Licensing Errata

The information referenced here as well as the Pathfinder brand are all created and owned by [Paizo](https://www.paizo.com). They are the original source of any information found in this application and as such are not responsible for misrepresentations, mistakes, or any other divergences contained herein.

This application is licensed under the MIT license and as such can be copied or reused under the terms of that license (full and precise information can be found in the LICENSE file). However the reference and spell data that is contained in the data folder is owned by Paizo and as such any use must adhere to [Paizo's community use guidelines](https://paizo.com/community/communityuse). This explicitly excludes, among other things, use in paid services or use in anything that might be construed as adult *at their discretion*. Please help keep great resources available to the community by following the spirit as well as the letter of their terms.

If you do end up using this project for anything let me know, I'd love to see what you do with it!

# Installation

This is a basic node.js discord bot. You must have node.js installed in order to execute the process.

Before use you must also install discord's dependency files to the installation folder.
**From the download directory:**
```
$ npm install discord.js --save
```

After this you must rename config_example.json to config.json and enter your developer token into the token field of the config. This token can be obtained token from your discord account's developer portal. You are responsible for your own tokens.

## Config options

The config options can be changed in config.json in the root folder

+ token: Default "", This is where you should enter your own developer token if you want to run this bot
+ prefix: Default "!", this is the symbol or group of symbols you want to enter to interact with the bot on Discord. In any localization files the prefix character can remain ! as the bot will handle the rest.
+ roles: Default "CREATE_INSTANT_INVITE", This is a list of roles required to use the bot (DMs are separate). If this is blank it will allow any user to interact with it
+ allowdm: Default true, if this is true it will allow any user to interact fully with the bot in their own direct messages
+ allownextprevreact: Default true, allows users to react to search results that returned more than one item to cycle through them
+ allowfulltextreact: Default true, allows users to react to search results that were truncated in order to receive the full text through DMs
+ locale: Default "loc/loc-en.json", the location of the localization file the program should use
+ spell: Default "data/spells.json", the location of the spell data file
+ reference: Default "data/reference.json", the location of the reference data file

Custom localization files are supported, simply use /loc/loc-en.json as a template and translate the values, keeping the keys the same.

The Spell and Reference files can also be modified or replaced. They require the same basic keys as is present in the data files included.

# FAQ

## Will you add x feature?

Probably not. This is a limited scope project to give myself a chance to play with Discord Bots and ES6 and was never intended to have any persistent storage nor track information about players (such as timezones or character sheets). In addition it's very easy to spam up text channels with too many features or commands. For most of these functions there are much better options on much better mediums out there. 

If you wish to expand it for other uses I'd say feel free, so long as you keep relevant licensing requirements in mind.

This is, of course, subject to change at any time.

## Why doesn't the roller do my special roll?

Pathfinder 2E uses mostly standard rolls with occasional fortune and misfortune modifiers. As most if not all of these modifiers involve either rerolling or replacing singular d20 results I found simulating these rolls to be way more work than just rerolling using the standard syntax. If you can present a good argument as to why I should change it to handle something special like exploding dice I'm all ears.

## Why doesn't this tool have Class/Feat/Item information?

This tool is merely a quick reference so combat and exploration doesn't get slowed down by the GM or Players leafing through their handbooks during their combat round. All the above information is stuff that mostly should be sorted in between sessions or during character downtime and as such is out of scope of the current project.

This tool was never meant to be a replacement for the Core Rulebook.

## I found a bug/typo.

Open a ticket! I'm sure they're out there and if I don't know about it I can't address it.

# The Data

Much of the data in this project was scraped and recreated using sources from [Pathfinder 2E Spell DB](https://github.com/fyjham-ts/Pathfinder-2E-Spell-DB/), another great Pathfinder 2E reference tool that allows offline browser access along with a phone app which I highly recommend checking out. As a result of this I only request that any users have any appropriate OGL and Community Use licensing in place before use.

# Official Usage Requirements

*Pathfinder 2E Reference Bot uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo's Community Use Policy ([paizo.com/communityuse]). We are expressly prohibited from charging you to use or access this content. Pathfinder 2E Reference Bot is not published, endorsed, or specifically approved by Paizo. For more information about Paizo Inc. and Paizo products, visit [paizo.com]*