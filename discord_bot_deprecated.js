var http = require('http');
var discord = require('./discord_bot_helper');

http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.write('Discord bot for Black Order Siege Processing..');
    res.write('\n' + 'Discord Called!');

    discord(res);

    res.end();

}).listen(process.env.port || process.env.PORT || 1337);
