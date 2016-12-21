// Docker menu extension
// @author Didier LALLEMAND <didier.lallemand@gmail.com>
// Thanks To Pierre Grimeau for REST API
/**
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

'use strict';

const Soup = imports.gi.Soup;
const Lang = imports.lang;



const BASE_URL = "https://api-ratp.pierre-grimaud.fr/v2"


function buildRequestTraffic(type, line) {
    let req = BASE_URL + "/traffic/" + type + "/" + line;
    return req;
}

function getTraffic(type, line, fctupdate) {
    let httpSession = new Soup.Session();
    let req = buildRequestTraffic(type, line);
    global.log("getTraffic => req " + req);

    let message = Soup.form_request_new_from_hash('GET', req, {});
    httpSession.queue_message(message, Lang.bind(this,
        function (_httpSession, message) {
            if (message.status_code !== 200) {
                fctupdate(null);
                return;
            }
            else {
                let json = JSON.parse(message.response_body.data);
                fctupdate(json);
            }
        })
    );
}


function buildRequestLines(type, fctupdate) {
    let req = BASE_URL + "/" + type;
    return req;
}
function getLines(type, fctupdate) {
    let httpSession = new Soup.Session();
    let req = buildRequestLines(type);
    global.log("getLines => req " + req);
    let message = Soup.form_request_new_from_hash('GET', req, {});
    httpSession.queue_message(message, Lang.bind(this,
        function (_httpSession, message) {
            if (message.status_code !== 200) {
                fctupdate(null);
                return;
            }
            else {
                let json = JSON.parse(message.response_body.data);
                global.log("RESULT=>" + JSON.stringify(json, null, 4));
                fctupdate(json);
            }
        })
    );
}


function buildRequestStations(type, line) {
    let req = BASE_URL + "/" + type + "/" + line + "/stations";
    return req;
}
function getStations(type, line, fctupdate) {
    let httpSession = new Soup.Session();
    let req = buildRequestStations(type, line);
    let message = Soup.form_request_new_from_hash('GET', req, {});
    httpSession.queue_message(message, Lang.bind(this,
        function (_httpSession, message) {
            if (message.status_code !== 200) {
                fctupdate(null);
                return;
            }
            else {
                let json = JSON.parse(message.response_body.data);
                fctupdate(json);
            }
        })
    );
}

function buildRequestTimetable(type, line, origin, destination) {
    let req = BASE_URL + "/" + type + "/" + line + "/stations/" + origin;
    return req;
}
function getTimetable(type, line, origin, destination, fctupdate) {
    let httpSession = new Soup.Session();
    let req = buildRequestStations(type, line, origin, destination);
    let params = { destination: destination };
    let message = Soup.form_request_new_from_hash('GET', req, params);
    httpSession.queue_message(message, Lang.bind(this,
        function (_httpSession, message) {
            if (message.status_code !== 200) {
                fctupdate(null);
                return;
            }
            else {
                let json = JSON.parse(message.response_body.data);
                fctupdate(json);
            }
        })
    );
}