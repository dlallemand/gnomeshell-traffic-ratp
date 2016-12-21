/*
 * @author Philipp Hoffmann
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
	//settingsJSON = Settings.getSettingsJSON(settings);
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

function buildSubwaysSettings() {
	// -- Subway Parameter
	let type = 'metros';
	let labelLine = new Gtk.Label({ label: _("Subway"), xalign: 0 });
	let hboxLine = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
	hboxLine = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
	hboxLine.pack_start(labelLine, true, true, 0);

	global.log("call RatpAPI begin request for Lines of " + type + "...");
	let fistRadio = null;
	RatpAPI.getLines(type, function (json) {
		global.log("================================================JSON>" + json.response);
		let metros = json.response.metros;
		for (var i in metros) {
			global.log("analyse json metros");
			let lineId = "L" + i;//metros[i].line;
			let lineName = "Ligne";

			let radio;
			if (firstRadio == null) {
				radio = new Gtk.RadioButton({ label: lineId, valign: Gtk.Align.START });
			}
			else {
				radio = new Gtk.RadioButton({ group: firstRadio, label: lineId, valign: Gtk.Align.START });
			}
			radio.set_active(settings.get_string(type) === ligneId);

			radio.connect('toggled', Lang.bind(this, function (widget) {
				updateSettings(type, lineId);
			}));
			hboxLine.add(radio);
			fistRadio = radio;




			global.log("================================================JSON> lineId" + lineId);
		}
	});

	return hboxLine;

}

function buildPrefsWidget() {
	let notebook = new Gtk.Notebook();
	// -- Line Type Parameter
	let key = 'line-type';
	let hboxLine = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
	let hboxLineType = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
	let labelLineType = new Gtk.Label({ label: _("Line Type"), xalign: 0 });
	let radioRER = new Gtk.RadioButton({ label: _("RER"), valign: Gtk.Align.START });
	let radioSubway = new Gtk.RadioButton({ group: radioRER, label: _("Subways"), valign: Gtk.Align.START });
	let radioTramways = new Gtk.RadioButton({ group: radioRER, label: _("Tramways"), valign: Gtk.Align.START });
	let radioBus = new Gtk.RadioButton({ group: radioRER, label: _("Bus"), valign: Gtk.Align.START });
	let radioNoctiliens = new Gtk.RadioButton({ group: radioRER, label: _("Noctiliens"), valign: Gtk.Align.START });


	let rerSettings = buildRerSettings();
	let subwaysSettings = buildSubwaysSettings();

	radioRER.connect('toggled', Lang.bind(this, function (widget) {
		global.log("RER selected");
		updateSettings(key, "rers");
		rerSettings.set_visible(true);
		subwaysSettings.set_visible(false);
	}));

	radioSubway.connect('toggled', Lang.bind(this, function (widget) {
		global.log("Subway selected");
		updateSettings(key, "metros");
		rerSettings.set_visible(false);
		subwaysSettings.set_visible(true);
	}));

	global.log("Setting => Line Type = " + settings.get_string(key));
	radioRER.set_active(settings.get_string(key) === "rers");
	radioSubway.set_active(settings.get_string(key) === "metros");


	rerSettings.set_visible(settings.get_string(key) === "rers");
	subwaysSettings.set_visible(settings.get_string(key) === "metros");

	hboxLineType.add(labelLineType);
	hboxLineType.add(radioRER);
	hboxLineType.add(radioSubway);
	hboxLineType.add(radioTramways);
	hboxLineType.add(radioBus);
	hboxLineType.add(radioNoctiliens);

	// *** overall frame ***
	frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10 });

	// add line type selection
	//frame.add(hboxLineType);

	// add RER selection
	frame.add(rerSettings);

	// add Metro selection
	//frame.add(subwaysSettings);

	// add notebook
	frame.add(notebook);

	// show the frame
	frame.show_all();

	return frame;
}
