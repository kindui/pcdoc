/**
 * Author: humanhuang
 * Date: 2013-9-21
 */
function merge(src, b, c) {
    if (c === undefined) {
        for (var i in b) {
            src[i] = b[i];
        }
    } else {
        for (var i in c) {
            b[i] = c[i];
        }
        for (var i in b) {
            src[i] = b[i];
        }
    }
    return src;
}

function Bar(options) {

    var defaults = {
        domId: null,
        titleField: null,
        valueField: null,
        data: null,
        dataLength: null,
        maxValue: null,
        paper: null
    }
    merge(this,defaults, options);
    this.init();
}
Bar.prototype = {
    init: function () {
        this.initCompute();
        this.paper = Raphael(this.domId, 50+70*this.dataLength, 400);
        this.createAxis();
    },
    initCompute: function () {
        //length
        var dataLength = this.dataLength = this.data.length;
        //find max value
        var maxValue = this.data[0][this.valueField];
        var valueField = this.valueField;
        for (var i = 0, L = dataLength; i < L; i++) {
            var item = this.data[i];
            maxValue = maxValue < item[valueField] ? item[valueField] : maxValue;
        }
        this.maxValue = maxValue;
    },
    createAxis: function () {
        //绘制棋盘
        //离顶端 50,50axis  x:400, y:300
        this.paper.path('M50,50 v300 h' + (this.dataLength * 70 + 10) + 'M50,50 ');
        this.createX();
        this.createY();
        this.createBars();
    },
    createX: function () {
//x轴刻度
        for (var i = 0, L = this.dataLength; i < L; i++) {
            var x = 25 + (70 * (i + 1));
            var y = 50 + 300;
            var xy = 'M' + x + ',' + y;
            this.paper.path(xy + 'v5');
            var xTitle = this.data[i][this.titleField];
            this.paper.text(x, y + 20, xTitle);  //text
        }
    },
    createY: function () {
//y轴刻度
        for (var i = 0; i < 11; i++) {
            var x = '45';
            var y = 50 + 30 * i;
            var xy = 'M' + x + ',' + y;
            this.paper.path(xy + 'h5');
            var yValue = (this.maxValue * (10 - i) / 10).toFixed(2);
            this.paper.text(x - 20, y, yValue);  //text
        }

    },
    createBars: function () {
//bar width:50 间距:20
        for (var i = 0, L = this.dataLength; i < L; i++) {
            var item = this.data[i];

            var height = 300 * item[this.valueField] / this.maxValue;
            var y = 300 + 50 - height;
            this.paper.rect(70 * (i + 1), y, 50, height).attr({fill: "red"});
        }
    }
}



