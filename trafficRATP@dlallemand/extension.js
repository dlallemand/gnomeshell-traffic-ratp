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
const Convenience = Me.imports.lib.convenience;
const Moment = Me.imports.lib.moment;


let mainloop;

let compteur = 0;

let _line = "A";

let _laststatus = "";

let settings;

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
    compteur++;
    settings = Convenience.getSettings();
    _line = settings.get_string('rer');

    // new sesssion
    let _httpSession = new Soup.Session();
    let params = {};
    let req = buildRequestTrafic("rers", _line);
    //trace("Request:" + req);
    let message = Soup.form_request_new_from_hash('GET', req, params);
    // execute the request and define the callback
    _httpSession.queue_message(message, Lang.bind(this,
        function (_httpSession, message) {
            if (message.status_code !== 200) {
                _indicator.setMessage(null);
                _indicator.changeIconStatus("");
                return;
            }

            let json = JSON.parse(message.response_body.data);
            //trace("Request response :" + json.response.title);
            if (_laststatus !== json.response.slug) {
                _indicator.changeIconStatus(json.response.slug);
                let debug = "";//  (" + compteur + ") - date : " + new Date();
                let locale = 'fr';
                let dd = Moment.moment(json._meta.date).locale(locale).format('llll'); // December 21st 2016, 5:46:27 pm
                _indicator.setMessage(dd + "\n-"+ "\nTrafic ligne " + _line + " : " + json.response.title + "\n" + json.response.message + debug);
            }

            _laststatus = "line_" + _line + "_" + json.response.slug;
        })
    );
    trace("Update Status : " + compteur);

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

    Convenience.initTranslations();

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
