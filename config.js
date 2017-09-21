
docute.init({
  landing: 'landing.html',
  debug: true,
  // home: 'https://raw.githubusercontent.com/egoist/docute/master/README.md',
  repo: 'egoist/docute',
  twitter: 'rem_rin_rin',
  'edit-link': 'https://github.com/egoist/docute/blob/master/docs/',
  tocVisibleDepth: 3,
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
