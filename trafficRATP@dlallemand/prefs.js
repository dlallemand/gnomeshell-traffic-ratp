/*
 * @author Didier LALLEMAND
 */

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.lib.convenience;
const RatpAPI = Me.imports.src.ratpAPI;

const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

let settings, settingsJSON;


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

	// show the frame
	frame.show_all();

	return frame;
}
