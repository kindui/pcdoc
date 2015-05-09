/**
 * Author: humanhuang
 * Date: 14-1-2
 */
/**      status :
 *          1：正在开发
 *          2: 已完成
 *          0：已废弃
 **/
//        [标题，URL，说明，状态]
var data =
    [
        {
            name: 'ajax',
            list: [
                ['defered', 'defered.html', 'jq-defered', 1],
                ['require/define', 'define.html', 'require/define', 1]
            ]
        },
        {
            name: 'dom',
            list: [
                ['position', 'position.html', '测试', 1],
                ['document', 'document.html', '获得选中文本,输入框的Selection,模仿doc.write', 1],
                ['css.html', 'css.html', 'dom的style操作', 1],
                ['form', 'form.html', 'form表单', 1],
                ['offset', 'offset.html', 'event的位置/兼容性', 1],
                ['scrollIntoView', 'scrollIntoView.html', 'scrollIntoView滚动 ', 1]
            ]
        },
        {
            name: 'event',
            list: [
                ['stopscroll', 'stopscroll.html', '禁用鼠标滚轮事件', 1],
                ['dispatchEvent', 'dispatchEvent.html', '派发事件', 1]
            ]
        },
        {
            name: 'bom',
            list: [
                ['iframe', 'iframe.html', 'iframe访问测试', 1],
                ['浏览器模式', 'compactmode.html', '正常/怪异', 1],
                ['javascript 动态解析脚本', 'addscript.html', 'javascript 动态解析脚本', 1]
            ]
        },
        {
            name: 'fun',
            list: [
                ['qq', 'qq/index.html', 'qq盗号', 1],
                ['淘宝评分', 'pingfen.html', '', 1],
                ['scroll', 'scroll.html', '滚动视差', 1]

            ]
        },
        {
            name: 'util',
            list: [
                ['encode', 'encode.html', '编码的几个函数', 1],
                ['postEncode', 'postEncode.html', '提交表单时候编码', 1],
                ['jquery', 'jquery.html', 'jquery最佳实践', 1],
                ['date', 'date.html', 'date操作', 1],
                ['reg', 'reg.html', '正则表达式', 1],
                ['keytest', 'keytest.html', '键盘按键测试', 1],
                ['浏览器hack', 'hack.html', '浏览器hack', 1],
                ['jsdoc', 'jsdoc.html', '', 1]

            ]
        },
        {
            name: 'css',
            list: [
                ['翻牌效果', 'cssfan.html', '', 1],
                ['css小三角', 'yuanjiao.html', 'css3画小三角', 1],
                ['position', 'position/position.html', '', 1],
                ['filter,white-space', 'filter.html', 'filter属性差异', 1],
                ['window', 'window.html', 'window模拟框(css)', 1],
                ['doc.styleSheets', 'cssArray.html', '动态插入样式表', 1],
                ['height:100%', 'height.html', '', 1],
                ['float', 'float.html', 'float定位等布局方式', 1],
                ['hack', 'hack.html', '', 1],
                ['offsetElement', 'offsetElement.html', '元素offset图', 1],
                ['表格分页插件', 'fenye.html', '', 1],
                ['styletest', 'styletest.html', '', 1],
                ['table', 'table.html', '表格样式', 1],
                ['form', 'form.html', '表单样式', 1],
                ['css的link和import区别', 'cssque/demo1.html', 'css的link和import加载顺序区别', 1]

            ]
        },
        {
            name: 'animate',
            list: [
                ['jquery动画测试', 'jquery.html', '', 1],
                ['requestAnimFrame', 'request.html', '', 1]
            ]
        },
        {
            name: 'game',
            list: [
                ['深入搜索穿越迷宫', 'shendu.html', '', 1],
                ['贪吃蛇', 'snake.html', '', 1]

            ]
        },
        {
            name: 'project',
            list: [
//                ['y.js', '@../lib/Y/index.html@', '', 1],
                ['y.js', 'Y/', '', 1],
                ['编码转换工具', 'encode/', '', 1],
                ['YTable', 'YTable/table.html', '', 1]

            ]
        },
        {
            name: 'svg',
            list: [
                ['自绘chart', '1.html', '基于rapheal chart插件', 1],
                ['canvas1', 'canvas1.html', 'canvas基本画图，base64图片编码', 1]

            ]
        },
        {
            name: 'mode',
            list: [
                ['create', 'create.html', '对象创建模式', 1],
                ['pubsub', 'pubsub.html', '订阅/发布模式', 1],
                ['jquery', 'jquery.html', 'jquery模式', 1],
                ['with', 'with.html', 'with模式', 1],
                ['single', 'single.html', '单例模式', 1],
                ['extend', 'extend.html', '继承的一种实现', 1],
                ['bind', 'bind.html', '', 1],
                ['klass', 'klass.html', '对象创建方式', 1],
                ['add', 'add.html', 'add()()', 1]
            ]
        },
        {
            name: 'conf',
            list: [
                ['Y.js', 'grunt1.html', 'grunt配置', 1],
                ['oppms_mobile', 'grunt2.html', 'grunt配置', 1]
            ]
        },
        {
            name: 'time',
            list: [
                ['time1', 'time1.html', '计时器相关', 1],
                ['performance上报', 'p1.html', '性能监测', 1],
                ['延迟执行事件', 'delay.html', '', 1],
                ['页面嵌入script标签加载顺序', 'ui1.html', '', 1],
                ['gc.html', 'gc.html', '', 1],
                ['内存泄漏测试', 'xielou.html', '', 1],
                ['通过onload防止刷新缓存', 'onload.html', '', 1]
            ]
        },
        {
            name: 'understand',
            list: [
                ['exports', 'exports.html', 'exports和module区别', 1]
            ]
        },
        {
            name: 'skill',
            list: [
                ['技巧1', 's1.html', '一些语法糖', 1],
                ['instanceof', 'instanceof.html', 'instanceof', 1],
                ['必须通过new来创建对象', 'new.html', '', 1],
                ['pjax', 'pjax/', '', 1],
                ['highlight', 'highlight.html', '如何实现高亮文字', 1],
                ['xyConverter', 'xyConverter.html', 'px转换为数字', 1]
            ]
        },
        {
            name: 'try',
            list: [
                ['setTimeout无法捕获catch', 'try1.html', '', 1]
            ]
        },
        {
            name: 'ui',
            list: [
                ['slide', 'slide.html', '滑动插件', 1],
                ['toTop', 'toTop.html', '回到顶部按钮', 1],
                ['drag', 'drag.html', '拖放元素测试', 1],
                ['autocomplete', 'autocomplete/index.html', '自动提示插件', 1]
            ]
        },
        {
            name: 'html5',
            list: [
                ['postMessage', 'iframe/a.html', 'postMessage跨域通信', 1]
            ]
        },
        {
            name: 'css3',
            list: [
                ['animate', 'animate.html', 'css3动画', 1],
                ['muti-column', 'muti-column.html', '多列', 1]
            ]
        },
        {
            name: 'date',
            list: [
                ['date1', 'date1.html', 'date时间常用操作', 1]
            ]
        },
        {
            name: 'array',
            list: [
                ['array', 'array.html', 'array数组的相关操作', 1]
            ]
        }
    ];