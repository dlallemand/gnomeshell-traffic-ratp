// Traffic RATP Gnome Extension
// @author Didier LALLEMAND <didier.lallemand@free.fr>

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
const Utils = Me.imports.src.utils;
const RatpAPI = Me.imports.src.ratpAPI;
const Notify = Me.imports.src.notify;

const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Convenience = Me.imports.lib.convenience;
const Moment = Me.imports.lib.moment;


let mainloop;
let lastLine = "";
let currentLine;
let currentLineType;
let settings;
// The ratp indicator
let _indicator;

const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

function updateMessage(json) {
    Utils.log("updateMessage...");
    let line = currentLineType + "_" + currentLine;
    if (lastLine !== line) {
        _indicator.setIconLine(currentLineType, currentLine);
        lastLine = line;
    }
    if (json != null) {
        let currentStatus = _indicator.getTitle();
        let newStatus = currentLine + " : " + json.result.title;
        Utils.log("updateMessage...-- ; newStatus=" + newStatus);
        Utils.log("updateMessage...-- ; currentStatus=" + currentStatus);

        if (newStatus !== currentStatus) {
            Utils.log("###### Updating Message...");
            if (_indicator.getMessage() != null) {
                Utils.log("currentStatus=>>>" + currentStatus);

                Utils.execCommand();
            }
            _indicator.changeIconStatus(json.result.slug);
            let locale = Utils.getLocale();
            let dd = Moment.moment(json._meta.date).locale(locale).format('llll');
            let message = dd + "\n-" + "\n" + _("Line") + " " + currentLine + " : " + json.result.title + "\n" + json.result.message;

            let notifyTitle = _("Line") + " " + currentLine;
            let notifyMessage = json.result.message;
            if (json.result.slug == "normal") {
                Notify.info(notifyTitle, notifyMessage);
            }
            else {
                Notify.warn(notifyTitle, notifyMessage);
            }

            _indicator.setTitle(newStatus);
            _indicator.setMessage(message);
            Utils.log("###### Update Message done.");
        }
    } else {
        Utils.log("updateMessage...(json==null !!!)");
        _indicator.changeIconStatus("");
        _indicator.setMessage(null);
        _indicator.setTitle(null);
    }
}

function updateStatus() {
    Utils.log("UpdateStatus...");
    settings = Convenience.getSettings();
    currentLine = settings.get_string('line');
    currentLineType = settings.get_string('line-type');
    RatpAPI.getTraffic(currentLineType, currentLine, updateMessage);
    return true;
}


function mainloopInit() {
    mainloop = Mainloop.timeout_add_seconds(30, Lang.bind(this, updateStatus));
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



// Triggered when extension is enabled
function enable() {
    _indicator = new TrafficRatpMenu.TrafficRatpMenu(updateStatus);
    let line = settings.get_string('line');
    let lineType = settings.get_string('line-type');
    _indicator.setIconLine(lineType, line);
    Main.panel.addToStatusArea('traffic-ratp-menu', _indicator);
    updateStatus();
    mainloopInit();
}

// Triggered when extension is disabled
function disable() {
    mainloopStop();
    _indicator.destroy();
}
