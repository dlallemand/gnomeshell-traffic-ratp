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

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.lib.convenience;
const RatpAPI = Me.imports.src.ratpAPI;

const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

let settings;
let frame;

function init() {
	Convenience.initTranslations();
	settings = Convenience.getSettings();
}

// update json settings for server in settings schema
function updateSettings(key, value) {
	global.log("###Settings => set " + key + " to " + value);
	settings.set_string(key, value);
}


function buildCommandToExecSettings() {

	let hboxLine = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
	let command = settings.get_string("command-on-status-change");
	let labelCommand = new Gtk.Label({ label: _("Command"), xalign: 0 });
	let inputCommand = new Gtk.Entry({ hexpand: true, text: command });
	inputCommand.connect("changed", Lang.bind(this, function (input) { settings.set_string("command-on-status-change", input.text); }));


	hboxLine.add(labelCommand);
	hboxLine.add(inputCommand);
	return hboxLine;

}

function buildRerSettings() {
	// -- RER Parameter
	let type = 'line';


	let labelLine = new Gtk.Label({ label: _("RER"), xalign: 0 });
	let radioRER_A = new Gtk.RadioButton({ label: "A", valign: Gtk.Align.START });
	let radioRER_B = new Gtk.RadioButton({ group: radioRER_A, label: "B", valign: Gtk.Align.START });



	global.log("Setting => RER = " + settings.get_string(type));
	radioRER_A.set_active(settings.get_string(type) === "A");
	radioRER_B.set_active(settings.get_string(type) === "B");

	radioRER_A.connect('toggled', Lang.bind(this, function (widget) {
		updateSettings(type, "A");
	}));

	radioRER_B.connect('toggled', Lang.bind(this, function (widget) {
		updateSettings(type, "B");
	}));

	let hboxLine = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
	hboxLine.pack_start(labelLine, true, true, 0);
	hboxLine.add(radioRER_A);
	hboxLine.add(radioRER_B);

	return hboxLine;

}

function buildPrefsWidget() {
	let notebook = new Gtk.Notebook();
	// -- Line Type Parameter

	let rerSettings = buildRerSettings();
	// *** overall frame ***
	frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });

	frame.add(rerSettings);


	// add notebook
	frame.add(notebook);

	frame.add(buildCommandToExecSettings());

	// show the frame
	frame.show_all();

	return frame;
}
