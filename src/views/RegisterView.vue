<template>
  <div class="register-container">
    <!-- 星空背景 - 与登录页一致 -->
    <div class="starry-background">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
    </div>

    <!-- 流星特效 - 与登录页一致 -->
    <div class="meteor-shower">
      <div
        v-for="meteor in meteors"
        :key="meteor.id"
        class="meteor"
        :style="meteor.style"
      ></div>
    </div>

    <!-- 磨砂玻璃层 -->
    <div class="frosted-overlay"></div>

    <!-- 旋转的背景框 - 使用日出映像 -->
    <div class="rotating-background-frame">
      <div class="rotating-frame">
        <div class="frame-content" :style="{ backgroundImage: 'url(/images/artworks/日出映像.jpg)' }"></div>
      </div>
    </div>

    <!-- 艺术剪影 -->
    <div class="art-silhouettes">
      <div class="silhouette" v-for="art in artSilhouettes" :key="art.id" :style="art.style">
        {{ art.icon }}
      </div>
    </div>

    <div class="register-content">
      <div class="register-card">
        <!-- 卡片背景 - 使用日出映像 -->
        <div class="card-background" :style="{ backgroundImage: 'url(/images/artworks/日出映像.jpg)' }"></div>
        <div class="card-overlay"></div>

        <div class="card-content">
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="fluorescent-icon">✨</div>
            <h1 class="fluorescent-title">加入星空画廊</h1>
            <p class="fluorescent-subtitle">开启您的艺术收藏之旅</p>
          </div>

          <!-- 注册表单 -->
          <form @submit.prevent="handleRegister" class="register-form">
            <div class="form-group">
              <label for="username" class="fluorescent-label">
                <span class="star-icon">✦</span>
                用户名
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                required
                class="cosmic-input"
              >
            </div>

            <div class="form-group">
              <label for="email" class="fluorescent-label">
                <span class="star-icon">✦</span>
                邮箱
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="请输入邮箱地址"
                required
                class="cosmic-input"
              >
            </div>

            <div class="form-group">
              <label for="password" class="fluorescent-label">
                <span class="star-icon">✦</span>
                密码
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                required
                class="cosmic-input"
              >
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="fluorescent-label">
                <span class="star-icon">✦</span>
                确认密码
              </label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                required
                class="cosmic-input"
              >
            </div>

            <button type="submit" class="cosmic-btn" :disabled="loading">
              <span class="btn-glow"></span>
              <span class="btn-content">
                <span v-if="loading">注册中...</span>
                <span v-else>创建账户 ✨</span>
              </span>
            </button>
          </form>

          <!-- 底部链接 -->
          <div class="register-footer">
            <p class="fluorescent-text">已有账户？
              <router-link to="/login" class="cosmic-link">
                立即登录
              </router-link>
            </p>
            <router-link to="/" class="back-link fluorescent-text">← 返回首页</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 时间粒子 -->
    <div class="time-particles">
      <div class="particle" v-for="particle in timeParticles" :key="particle.id" :style="particle.style"></div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { authAPI } from '../utils/api'
import './RegisterView.css'

export default {
  name: 'RegisterView',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    // 使用计算属性访问 store 状态
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const user = computed(() => store.state.user)
    
    return {
      store,
      router,
      isLoggedIn,
      user
    }
  },
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      stars: [],
      meteors: [],
      artSilhouettes: [
        { id: 1, icon: '🖼️', style: { top: '15%', left: '5%', animationDelay: '0s' } },
        { id: 2, icon: '🎨', style: { top: '25%', right: '8%', animationDelay: '2s' } },
        { id: 3, icon: '🌟', style: { top: '65%', left: '12%', animationDelay: '4s' } },
        { id: 4, icon: '✨', style: { top: '75%', right: '5%', animationDelay: '6s' } }
      ],
      timeParticles: []
    }
  },
  methods: {
    initStars() {
      for (let i = 0; i < 200; i++) {
        this.stars.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 5 + 3}s`
          }
        })
      }
    },
    
    initMeteors() {
      for (let i = 0; i < 8; i++) {
        this.meteors.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`
          }
        })
      }
    },
    
    startMeteorShower() {
      setInterval(() => {
        this.meteors.forEach(meteor => {
          meteor.style.animationDelay = `${Math.random() * 20}s`
        })
      }, 20000)
    },

    async handleRegister() {
      // 验证表单
      if (!this.form.username.trim()) {
        this.showMessage('请输入用户名', 'warning')
        return
      }

      if (!this.form.email.trim()) {
        this.showMessage('请输入邮箱地址', 'warning')
        return
      }

      if (!this.form.password.trim()) {
        this.showMessage('请输入密码', 'warning')
        return
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.showMessage('两次输入的密码不一致', 'warning')
        return
      }

      if (this.form.password.length < 6) {
        this.showMessage('密码长度至少6位', 'warning')
        return
      }

      this.loading = true

      try {
        // 使用后端API注册
        const response = await authAPI.register({
          username: this.form.username,
          email: this.form.email,
          password: this.form.password
        })

        if (response.success) {
          // 保存token和用户信息
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))

          // 使用 Vuex action 登录
          this.store.dispatch('login', response.user)

          this.showMessage(`欢迎，${response.user.username}！账户创建成功`, 'success')

          setTimeout(() => {
            this.router.push('/')
          }, 2000)
        } else {
          this.showMessage(response.error || '注册失败', 'error')
        }

      } catch (error) {
        console.error('注册失败:', error)
        const message = error.response?.data?.error || '注册失败，请稍后重试'
        this.showMessage(message, 'error')
      } finally {
        this.loading = false
      }
    },

    showMessage(message, type = 'info') {
      const messageEl = document.createElement('div')
      messageEl.className = `cosmic-message ${type}`

      const icons = {
        success: '✨',
        warning: '⭐',
        error: '⭐',
        info: '⭐'
      }

      messageEl.innerHTML = `
        <div class="message-content">
          <span class="message-icon">${icons[type]}</span>
          <span class="message-text fluorescent-text">${message}</span>
        </div>
      `

      document.body.appendChild(messageEl)

      setTimeout(() => {
        messageEl.classList.add('fade-out')
        setTimeout(() => {
          document.body.removeChild(messageEl)
        }, 500)
      }, 3000)
    },

    initTimeParticles() {
      for (let i = 0; i < 30; i++) {
        this.timeParticles.push({
          id: i,
          style: {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            background: this.getRandomParticleColor()
          }
        })
      }
    },

    getRandomParticleColor() {
      const colors = [
        'rgba(255, 203, 107, 0.6)',  // 日出金色
        'rgba(255, 138, 101, 0.6)',  // 日出橙色
        'rgba(255, 107, 107, 0.6)',  // 日出红色
        'rgba(138, 138, 255, 0.6)'   // 星空紫色
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }
  },

  mounted() {
    this.initStars()
    this.initMeteors()
    this.startMeteorShower()
    this.initTimeParticles()

    if (this.isLoggedIn) {
      this.router.push('/')
    }
  }
}
</script>
