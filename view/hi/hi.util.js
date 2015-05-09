/**
 * User: humanhuang
 * Date: 14-1-11
 * Time: 下午7:01
 */

;
(function (master,undefined) {

    /**
     * 合并数组
     * @param first
     * @param second
     * @returns {*}
     */
    var mergeArray = function(first, second) {
        var i = first.length,
            j = 0;

        if ( typeof second.length === "number" ) {
            for ( var l = second.length; j < l; j++ ) {
                first[ i++ ] = second[ j ];
            }

        } else {
            while ( second[j] !== undefined ) {
                first[ i++ ] = second[ j++ ];
            }
        }

        first.length = i;

        return first;
    };


})(window);

