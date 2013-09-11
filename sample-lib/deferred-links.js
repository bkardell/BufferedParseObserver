(function (prollyfillRoot) {
   prollyfillRoot.NamedSourcePromises = (function () {
        var NamedPromises = {}, typestr, NamedPromisesMeta = {};
        var listObserver = new prollyfillRoot.BufferedParseObserver('link', 'setImmediate');
        var scriptObserver = new prollyfillRoot.BufferedParseObserver('script', 'setImmediate');
        var lookup = function (name) {
            return NamedPromises[name.trim()].fulfillmentValue;
        };
        var makePromise = function (el, typ) {
            // when does the work initiate?
            var evtName = el.getAttribute("data-on");
            var promiseName = el.getAttribute("data-promise");
            var typPts = typ.split("-");
            console.log("promised:" + promiseName);

            var config = {
                url: el.getAttribute("data-src"),
                dataType: 'text',
                mimeType: 'text'
            };
            NamedPromisesMeta[promiseName] = (typPts.length === 3) ? typPts[2] : "text";
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
                typestr = el.getAttribute("type") || 'text';
                if(typestr.indexOf("text/x-promised") === 0) {
                    promises.push(makePromise(el, typestr));
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
                var id = id.trim();
                t = NamedPromisesMeta[id];
                return resolvers[t](id);
            },
            ready: function (fn) {
                listObserver.on("done", fn);
            }
        };
        var resolveAll = function (typ, arr) {
            var ret = [], val;
            for (var i=0;i<arr.length;i++) {
                val = resolvers[typ](arr[i]);
                ret.push(val);
            }
            return ret;
        };
        var promiseScript = function (code, names, method) {
            var names = names.split(",");
            console.log("expecting promises:" + names);
            resolvers.when.apply(resolvers, names).then(function () {
                var myargs = arguments[0];
                console.log("got promises:" + names);
                (function () {
                    var promises = {};
                    eval(code);
                    promises.resolved.apply(this, (method==="when") ? myargs : resolveAll(method, names));
                }());

            }).fail(function () {
                var myargs = arguments;
                (function () {
                    var promises = {};
                    eval(code);
                    promises.rejected.apply(this, myargs);
                }());
            });
  
        };

        scriptObserver.on("notify", function (arr) {
            var el, name, method;
            for (var i=0; i<arr.length; i++) {
                el = arr[i];
                method = (el.hasAttribute("use")) ? "use" : "when";
                name = el.getAttribute(method);
                typestr = el.getAttribute("type") || '';
                if(typestr === "text/x-promise-deferred") {
                    promiseScript(el.innerHTML, name, method);
                }
            }
        });
        return resolvers;
    }());
  }(window.ProllyfillRoot || window));