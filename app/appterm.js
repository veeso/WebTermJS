/*
*
*   -- AppTerm.JS --
*
* 	Copyright (C) 2018 Christian Visintin - christian.visintin1997@gmail.com
*
* 	This file is part of WebTermJS
*
*   WebTermJS is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   WebTermJS is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with WebTermJS.  If not, see <http://www.gnu.org/licenses/>.
*
*/

//TODO: add command line parameters
//TODO: improve logging

var express = require('express');
var bodyParser = require('body-parser');
var appterm = express();
appterm.use(bodyParser.urlencoded({
    extended: true
}));
var path = require('path');
appterm.use(express.static(__dirname + '/html/'));

var shellSession = require('./node_modules/webtermcom/webtermcom.js');

appterm.listen(process.env.PORT || 3000, function() {
    var port = process.env.PORT ? process.env.PORT : 3000;
    console.log("Express started successfully: listening on port", port);
});

appterm.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/'));
});

appterm.post('/webterm/', function(req, res) {
    var body = req.body;
    console.log("Received REQUEST on /webterm/", body);
    if(body.path != null && body.command != null) {
        var response = shellSession.exec(body.path, body.command);
        console.log("Sending RESPONSE:", response);
        res.send(JSON.stringify(response));
    }
    else {
        res.sendStatus(500);
    }
});

