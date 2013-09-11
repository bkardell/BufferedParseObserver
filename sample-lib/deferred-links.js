(function (prollyfillRoot) {
   prollyfillRoot.NamedSourcePromises = (function () {
        var NamedPromises = {}, typestr, NamedPromisesMeta = {};
        var listObserver = new prollyfillRoot.BufferedParseObserver('link', 'setImmediate');
        var scriptObserver = new prollyfillRoot.BufferedParseObserver('script', 'setImmediate');
        var fetchTextAndPromise = function(url) {
          var promise = new RSVP.Promise(function(resolve, reject){
            var client = new XMLHttpRequest();
            client.open("GET", url);
            client.onreadystatechange = handler;
            client.responseType = "text";
            client.setRequestHeader("Accept", "text");
            client.send();

            function handler() {
              if (this.readyState === this.DONE) {
                if (this.status === 200) { resolve(this.response); }
                else { reject(this); }
              }
            };
          });

          return promise;
        };
        var lookup = function (name) {
            return NamedPromises[name.trim()].fulfillmentValue;
        };
        var makePromise = function (el, typ) {
            // when does the work initiate?
            var evtName = el.getAttribute("data-on");
            var promiseName = el.getAttribute("data-promise");
            var typPts = typ.split("-");
            console.log("promised:" + promiseName);
            var url = el.getAttribute("data-src");
            NamedPromisesMeta[promiseName] = (typPts.length === 3) ? typPts[2] : "text";
            NamedPromises[promiseName] = new RSVP.Promise(function (resolve, reject) {
                if ( /DOMContentLoaded|load/.test(evtName) ) {
                    window.addEventListener(evtName, function () {
                        fetchTextAndPromise(url).then(function (data) { resolve(data) });
                    });
                } else {
                    fetchTextAndPromise(url).then(function (data) { resolve(data) });
                }
            });
            return NamedPromises[promiseName];
        };
        listObserver.on("notify", function (arr) {
            var el, promises = [];
            for (var i=0; i<arr.length; i++) {
                el = arr[i];
                typestr = el.getAttribute("type") || 'text';
                if(el.getAttribute("data-promise") && el.getAttribute("data-src")) {
                    promises.push(makePromise(el, typestr));
                }
            }
            return RSVP.all(promises);
        });
        var useOne = function (id) {
            var id = id.trim();
            t = NamedPromisesMeta[id];
            return me.types[t](id);
        };
        var me = {
            when: function () {
                var promises = [], promise;
                for (var i=0; i<arguments.length; i++) {
                    // It can be the case that there is no promise yet - if that is the case, make it...
                    promises.push(NamedPromises[arguments[i].trim()]);
                }
                return RSVP.all(promises);
            },
            use: function (id) {
                return useOne(id);
            },
            ready: function (fn) {
                listObserver.on("done", fn);
            }, 
            types: {
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
                exports: function (id) {
                    /* 
                    Really debatable whether this is a good idea/necessary... 
                    Using the scope thing below you could easily add protection...
                    */
                    var exports = {};
                    eval(lookup(id));
                    return exports;
                },
                text: lookup
            }
        };
        var resolveAll = function (typ, arr) {
            var ret = [], val;
            for (var i=0;i<arr.length;i++) {
                val = me[typ](arr[i]);
                ret.push(val);
            }
            return ret;
        };
        var promiseScript = function (code, names, method) {
            var names = names.split(",");
            console.log("expecting promises:" + names);
            me.when.apply(me, names).then(function () {
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
                method = (el.hasAttribute("data-use")) ? "data-use" : "data-when";
                name = el.getAttribute(method);
                typestr = el.getAttribute("type") || '';
                if(typestr === "text/x-promise-deferred") {
                    promiseScript(el.innerHTML, name, method.split("-")[1]);
                }
            }
        });
        return me;
    }());
  }(window.ProllyfillRoot || window));