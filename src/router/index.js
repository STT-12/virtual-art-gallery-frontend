import { createRouter, createWebHistory } from 'vue-router'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: '虚拟艺术画廊 - 探索艺术无限可能'
    }
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('../views/GalleryView.vue'),
    meta: {
      title: '艺术画廊 - 浏览所有作品'
    }
  },
  {
    path: '/gallery/:style',
    name: 'StyleGallery',
    component: () => import('../views/GalleryView.vue'),
    props: true,
    meta: {
      title: '艺术风格画廊'
    }
  },
   {
    path: '/gallery1',
    name: 'Gallery1',
    component: () => import('../views/GalleryView1.vue'),
    meta: {
      title: '艺术画廊 - 浏览所有作品'
    }
  },
  {
    path: '/gallery1/:style',
    name: 'StyleGallery',
    component: () => import('../views/GalleryView1.vue'),
    props: true,
    meta: {
      title: '艺术风格画廊'
    }
  },
  {
    path: '/artwork/:id',
    name: 'ArtworkDetail',
    component: () => import('../views/ArtworkDetail.vue'),
    props: true,
    meta: {
      title: '画作详情'
    }
  },
  {
    path: '/personal-gallery',
    name: 'PersonalGallery',
    component: () => import('../views/PersonalGallery.vue'),
    meta: {
      requiresAuth: true,
      title: '我的个人画廊'
    }
  },
  {
  path: '/gallery-community',
  name: 'GalleryCommunity',
  component: () => import('../views/GalleryCommunity.vue'),
  meta: {
    requiresAuth: true,
    title: '画廊社区 - 与好友分享艺术'
  }

},
 {
  path: '/gallery/:id(\\d+)',  // 只匹配数字ID
  name: 'GalleryDetailPage',
  component: () => import('../views/GalleryDetail.vue'),
  props: true
},
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      title: '登录 - 虚拟艺术画廊',
      hideNav: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: {
      title: '注册 - 虚拟艺术画廊',
      hideNav: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回顶部
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 检查是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 从localStorage获取登录状态
  const user = localStorage.getItem('user')
  const isLoggedIn = !!user

  if (requiresAuth && !isLoggedIn) {
    // 需要登录但未登录，跳转到登录页
    next({
      name: 'Login',
      query: {
        redirect: to.fullPath,
        message: '请先登录以访问个人画廊'
      }
    })
  } else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
    // 已登录但访问登录/注册页，跳转到首页
    next({ name: 'Home' })
  } else {
    // 正常导航
    next()
  }
})

// 路由后置守卫
router.afterEach((to, from) => {
  // 可以在这里添加页面浏览统计等
  console.log(`Navigated to: ${to.name}`)
})

// 错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 可以在这里添加错误上报
})

export default router
