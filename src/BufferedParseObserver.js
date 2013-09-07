(function (attachTo) {
    var config = { mode: "setTimeout" };
    attachTo.BufferedParseObserver = function (tagName, mode) {
        var live,
            contentLoaded,
            connected,
            index = 0,
            eventCallbacks = {},
            self = this,
            promises = [],
            lastId,
            mode = mode || config.mode,
            nodeList = document.getElementsByTagName(tagName),
            getLazyCall = function(cb, arr) {
                return function () {
                    var promise = cb.call(self,arr);
                    if (promise) {
                        promises.push(promise);
                    }
                }
            },
            notify = function (eventName, arr) {
                var cbs = eventCallbacks[eventName];
                var max = cbs.length;
                for (var i=0;i<max;i++) {
                    getLazyCall(cbs[i], arr)();
                }
            },
            check = function (done) {
                var arr = [];
                if (nodeList.length > index) {
                    arr = (Array.prototype.slice.apply(nodeList, (index) ? [index] : []));
                    arr = arr.filter(function (el) {
                        var ret = !el.touched;
                            el.touched = true;
                            return ret;
                    });
                    if( arr.length > 0 ) {
                        notify("notify",arr);
                    }
                    index = arr.length;
                }

                if (done) {
                    window[mode.replace("set","clear")](lastId);
                    check();
                } else if (connected) {
                    lastId = window[mode](check);
                }
                return nodeList.length;
            };
        this.on = function (n, cb) {
            eventCallbacks[n] = eventCallbacks[n] || [];
            eventCallbacks[n].push(cb);
            if (!connected) {
                connected = true;
                check();
            }
        };
        this.disconnect = function () {
            connected = false;
        }
        document.addEventListener("DOMContentLoaded", function () {
            console.log("firing for " + tagName);
            window.__domContentLoadedTime = Date.now();
            if (connected) {
                check(true);
                self.disconnect(true);
            }
            RSVP.all(promises).then(function(){
                var cbs = eventCallbacks.done;
                var max = cbs.length;
                for (var i=0;i<max;i++) {
                    eventCallbacks.done[i]();
                }
            });
        });
    };
}(window.ProllyfillRoot || window));