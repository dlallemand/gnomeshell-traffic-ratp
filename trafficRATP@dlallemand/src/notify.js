const St = imports.gi.St;
const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;
const Lang = imports.lang;

const WarnNotificationSource = new Lang.Class({
    Name: 'WarnNotificationSource',
    Extends: MessageTray.Source,

    _init: function() {
        this.parent(_("Extension"), 'dialog-warning-symbolic');
    },

    open: function() {
        this.destroy();
    }
});

const InfoNotificationSource = new Lang.Class({
    Name: 'WarnNotificationSource',
    Extends: MessageTray.Source,

    _init: function() {
        this.parent(_("Extension"), 'dialog-information-symbolic');
    },

    open: function() {
        this.destroy();
    }
});


function info(msg, details) {
   let source = new InfoNotificationSource();
    Main.messageTray.add(source);
    let notification = new MessageTray.Notification(source, msg, details);
    if (source.setTransient === undefined)
        notification.setTransient(true);
    else
        source.setTransient(true);
    source.notify(notification);
}

function warn(msg, details) {
    let source = new WarnNotificationSource();
    Main.messageTray.add(source);
    let notification = new MessageTray.Notification(source, msg, details);
    if (source.setTransient === undefined)
        notification.setTransient(true);
    else
        source.setTransient(true);
    source.notify(notification);
}



