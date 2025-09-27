
/** Copyright 2014-2022 Stewart Allen -- All Rights Reserved */

"use strict";

// this code runs in a web worker
// communicates with the main thread through message passing

let
    time = Date.now(),
    debug = false,
    kiri,
    ver = "unknown";

// catch errors and post to the main thread
self.onerror = function(error) {
    console.log(error);
    self.postMessage({error: error.message || error.toString()});
};

self.onmessage = function(msg) {
    let data = msg.data,
        cmd = data.cmd,
        app = data.app;

    if (debug) {
        console.log("worker:"+cmd);
    }

    if (cmd) {
        let fun = self[cmd];
        if (fun) {
            fun(data.data, data.reply_id);
        } else {
            console.log("invalid worker command: "+cmd);
        }
        return;
    }

    // initialize worker
    if (app) {
        if (kiri) {
            // allows re-initialization with different app script
            delete self.kiri;
            delete self.moto;
            delete self.meta;
            kiri = undefined;
        }
        ver = app.ver;
        // pull in supporting scripts
        if (app.code.base) {
            importScripts.apply(self, [ app.code.base ]);
        }
        // set debug flags
        if (app.debug) {
            debug = true;
            kiri.client.debug = true;
        }
        // setup and initialize kiri
        kiri = self.kiri = self.kiri || {
            client: new kiri.Client(self.postMessage, self.postMessage),
            version: ver,
        };
        // map exported functions to worker
        for (const key in kiri.client) {
            if (typeof kiri.client[key] === 'function') {
                self[key] = kiri.client[key].bind(kiri.client);
            }
        }
    }
};

