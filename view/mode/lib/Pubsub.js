/**
 * Author: humanhuang
 * Date: 14-1-3
 */
var Pubsub = (function (window) {
    window.handlers = {};
    var o = {
        pub: function () {
            var args = Array.prototype.slice.call(arguments,0),
                event = args.shift();

            var cbs = handlers[event];
            if (cbs) {
                for (var i = 0; i < cbs.length; i++) {
                    cbs[i].apply(cbs[i].args);
                }
            }
        },
        sub: function (event, callback) {
            if (!handlers[event]) {
                handlers[event] = [];
            }
            handlers[event].push(callback);
        }
    };
    o.publish = o.pub;
    o.subscribe = o.sub;

    return o;

})(window);