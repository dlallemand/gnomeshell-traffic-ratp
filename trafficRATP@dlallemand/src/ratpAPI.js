// Traffic RATP Gnome Extension
// @author Didier LALLEMAND <didier.lallemand@free.fr>

// Thanks to Pierre Grimeau for REST API


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


const BASE_URL = "https://api-ratp.pierre-grimaud.fr/v2" // see https://github.com/pgrimaud/horaires-ratp-api

function _request(req, callback, params = {}) {
    let httpSession = new Soup.Session();
    let message = Soup.form_request_new_from_hash('GET', req, {});
    httpSession.queue_message(message, Lang.bind(this,
        function (_httpSession, message) {
            if (message.status_code !== 200) {
                callback(null);
                return;
            }
            else {
                let json = JSON.parse(message.response_body.data);
                callback(json);
            }
        })
    );
}

function getTraffic(type, line, fctupdate) {
    let req = BASE_URL + "/traffic/" + type + "/" + line;
    _request(req, fctupdate);

}

function getLines(type, fctupdate) {
    let req = BASE_URL + "/" + type;
    _request(req, fctupdate);
}

function getStations(type, line, fctupdate) {
    let req = BASE_URL + "/" + type + "/" + line + "/stations";
    _request(req, fctupdate);
}

function buildRequestTimetable(type, line, origin, destination) {
    let req = BASE_URL + "/" + type + "/" + line + "/stations/" + origin;
    return req;
}
function getTimetable(type, line, origin, destination, fctupdate) {
    let req = BASE_URL + "/" + type + "/" + line + "/stations/" + origin;
    let params = { destination: destination };
    _request(req, fctupdate, params);
}