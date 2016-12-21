/*
 * @author Philipp Hoffmann
 */

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.lib.convenience;

const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

let settings, settingsJSON;

function init() {
	Convenience.initTranslations();
	settings = Convenience.getSettings();
	//settingsJSON = Settings.getSettingsJSON(settings);
}

// update json settings for server in settings schema
function updateSettings(key, value) {
	settings.set_string(key, value);
}

function buildPrefsWidget() {
	let key;
	let notebook = new Gtk.Notebook();


	// -- Line Type Parameter
	key = 'line-type';
	let hboxLineType = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
	let labelLineType = new Gtk.Label({ label: _("Line Type"), xalign: 0 });
	let radioRER = new Gtk.RadioButton({ label: _("RER"), valign: Gtk.Align.START });
	let radioSubway = new Gtk.RadioButton({ group: radioRER, label: _("Subways"), valign: Gtk.Align.START });
	radioRER.connect('toggled', Lang.bind(this, function (widget) {
		global.log("RER selected");
		updateSettings(key, "rers");
	}));

	radioSubway.connect('toggled', Lang.bind(this, function (widget) {
		global.log("Subway selected");
		updateSettings(key, "metros");
	}));

	global.log("Setting => Line Type = " + settings.get_string(key));
	radioRER.set_active(settings.get_string(key) === "rers");
	radioSubway.set_active(settings.get_string(key) === "metros");

	hboxLineType.add(labelLineType);
	hboxLineType.add(radioRER);
	hboxLineType.add(radioSubway);

	// -- RER Parameter
	key = 'rer';
	let hboxLine = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
	let labelLine = new Gtk.Label({ label: _("RER"), xalign: 0 });
	let radioRER_A = new Gtk.RadioButton({ label: "A", valign: Gtk.Align.START });
	let radioRER_B = new Gtk.RadioButton({ group: radioRER_A, label: "B", valign: Gtk.Align.START });

	global.log("Setting => RER = " + settings.get_string(key));
	radioRER_A.set_active(settings.get_string(key) === "A");
	radioRER_B.set_active(settings.get_string(key) === "B");

	radioRER_A.connect('toggled', Lang.bind(this, function (widget) {
		updateSettings(key, "A");
	}));

	radioRER_B.connect('toggled', Lang.bind(this, function (widget) {
		updateSettings(key, "B");
	}));


	hboxLine.pack_start(labelLine, true, true, 0);
	hboxLine.add(radioRER_A);
	hboxLine.add(radioRER_B);


	// *** overall frame ***
	let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });

	frame.add(hboxLineType);
	// add new server button
	frame.add(hboxLine);

	// add notebook
	frame.add(notebook);

	// show the frame
	frame.show_all();

	return frame;
}
