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

const St = imports.gi.St;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Shell = imports.gi.Shell;
const Utils = Me.imports.src.utils;
const Config = imports.misc.config;

const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;



// trafficRatp icon on status menu
const TrafficRatpMenu = new Lang.Class({
    Name: 'TrafficRatpMenu.TrafficRatpMenu',
    Extends: PanelMenu.Button,

    // Init the trafficRatp menu
    _createStatusIcon: function (icn) {
        let params = { icon_name: icn, icon_size: 16, style_class: "system-status-icon" };
        let ic = new St.Icon(params);
        return ic;
    },
    _init: function (callback) {
        this.parent(0.0, _("Traffic Ratp"));
        this.udpateCallback = callback;

        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        this.lineIcon = this._createStatusIcon('status-failure');
        this.statusIcon = this._createStatusIcon('status-failure');
        hbox.add_child(this.lineIcon);
        hbox.add_child(this.statusIcon);
        this.actor.add_child(hbox);
        this.actor.connect('button_press_event', Lang.bind(this, this._refreshMenu));

        this._renderMenu();
    },
    getTitle: function () {
        return this.title;
    },
    setTitle: function (title) {
        this.title = title;
    },
    getMessage: function () {
        return this.message;
    },
    setMessage: function (message) {
        this.message = message;
    },
    setIconLine: function (type, line) {
        this.lineIcon.icon_name = type + "_" + line;
    },

    changeIconStatus: function (statusLabel) {
        Utils.log("Change icon status:" + statusLabel);
        if (statusLabel === "normal") {
            this.statusIcon.icon_name = 'status-green';
            Utils.log("!!!!!!! statusIcon.icon_name set to status-green !!!!!!");
        }
        else if (statusLabel === "alerte") {
            this.statusIcon.icon_name = 'status-orange';
        }
        else if (statusLabel === "critique") {
            this.statusIcon.icon_name = 'status-red';
        }
        else {
            this.statusIcon.icon_name = 'status-failure';
            Utils.log("!!!!!!! statusIcon.icon_name set to status-failure !!!!!!!!!!!");
        }
    },

    // Refresh  the menu everytime the user click on it
    // It allows to have up-to-date information on trafficRatp containers
    _refreshMenu: function () {
        if (this.menu.isOpen) {
            this.menu.removeAll();
            this._renderMenu();
        }
    },

    // Show trafficRatp menu icon only if installed and append trafficRatp containers
    _renderMenu: function () {
        this.udpateCallback();
        let errMsg = _("Service not available");
        if (this.message != null) {
            errMsg = this.message;
        }
        let item = new PopupMenu.PopupMenuItem(errMsg);
        item.connect("activate", function () {
            // call gnome settings tool for this extension
            let [res, out, err, status] = GLib.spawn_command_line_sync("xdg-open http://www.ratp.fr/informer/trafic/trafic.php?cat=2");

            if (status == 0) {
                Utils.log("Error on opening webbrowser");
            }
        });
        this.menu.addMenuItem(item);
        log(errMsg);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        let settings = new PopupMenu.PopupMenuItem(_("Settings"));
        settings.connect("activate", function () {
            // call gnome settings tool for this extension
            let app = Shell.AppSystem.get_default().lookup_app("gnome-shell-extension-prefs.desktop");
            if (app != null) {
                // for Gnome >= 3.12
                if (Utils.versionIsAtLeast(Config.PACKAGE_VERSION, "3.12")) {
                    let info = app.get_app_info();
                    let timestamp = global.display.get_current_time_roundtrip();
                    info.launch_uris([Me.uuid], global.create_app_launch_context(timestamp, -1));
                }
                // for Gnome < 3.12
                else {
                    app.launch(global.display.get_current_time_roundtrip(), ['extension:///' + Me.uuid], -1, null);
                }
            }
        });
        this.menu.addMenuItem(settings);
        this.actor.show();
    }

});
