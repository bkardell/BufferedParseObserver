(function (prollyfillRoot) {
   prollyfillRoot.NamedSourcePromises = (function () {
        var NamedPromises = {}, typestr;
        var listObserver = new prollyfillRoot.BufferedParseObserver('link', 'setImmediate');
        var scriptObserver = new prollyfillRoot.BufferedParseObserver('script', 'setImmediate');
        var lookup = function (name) {
            return NamedPromises[name.trim()].fulfillmentValue;
        };
        var makePromise = function (el) {
            // when does the work initiate?
            var evtName = el.getAttribute("data-on");
            var promiseName = el.getAttribute("data-promise");
            console.log("promised:" + promiseName);

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
        listObserver.on("notify", function (arr) {
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
                    // It can be the case that there is no promise yet - if that is the case, make it...
                    promises.push(NamedPromises[arguments[i].trim()]);
                }
                return RSVP.all(promises);
            }, 
            json: function (id) {
                return JSON.parse(lookup(id));
            },
            script: function (id) {
                /* 
                Really debatable whether this is a good idea/necessary... 
                Using the scope thing below you could easily add protection...
                */
                return window.eval(lookup(id));
            },
            text: lookup,
            use: function (id) {
                var t = document.querySelector("[data-promise='" + id.trim() + "']").getAttribute("type").split("-");
                t = (t.length === 3) ? t[2] : "text";
                return resolvers[t](id.trim());
            },
            ready: function (fn) {
                listObserver.on("done", fn);
            }
        };
        var resolveAll = function (typ, arr) {
            var ret = [];
            for (var i=0;i<arr.length;i++) {
                ret.push(resolvers[typ](arr[i]));
            }
            return ret;
        };
        var promiseScript = function (code, names) {
            var names = names.split(",");
            console.log("expecting promises:" + names);
            resolvers.when.apply(resolvers, names).then(function () {
                //debugger;
                console.log("got promises:" + names);
                (function () {
                    var exports = {};
                    eval(code);
                    exports.resolve.apply(this, resolveAll("use", names));
                }());

            }).fail(function () {
                 (function () {
                    var exports = {};
                    //console.log(resolvers.use(name));
                    eval(code);
                    exports.reject.apply(this, arguments);
                }());
            });
  
        };

        scriptObserver.on("notify", function (arr) {
            var el, name;
            for (var i=0; i<arr.length; i++) {
                el = arr[i];
                name = el.getAttribute("use");
                typestr = el.getAttribute("type") || '';
                if(typestr === "text/x-promise-deferred") {
                    promiseScript(el.innerHTML, name);
                }
            }
        });
        return resolvers;
    }());
  }(window.ProllyfillRoot || window));