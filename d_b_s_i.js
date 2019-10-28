const db = require('./db_helper');
var atob = require('atob');
const discord = require('./discord_bot_client');
const Discord = require('discord.js');
var auth = require('./auth.json');
let client = new Discord.Client();

var db_helper = db();

discord();

