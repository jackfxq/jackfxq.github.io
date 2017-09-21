docute.init({
    landing: 'landing.html',
    debug: true,
    // home: 'https://raw.githubusercontent.com/egoist/docute/master/README.md',
    repo: 'egoist/docute',
    twitter: 'rem_rin_rin',
    'edit-link': 'https://github.com/egoist/docute/blob/master/docs/',
    tocVisibleDepth: 3,
    nav: {
        default: [{
            title: 'vue源码分析',
            type: 'dropdown',
            items: [{
                title: '数据绑定原理', path: '/vue-source/data'
            }, {
                title: '框架和流程分析', path: '/vue-source/frame'
            }, {
                title: '数组的处理', path: '/vue-source/array'
            }]
        }, {
            title: '前端框架',
            type: 'dropdown',
            items: [{
                title: '开发框架', path: '/web-frame/frame'
            }, {
                title: '组件系统', path: '/web-frame/component'
            }]
        }, {
            title: 'webpack',
            type: 'dropdown',
            items: [{
                title: '打包文件分析', path: '/webpack/js'
            }]
        }, {
            title: '设计模式',
            type: 'dropdown',
            items: [{
                title: '观察者模式', path: '/design-pattern/observe'
            }]
        }]
    },
    icons: [
        {
            label: '关注我的微博',
            svgId: 'i-weibo',
            svgClass: 'weibo-icon',
            link: 'http://weibo.com/zengxinyu'
        }
    ],
    plugins: [
        docsearch({
            apiKey: '65360cf9a91d87cd455d2b286d0d89ee',
            indexName: 'docute',
            tags: ['english', 'zh-Hans', 'zh-Hant', 'ja'],
            url: 'https://docute.js.org'
        }),
        evanyou()
    ]
})
