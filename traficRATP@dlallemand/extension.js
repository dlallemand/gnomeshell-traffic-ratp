
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const PopupMenu = imports.ui.popupMenu;

let text, button, status_icon;

let mainloop;

let _line = "A";

let _laststatus = "";

const ICON_SIZE_INDICATOR = 16;

const BASE_URL = "https://api-ratp.pierre-grimaud.fr/v2"



function buildRequestTrafic(type, line) {
    let req = BASE_URL + "/traffic/" + type + "/" + line;
    return req;
}

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}


/*
 * Return status icon.
 */
function createStatusIcon(icon_name) {
    let params = { icon_name: icon_name, icon_size: ICON_SIZE_INDICATOR, style_class: "system-status-icon" };

    // St.IconType got removed in Gnome 3.6. This is for backwards compatibility with Gnome 3.4.
    if (St.IconType) {
        params.icon_type = St.IconType.FULLCOLOR;
    }

    let ic = new St.Icon(params);

    trace("get icon (" + icon_name + ") : " + ic);

    return ic;
}


function changeIconStatus(status) {

    if (status == "normal") {
        status_icon = createStatusIcon('status-green');
    }
    else if (status == "alerte") {
        status_icon = createStatusIcon('status-red');
    } else {
        status_icon = createStatusIcon('status-grey');
    }
    button.set_child(status_icon);
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
                printMessage("Service non disponible");
                changeIconStatus("");
                return;
            }

            let json = JSON.parse(message.response_body.data);
            // do something with the data
            trace("Request response :" + json.response.title);
            if (_laststatus !== json.response.slug) {
                printMessage("Trafic ligne " + _line + " :" + json.response.title + "\n " + json.response.message);
            }
            changeIconStatus(json.response.slug);
            _laststatus = json.response.slug;
        })
    );
    trace("Step : End");

    return true;
}


function trace(text) {
    global.log("[TraficRATP] " + text);
}

function printMessage(msg) {
    trace("print message");

    //getStatus();


    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: msg });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
        monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
        {
            opacity: 0,
            time: 2,
            transition: 'easeOutQuad',
            onComplete: _hideHello
        });
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

function clickUpdateStatus() {
    _laststatus = "";
    updateStatus();
}

function init(extensionMeta) {
    button = new St.Bin({
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true
    });

    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");

    status_icon = createStatusIcon('status-grey');

    updateStatus();

    button.set_child(status_icon);
    button.connect('button-press-event', clickUpdateStatus);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
    mainloopInit();
}

function disable() {
    mainloopStop();
    Main.panel._rightBox.remove_child(button);
}
