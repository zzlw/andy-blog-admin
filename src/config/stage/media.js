const articleRouter = {
  route: null,
  name: null,
  title: '媒体管理',
  type: 'folder',
  icon: 'el-icon-lollipop',
  filePath: 'views/media/',
  order: null,
  inNav: true,
  children: [
    {
      title: '音乐管理',
      type: 'view',
      name: 'media-music',
      route: '/media/music',
      filePath: 'views/media/music.vue',
      inNav: true,
      icon: ''
    },
  ]
}

export default articleRouter
