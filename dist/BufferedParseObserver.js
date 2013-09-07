(function(e){var t,n;(function(){var e={},r={};t=function(t,n,r){e[t]={deps:n,callback:r}};n=function(t){if(r[t]){return r[t]}r[t]={};var i=e[t];if(!i){throw new Error("Module '"+t+"' not found.")}var s=i.deps,o=i.callback,u=[],a;for(var f=0,l=s.length;f<l;f++){if(s[f]==="exports"){u.push(a={})}else{u.push(n(s[f]))}}var c=o.apply(this,u);return r[t]=a||c}})();t("rsvp/all",["rsvp/promise","exports"],function(e,t){"use strict";function r(e){if(Object.prototype.toString.call(e)!=="[object Array]"){throw new TypeError("You must pass an array to all.")}return new n(function(t,n){function o(e){return function(t){u(e,t)}}function u(e,n){r[e]=n;if(--i===0){t(r)}}var r=[],i=e.length,s;if(i===0){t([])}for(var a=0;a<e.length;a++){s=e[a];if(s&&typeof s.then==="function"){s.then(o(a),n)}else{u(a,s)}}})}var n=e.Promise;t.all=r});t("rsvp/async",["exports"],function(e){"use strict";function s(){return function(e,t){process.nextTick(function(){e(t)})}}function o(){return function(e,t){setImmediate(function(){e(t)})}}function u(){var e=[];var t=new n(function(){var t=e.slice();e=[];t.forEach(function(e){var t=e[0],n=e[1];t(n)})});var r=document.createElement("div");t.observe(r,{attributes:true});window.addEventListener("unload",function(){t.disconnect();t=null},false);return function(t,n){e.push([t,n]);r.setAttribute("drainQueue","drainQueue")}}function a(){return function(e,t){i.setTimeout(function(){e(t)},1)}}var t=typeof window!=="undefined"?window:{};var n=t.MutationObserver||t.WebKitMutationObserver;var r;var i=typeof global!=="undefined"?global:this;if(typeof setImmediate==="function"){r=o()}else if(typeof process!=="undefined"&&{}.toString.call(process)==="[object process]"){r=s()}else if(n){r=u()}else{r=a()}e.async=r});t("rsvp/config",["rsvp/async","exports"],function(e,t){"use strict";var n=e.async;var r={};r.async=n;t.config=r});t("rsvp/defer",["rsvp/promise","exports"],function(e,t){"use strict";function r(){var e={resolve:undefined,reject:undefined,promise:undefined};e.promise=new n(function(t,n){e.resolve=t;e.reject=n});return e}var n=e.Promise;t.defer=r});t("rsvp/events",["exports"],function(e){"use strict";var t=function(e,t){this.type=e;for(var n in t){if(!t.hasOwnProperty(n)){continue}this[n]=t[n]}};var n=function(e,t){for(var n=0,r=e.length;n<r;n++){if(e[n][0]===t){return n}}return-1};var r=function(e){var t=e._promiseCallbacks;if(!t){t=e._promiseCallbacks={}}return t};var i={mixin:function(e){e.on=this.on;e.off=this.off;e.trigger=this.trigger;return e},on:function(e,t,i){var s=r(this),o,u;e=e.split(/\s+/);i=i||this;while(u=e.shift()){o=s[u];if(!o){o=s[u]=[]}if(n(o,t)===-1){o.push([t,i])}}},off:function(e,t){var i=r(this),s,o,u;e=e.split(/\s+/);while(o=e.shift()){if(!t){i[o]=[];continue}s=i[o];u=n(s,t);if(u!==-1){s.splice(u,1)}}},trigger:function(e,n){var i=r(this),s,o,u,a,f;if(s=i[e]){for(var l=0;l<s.length;l++){o=s[l];u=o[0];a=o[1];if(typeof n!=="object"){n={detail:n}}f=new t(e,n);u.call(a,f)}}}};e.EventTarget=i});t("rsvp/hash",["rsvp/defer","exports"],function(e,t){"use strict";function r(e){var t=0;for(var n in e){t++}return t}function i(e){var t={},i=n(),s=r(e);if(s===0){i.resolve({})}var o=function(e){return function(t){u(e,t)}};var u=function(e,n){t[e]=n;if(--s===0){i.resolve(t)}};var a=function(e){i.reject(e)};for(var f in e){if(e[f]&&typeof e[f].then==="function"){e[f].then(o(f),a)}else{u(f,e[f])}}return i.promise}var n=e.defer;t.hash=i});t("rsvp/node",["rsvp/promise","rsvp/all","exports"],function(e,t,n){"use strict";function s(e,t){return function(n,r){if(n){t(n)}else if(arguments.length>2){e(Array.prototype.slice.call(arguments,1))}else{e(r)}}}function o(e){return function(){var t=Array.prototype.slice.call(arguments),n,o;var u=this;var a=new r(function(e,t){n=e;o=t});i(t).then(function(t){t.push(s(n,o));try{e.apply(u,t)}catch(r){o(r)}});return a}}var r=e.Promise;var i=t.all;n.denodeify=o});t("rsvp/promise",["rsvp/config","rsvp/events","exports"],function(e,t,n){"use strict";function s(e){return o(e)||typeof e==="object"&&e!==null}function o(e){return typeof e==="function"}function a(e){if(r.onerror){r.onerror(e.detail)}}function l(e,t){if(e===t){h(e,t)}else if(!c(e,t)){h(e,t)}}function c(e,t){var n=null,r;try{if(e===t){throw new TypeError("A promises callback cannot return that same promise.")}if(s(t)){n=t.then;if(o(n)){n.call(t,function(n){if(r){return true}r=true;if(t!==n){l(e,n)}else{h(e,n)}},function(t){if(r){return true}r=true;p(e,t)});return true}}}catch(i){p(e,i);return true}return false}function h(e,t){r.async(function(){e.trigger("promise:resolved",{detail:t});e.isFulfilled=true;e.fulfillmentValue=t})}function p(e,t){r.async(function(){e.trigger("promise:failed",{detail:t});e.isRejected=true;e.rejectedReason=t})}var r=e.config;var i=t.EventTarget;var u=function(e){var t=this,n=false;if(typeof e!=="function"){throw new TypeError("You must pass a resolver function as the sole argument to the promise constructor")}if(!(t instanceof u)){return new u(e)}var r=function(e){if(n){return}n=true;l(t,e)};var i=function(e){if(n){return}n=true;p(t,e)};this.on("promise:failed",function(e){this.trigger("error",{detail:e.detail})},this);this.on("error",a);try{e(r,i)}catch(s){i(s)}};var f=function(e,t,n,r){var i=o(n),s,u,a,f;if(i){try{s=n(r.detail);a=true}catch(h){f=true;u=h}}else{s=r.detail;a=true}if(c(t,s)){return}else if(i&&a){l(t,s)}else if(f){p(t,u)}else if(e==="resolve"){l(t,s)}else if(e==="reject"){p(t,s)}};u.prototype={constructor:u,isRejected:undefined,isFulfilled:undefined,rejectedReason:undefined,fulfillmentValue:undefined,then:function(e,t){this.off("error",a);var n=new this.constructor(function(){});if(this.isFulfilled){r.async(function(t){f("resolve",n,e,{detail:t.fulfillmentValue})},this)}if(this.isRejected){r.async(function(e){f("reject",n,t,{detail:e.rejectedReason})},this)}this.on("promise:resolved",function(t){f("resolve",n,e,t)});this.on("promise:failed",function(e){f("reject",n,t,e)});return n},fail:function(e){return this.then(null,e)}};i.mixin(u.prototype);n.Promise=u});t("rsvp/reject",["rsvp/promise","exports"],function(e,t){"use strict";function r(e){return new n(function(t,n){n(e)})}var n=e.Promise;t.reject=r});t("rsvp/resolve",["rsvp/promise","exports"],function(e,t){"use strict";function r(e){return new n(function(t,n){t(e)})}var n=e.Promise;t.resolve=r});t("rsvp/rethrow",["exports"],function(e){"use strict";function n(e){t.setTimeout(function(){throw e});throw e}var t=typeof global==="undefined"?this:global;e.rethrow=n});t("rsvp",["rsvp/events","rsvp/promise","rsvp/node","rsvp/all","rsvp/hash","rsvp/rethrow","rsvp/defer","rsvp/config","rsvp/resolve","rsvp/reject","exports"],function(e,t,n,r,i,s,o,u,a,f,l){"use strict";function E(e,t){y[e]=t}var c=e.EventTarget;var h=t.Promise;var p=n.denodeify;var d=r.all;var v=i.hash;var m=s.rethrow;var g=o.defer;var y=u.config;var b=a.resolve;var w=f.reject;l.Promise=h;l.EventTarget=c;l.all=d;l.hash=v;l.rethrow=m;l.defer=g;l.denodeify=p;l.configure=E;l.resolve=b;l.reject=w});window.RSVP=n("rsvp")})(window);
(function(global,undefined){"use strict";function canUseNextTick(){return typeof process==="object"&&Object.prototype.toString.call(process)==="[object process]"}function canUseMessageChannel(){return!!global.MessageChannel}function canUsePostMessage(){if(!global.postMessage||global.importScripts){return false}var e=true;var t=global.onmessage;global.onmessage=function(){e=false};global.postMessage("","*");global.onmessage=t;return e}function canUseReadyStateChange(){return"document"in global&&"onreadystatechange"in global.document.createElement("script")}function installNextTickImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);process.nextTick(function(){tasks.runIfPresent(e)});return e}}function installMessageChannelImplementation(e){var t=new global.MessageChannel;t.port1.onmessage=function(e){var t=e.data;tasks.runIfPresent(t)};e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);t.port2.postMessage(e);return e}}function installPostMessageImplementation(e){function n(e,t){return typeof e==="string"&&e.substring(0,t.length)===t}function r(e){if(e.source===global&&n(e.data,t)){var r=e.data.substring(t.length);tasks.runIfPresent(r)}}var t="com.bn.NobleJS.setImmediate"+Math.random();if(global.addEventListener){global.addEventListener("message",r,false)}else{global.attachEvent("onmessage",r)}e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);global.postMessage(t+e,"*");return e}}function installReadyStateChangeImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);var t=global.document.createElement("script");t.onreadystatechange=function(){tasks.runIfPresent(e);t.onreadystatechange=null;t.parentNode.removeChild(t);t=null};global.document.documentElement.appendChild(t);return e}}function installSetTimeoutImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);global.setTimeout(function(){tasks.runIfPresent(e)},0);return e}}var tasks=function(){function Task(e,t){this.handler=e;this.args=t}Task.prototype.run=function(){if(typeof this.handler==="function"){this.handler.apply(undefined,this.args)}else{var scriptSource=""+this.handler;eval(scriptSource)}};var nextHandle=1;var tasksByHandle={};var currentlyRunningATask=false;return{addFromSetImmediateArguments:function(e){var t=e[0];var n=Array.prototype.slice.call(e,1);var r=new Task(t,n);var i=nextHandle++;tasksByHandle[i]=r;return i},runIfPresent:function(e){if(!currentlyRunningATask){var t=tasksByHandle[e];if(t){currentlyRunningATask=true;try{t.run()}finally{delete tasksByHandle[e];currentlyRunningATask=false}}}else{global.setTimeout(function(){tasks.runIfPresent(e)},0)}},remove:function(e){delete tasksByHandle[e]}}}();if(!global.setImmediate){var attachTo=typeof Object.getPrototypeOf==="function"&&"setTimeout"in Object.getPrototypeOf(global)?Object.getPrototypeOf(global):global;if(canUseNextTick()){installNextTickImplementation(attachTo)}else if(canUsePostMessage()){installPostMessageImplementation(attachTo)}else if(canUseMessageChannel()){installMessageChannelImplementation(attachTo)}else if(canUseReadyStateChange()){installReadyStateChangeImplementation(attachTo)}else{installSetTimeoutImplementation(attachTo)}attachTo.clearImmediate=tasks.remove}})(typeof global==="object"&&global?global:this);
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