/**
 *
 * User: humanhuang
 * Date: 14-1-5
 * Time: 下午7:44
 */
(function (master) {


    function classList(e) {
        if (e.classList) return e.classList;
        return new CSSClassList(e);
    }

//    function classList2() {
//        if (this.classList) return this.classList;
//        return new CSSClassList(this);
//    }

    function CSSClassList(e) {
        this.e = e;
    }

    CSSClassList.prototype.contain = function (c) {
        if (c.length === 0 || c.indexOf(" ") !== -1) throw new Error('Invalid class name:' + c);
        var classes = this.e.className;
        if (!classes) return false;
        if (classes === c) return true;
        return classes.search('\\b' + c + '\\b') != -1;
    }

    CSSClassList.prototype.add = function (c) {
        if (this.contain(c)) return;
        var classes = this.e.className;
        if (classes && classes[classes.length - 1] != '') {
            c = ' ' + c;
        }
        this.e.className = classes + c;
    }

    CSSClassList.prototype.remove = function (c) {
        if (!this.contain(c)) return;
        var classes = this.e.className;
        if (c.length == 0 || c.indexOf(' ') != -1) throw new Error('Invalid class name:' + c);
        var reg = new RegExp('\\b' + c + '\\b\\s*', "g");
        this.e.className = classes.replace(reg, "");
    }
    CSSClassList.prototype.toggle = function (c) {
        if (this.contain(c)) {
            this.remove(c);
            return false;
        } else {
            this.add(c);
            return true;
        }
    }

//    if (Object.defineProperty) {
//        Object.defineProperty(Element.prototype, 'classList', {
//            get: classList2,
//            enumerable: false, configurable: true
//        });
//    } else {
//        Element.prototype.__defineGetter__('classList', classList2);
//    }


})(window);
