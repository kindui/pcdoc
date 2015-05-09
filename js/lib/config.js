/**
 * Author: humanhuang
 * Date: 14-1-1
 */

var g = (function(window){

    var host = window.location.protocol+'//'+window.location.host;
    var path = '/data/gallery/pcdoc/';
    if(host.indexOf('loadjs') > -1){
        path = '/pcdoc/';
    }
    var root_path = host+ path;


    var loadScript = function(path){
        document.write('<script type="text/javascript" src="'+root_path+path+'"></script>');
    }

    var initDemo = function(){
        loadScript('js/lib/demo.js');
    }
    return {
        root:root_path,
        loadScript:loadScript,
        initDemo:initDemo
    };
})(window);