<template>
  <div class="login-container">
    <!-- 星空背景 - 与首页完全一致，包含闪烁星星 -->
    <div class="starry-background">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
    </div>

    <!-- 流星特效 - 与首页完全一致 -->
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

    <!-- 旋转的背景框 - 更大更透明 -->
    <div class="rotating-background-frame">
      <div class="rotating-frame">
        <div class="frame-content" :style="{ backgroundImage: 'url(/images/artworks/the-starry-night.jpg)' }"></div>
      </div>
    </div>

    <!-- 登录内容 -->
    <div class="login-content">
      <div class="cosmic-portal">
        <!-- 登录面板 - 降低透明度 -->
        <div class="login-card">
          <div class="card-background" :style="{ backgroundImage: 'url(/images/artworks/the-starry-night.jpg)' }"></div>
          <div class="card-overlay"></div>
          <div class="card-content">
            <div class="card-header">
              <!-- 荧光星星图标 -->
              <div class="fluorescent-icon">✨</div>
              <h1 class="fluorescent-title">欢迎回到星空画廊</h1>
              <p class="fluorescent-subtitle">登录您的宇宙艺术账户</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label for="username" class="fluorescent-label">
                  <span class="star-icon">⭐</span>
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
                <label for="password" class="fluorescent-label">
                  <span class="star-icon">⭐</span>
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

              <button type="submit" class="cosmic-btn" :disabled="loading">
                <span class="btn-glow"></span>
                <span class="btn-content">
                  <span v-if="loading">登录中...</span>
                  <span v-else>进入星空画廊 ✨</span>
                </span>
              </button>
            </form>

            <div class="login-footer">
              <p class="fluorescent-text">还没有账户？ <router-link to="/register" class="cosmic-link">创建新账户</router-link></p>
              <router-link to="/" class="back-link fluorescent-text">← 返回宇宙首页</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { authAPI } from '../utils/api'
import './LoginView.css'

export default {
  name: 'LoginView',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    // 使用计算属性访问 store 状态
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const user = computed(() => store.state.user)
    
    return {
      store,
      router,
      route,
      isLoggedIn,
      user
    }
  },
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      stars: [],
      meteors: []
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

    async handleLogin() {
      try {
        console.log('开始登录，用户名:', this.form.username);

        const response = await authAPI.login({
          username: this.form.username,
          password: this.form.password
        });

        console.log('登录响应:', response);

        if (response.success) {
          // 保存用户信息到 localStorage
          localStorage.setItem('user', JSON.stringify(response.user));

          // 保存token（后端返回的token）
          localStorage.setItem('token', response.token);

          // 使用 Vuex action 登录
          this.store.dispatch('login', response.user);

          // 跳转到首页
          const redirect = this.route.query.redirect || '/'
          this.router.push(redirect);
        } else {
          console.error('登录失败:', response.error);
          this.showMessage(response.error || '登录失败', 'error');
        }
      } catch (error) {
        console.error('登录请求失败:', error);

        if (error.response?.data?.error) {
          this.showMessage(`登录失败: ${error.response.data.error}`, 'error');
        } else if (error.response?.status === 400) {
          this.showMessage('请求格式错误，请检查用户名和密码', 'error');
        } else {
          this.showMessage('网络错误，请稍后重试', 'error');
        }
      }
    },
    
    showMessage(message, type) {
      const messageEl = document.createElement('div')
      messageEl.className = `cosmic-message ${type}`
      messageEl.innerHTML = `
        <div class="message-content">
          <span class="message-icon">${type === 'success' ? '✨' : '⭐'}</span>
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
    }
  },

  mounted() {
    this.initStars()
    this.initMeteors()
    this.startMeteorShower()

    if (this.isLoggedIn) {
      const redirect = this.route.query.redirect || '/'
      this.router.push(redirect)
    }
  }
}
</script>
