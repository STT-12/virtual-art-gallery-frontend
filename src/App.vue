<template>
  <div id="app">
    <nav class="navbar" :class="{ 'scrolled': isScrolled }">
      <div class="nav-container">
        <router-link to="/" class="logo">
          <div class="logo-icon">✨</div>
          <span class="logo-text">星空艺术馆</span>
        </router-link>

        <!-- 导航链接部分 -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="nav-glow"></span>
            <span class="nav-text">首页</span>
          </router-link>
          <router-link to="/gallery" class="nav-link">
            <span class="nav-glow"></span>
            <span class="nav-text">3D画廊展示</span>
          </router-link>
          <router-link to="/gallery1" class="nav-link">
            <span class="nav-glow"></span>
            <span class="nav-text">2D画廊展示</span>
          </router-link>
          <!-- 添加个人画廊按钮 -->
          <router-link to="/personal-gallery" class="nav-link">
            <span class="nav-glow"></span>
            <span class="nav-text">我的画廊</span>
          </router-link>
        </div>

        <div class="nav-center">
          <div class="star-field">
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
            <div class="star"></div>
          </div>
        </div>

        <div class="nav-auth">
          <template v-if="isLoggedIn">
            <div class="user-orb">
              <div class="orb-glow"></div>
              <span class="welcome">欢迎, {{ user?.username }}</span>
            </div>
            <button @click="logout" class="auth-btn logout">
              <span class="btn-glow"></span>
              退出
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="auth-btn login">
              <span class="btn-glow"></span>
              登录
            </router-link>
            <router-link to="/register" class="auth-btn register">
              <span class="btn-glow"></span>
              注册
            </router-link>
          </template>
        </div>
      </div>

      <!-- 导航栏底部的星空光带 -->
      <div class="nav-aurora"></div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <div class="footer-content">
        <div class="shooting-star"></div>
        <p>&copy; 2024 星空艺术馆. 探索宇宙之美</p>
        <p>每一颗星星都是独特的艺术品</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    // 使用计算属性访问 store 状态
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const user = computed(() => store.state.user)
    
    const logout = () => {
      store.dispatch('logout')
      router.push('/')
    }
    
    return {
      isLoggedIn,
      user,
      logout
    }
  },
  data() {
    return {
      isScrolled: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50
    }
  }
}
</script>

<style>
/* 样式保持不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #2d1b69 100%);
  min-height: 100vh;
  color: #fff;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(10, 10, 42, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1000;
  transition: all 0.4s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.navbar.scrolled {
  background: rgba(10, 10, 42, 0.15);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: relative;
}

/* Logo 样式 */
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  font-weight: bold;
  font-size: 1.5rem;
  z-index: 2;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
  animation: starPulse 3s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.logo-text {
  background: linear-gradient(45deg, #ffffff, #8a8aff, #b19fff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 300;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(138, 138, 255, 0.3);
}

/* 导航链接 */
.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
  z-index: 2;
}

.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.nav-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent);
  transition: left 0.6s ease;
}

.nav-link:hover .nav-glow {
  left: 100%;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow:
    0 5px 15px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 中间星空区域 */
.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
}

.star-field {
  position: relative;
  width: 200px;
  height: 40px;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 4s ease-in-out infinite;
}

.star:nth-child(1) {
  width: 3px;
  height: 3px;
  top: 10px;
  left: 30px;
  animation-delay: 0s;
}

.star:nth-child(2) {
  width: 2px;
  height: 2px;
  top: 25px;
  left: 80px;
  animation-delay: 1s;
}

.star:nth-child(3) {
  width: 4px;
  height: 4px;
  top: 15px;
  left: 120px;
  animation-delay: 2s;
}

.star:nth-child(4) {
  width: 2px;
  height: 2px;
  top: 30px;
  left: 160px;
  animation-delay: 3s;
}

.star:nth-child(5) {
  width: 3px;
  height: 3px;
  top: 5px;
  left: 190px;
  animation-delay: 4s;
}

/* 用户区域 */
.nav-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2;
}

.user-orb {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.orb-glow {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8a8aff;
  filter: blur(2px);
  animation: orbPulse 2s ease-in-out infinite;
}

.welcome {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  font-size: 0.9rem;
  margin-left: 12px;
}

/* 按钮样式 */
.auth-btn {
  position: relative;
  padding: 0.7rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 300;
  transition: all 0.4s ease;
  border: none;
  cursor: pointer;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.auth-btn.login {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-btn.register {
  background: linear-gradient(45deg,
    rgba(138, 138, 255, 0.2),
    rgba(177, 159, 255, 0.2));
  color: #fff;
  border: 1px solid rgba(138, 138, 255, 0.3);
}

.auth-btn.logout {
  background: rgba(231, 76, 60, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent);
  transition: left 0.6s ease;
}

.auth-btn:hover .btn-glow {
  left: 100%;
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.auth-btn.login:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.auth-btn.register:hover {
  background: linear-gradient(45deg,
    rgba(138, 138, 255, 0.3),
    rgba(177, 159, 255, 0.3));
}

.auth-btn.logout:hover {
  background: rgba(231, 76, 60, 0.3);
  color: #fff;
}

/* 导航栏极光效果 */
.nav-aurora {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    #8a8aff,
    #b19fff,
    #ff9aff,
    #8a8aff,
    transparent);
  filter: blur(1px);
  opacity: 0.6;
  animation: auroraFlow 4s ease-in-out infinite;
}

.main-content {
  flex: 1;
  margin-top: 80px;
}

.footer {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  text-align: center;
  padding: 3rem 2rem;
  margin-top: auto;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  position: relative;
  z-index: 1;
}

.footer-content p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

.shooting-star {
  position: absolute;
  top: -20px;
  left: 20%;
  width: 2px;
  height: 20px;
  background: linear-gradient(45deg, transparent, #fff, transparent);
  animation: shooting 8s linear infinite;
  filter: blur(0.5px);
}

/* 动画定义 */
@keyframes starPulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8));
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes orbPulse {
  0%, 100% {
    opacity: 0.5;
    box-shadow: 0 0 5px #8a8aff;
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 15px #8a8aff;
  }
}

@keyframes auroraFlow {
  0%, 100% {
    opacity: 0.4;
    background-position: 0% 50%;
  }
  50% {
    opacity: 0.8;
    background-position: 100% 50%;
  }
}

@keyframes shooting {
  0% {
    transform: translateX(0) translateY(0) rotate(45deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateX(100vw) translateY(100vh) rotate(45deg);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-links {
    order: 2;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }

  .nav-center {
    position: relative;
    left: auto;
    transform: none;
    order: 3;
    width: 100%;
    margin-top: 0.5rem;
  }

  .nav-auth {
    order: 4;
    gap: 0.8rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .auth-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .logo-text {
    font-size: 1.3rem;
  }

  .user-orb {
    flex-direction: column;
    gap: 0.3rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .nav-center {
    display: none;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>