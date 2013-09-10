(function (prollyfillRoot) {
   prollyfillRoot.NamedSourcePromises = (function () {
        var NamedPromises = {}, typestr;
        var listObserver = new prollyfillRoot.BufferedParseObserver('link', 'setImmediate');
        var lookup = function (name) {
            return NamedPromises[name].fulfillmentValue;
        };
        var makePromise = function (el) {
            // when does the work initiate?
            var evtName = el.getAttribute("data-on");
            var promiseName = el.getAttribute("data-promise");
            var config = {
                url: el.getAttribute("data-src"),
                dataType: 'text',
                mimeType: 'text'
            };
            NamedPromises[promiseName] = new RSVP.Promise(function (resolve, reject) {
                if ( /DOMContentLoaded|load/.test(evtName) ) {
                    window.addEventListener(evtName, function () {
                        $.ajax(config).then(function (data) { resolve(data) });
                    });
                } else {
                    $.ajax(config).then(function (data) { resolve(data) });
                }
            });
            return NamedPromises[promiseName];
        };
        listObserver.on("notify", function(arr) {
            var el, promises = [];
            for (var i=0; i<arr.length; i++) {
                el = arr[i];
                typestr = el.getAttribute("type") || '';
                if(typestr.indexOf("text/x-promised") === 0) {
                    promises.push(makePromise(el));
                }
            }
            return RSVP.all(promises);
        });


        var resolvers = {
            when: function () {
                var promises = [], promise;
                for (var i=0; i<arguments.length; i++) {
                    promises.push(NamedPromises[arguments[i]]);
                }
                return RSVP.all(promises);
            }, 
            json: function (id) {
                return JSON.parse(lookup(id));
            },
            script: function (id) {
                window.eval(lookup(id));
                /* is this silly? */
                return new RSVP.Promise(function (resolve) {resolve(); });
            },
            text: lookup,
            use: function (id) {
                var t = document.querySelector("[data-promise='" + id + "']").getAttribute("type").split("-");
                t = (t.length === 3) ? t[2] : "text";
                return resolvers[t](id);
            },
            ready: function (fn) {
                listObserver.on("done", fn);
            }
        };
        return resolvers;
    }());
  }(window.ProllyfillRoot || window));