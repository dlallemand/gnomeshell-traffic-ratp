// trafficRatp menu extension
// @author Guillaume Pouilloux <gui.pouilloux@gmail.com>

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


// trafficRatp icon on status menu
const TrafficRatpMenu = new Lang.Class({
    Name: 'TrafficRatpMenu.TrafficRatpMenu',
    Extends: PanelMenu.Button,

    // Init the trafficRatp menu
    _createStatusIcon: function (icn) {
        let params = { icon_name: icn, icon_size: 16, style_class: "system-status-icon" };

        // St.IconType got removed in Gnome 3.6. This is for backwards compatibility with Gnome 3.4.
        if (St.IconType) {
            params.icon_type = St.IconType.FULLCOLOR;
        }
        global.log("[TraficRATP] _createStatusIcon changeIconStatus ic=" + icn + ", params => " + params.icon_name);
        let ic = new St.Icon(params);

        // trace("get icon (" + icon_name + ") : " + ic);

        return ic;
    },
    _init: function () {
        this.parent(0.0, _("Traffic Ratp"));

        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        // let gicon = Gio.icon_new_for_string(Me.path + "/icons/status-grey.svg");
        this.trafficRatpIcon = this._createStatusIcon('status-grey');//new St.Icon({ gicon: gicon, icon_size: '16' });

        hbox.add_child(this.trafficRatpIcon);
        hbox.add_child(PopupMenu.arrowIcon(St.Side.BOTTOM));
        this.actor.add_child(hbox);
        this.actor.connect('button_press_event', Lang.bind(this, this._refreshMenu));

        this._renderMenu();
    },

    setMessage: function (message) {
        this.message = message;
    },

    changeIconStatus: function (ss) {
        let statusLabel = ss;
        global.log("[TraficRATP] statusLabel='" + statusLabel + "'");
        if (statusLabel == "normal") {
            this.trafficRatpIcon.icon_name = 'status-green';
        }
        else if (statusLabel == "alerte") {
            //this.trafficRatpIcon = this._createStatusIcon('status-orange');
            this.trafficRatpIcon.icon_name = 'status-orange';
        }
        else if (statusLabel == "critique") {
            this.trafficRatpIcon.icon_name = 'status-red';
        }
        else {
            this.trafficRatpIcon.icon_name = 'status-grey';
        }
        global.log("[TraficRATP] trafficRatpIcon changed => " + this.trafficRatpIcon.gicon);
    },

    // Refresh  the menu everytime the user click on it
    // It allows to have up-to-date information on trafficRatp containers
    _refreshMenu: function () {
        if (this.menu.isOpen) {
            this.menu.removeAll();
            this._renderMenu();
        }
    },

    // Checks if trafficRatp is installed on the host machine
    _isServiceAvailable: function () {
        return true;
    },

    // Checks if the trafficRatp daemon is running or not
    _istrafficRatpRunning: function () {
        let [res, pid, in_fd, out_fd, err_fd] = GLib.spawn_async_with_pipes(null, ['/bin/ps', 'cax'], null, 0, null);

        let out_reader = new Gio.DataInputStream({
            base_stream: new Gio.UnixInputStream({ fd: out_fd })
        });

        // Look for the trafficRatp process running
        let trafficRatpRunning = false;
        let hasLine = true;
        do {
            let [out, size] = out_reader.read_line(null);
            if (out != null && out.toString().indexOf("trafficRatp") > -1) {
                trafficRatpRunning = true;
            } else if (size <= 0) {
                hasLine = false;
            }

        } while (!trafficRatpRunning && hasLine);

        return trafficRatpRunning;
    },

    // Show trafficRatp menu icon only if installed and append trafficRatp containers
    _renderMenu: function () {
        if (this._isServiceAvailable()) {

            let errMsg = " - ";
            if (this.message != null) {
                errMsg = this.message;
            }
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(errMsg));
            log(errMsg);
        } else {
            let errMsg = "Service not available";
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(errMsg));
            log(errMsg);
        }
        this.actor.show();
    },

    // Append containers to menu
    _feedMenu: function () {


    }
});
