(function (prollyfillRoot) {
   prollyfillRoot.NamedSourcePromises = (function () {
        var results = {}, typestr;
        var listObserver = new prollyfillRoot.BufferedParseObserver('link', 'setImmediate');
        var makePromise = function (el) {
            return $.ajax(
                {
                    url: el.getAttribute("data-src"),
                    dataType: 'text',
                    mimeType: 'text'
                }).then(function (data) {
                    results[el.getAttribute("data-promise")] = data;
                });
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
            json: function (id) {
                return JSON.parse(results[id]);
            },
            script: function () {
                for ( var i=0;i<arguments.length;i++) {
                    window.eval(results[arguments[i]]);
                }
                /* this is silly */
                return new RSVP.Promise(function (resolve) {resolve(); });
            },
            text: function (id) {
                return results[id];
            },
            resolve: function (id) {
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