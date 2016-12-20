// Docker menu extension
// @author Didier LALLEMAND <didier.lallemand@gmail.com>

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

const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const TrafficRatpMenu = Me.imports.src.trafficRatpMenu;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;



let mainloop;

let _line = "B";

let _laststatus = "";

const ICON_SIZE_INDICATOR = 16;

const BASE_URL = "https://api-ratp.pierre-grimaud.fr/v2"

function mainloopInit() {
    mainloop = Mainloop.timeout_add_seconds(30, Lang.bind(this, updateStatus));
}

function buildRequestTrafic(type, line) {
    let req = BASE_URL + "/traffic/" + type + "/" + line;
    return req;
}

function trace(text) {
    global.log("[TraficRATP] " + text);
}

function updateStatus() {
    // new sesssion
    let _httpSession = new Soup.Session();
    let params = {};
    let req = buildRequestTrafic("rers", _line);
    trace("Request:" + req);
    let message = Soup.form_request_new_from_hash('GET', req, params);
    // execute the request and define the callback
    _httpSession.queue_message(message, Lang.bind(this,
        function (_httpSession, message) {
            if (message.status_code !== 200) {
                //printMessage("Service non disponible");
                //changeIconStatus("");
                return;
            }

            let json = JSON.parse(message.response_body.data);
            // do something with the data
            trace("Request response :" + json.response.title);
            if (_laststatus !== json.response.slug) {
                //printMessage();
            }
            //
            _indicator.setMessage("Trafic ligne " + _line + " : " + json.response.title + "\n" + json.response.message);
            _indicator.changeIconStatus(json.response.slug);
            _laststatus = json.response.slug;
        })
    );
    trace("Step : End");

    return true;
}

function mainloopStop() {
    if (mainloop) {
        Mainloop.source_remove(mainloop);
        this.mainloop = null;
    }
}

// Triggered when extension has been initialized
function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

}

// The ratp indicator
let _indicator;

// Triggered when extension is enabled
function enable() {
    trace("enable traffic ratp");
    _indicator = new TrafficRatpMenu.TrafficRatpMenu;
    trace("start indicator traffic ratp")
    Main.panel.addToStatusArea('traffic-ratp-menu', _indicator);
    trace("add menu traffic ratp");
    updateStatus();
    mainloopInit();
}

// Triggered when extension is disabled
function disable() {
    mainloopStop();
    _indicator.destroy();
}
