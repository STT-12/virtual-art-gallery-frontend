<template>
  <div class="artwork-detail" v-if="artwork">
    <!-- 增强版星空背景 -->
    <div class="starry-background">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
      <div
        v-for="shootingStar in shootingStars"
        :key="'shooting-' + shootingStar.id"
        class="shooting-star"
        :style="shootingStar.style"
      ></div>
    </div>

    <!-- 旋转透明背景 -->
    <div class="rotating-backgrounds">
      <div class="rotating-bg rotating-bg-1"></div>
      <div class="rotating-bg rotating-bg-2"></div>
      <div class="rotating-bg rotating-bg-3"></div>
    </div>

    <div class="artwork-container">
      <!-- 左侧：画作展示区域 -->
      <div class="artwork-visual">
        <div class="artwork-frame-container">
          <!-- 荧光光晕效果 -->
          <div class="fluorescent-halo"></div>

          <!-- 旋转透明背景 -->
          <div
            class="rotating-art-bg"
            :style="{ backgroundImage: `url(/images/artworks/${artwork.id}.jpg)` }"
          ></div>

          <!-- 木制画框 - 使用与首页相同的尺寸 -->
          <div class="wooden-frame">
            <div class="frame-corner corner-tl"></div>
            <div class="frame-corner corner-tr"></div>
            <div class="frame-corner corner-bl"></div>
            <div class="frame-corner corner-br"></div>
            <div class="frame-border"></div>

            <!-- 画作内容 -->
            <div class="artwork-content">
              <div
                ref="artworkImage"
                class="artwork-image"
                @mousemove="handleZoom"
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave"
                @click="toggleZoomMode"
                :class="{ 'zoom-active': isZoomActive, 'zoom-mode': zoomMode }"
                :style="{
                  backgroundImage: `url(/images/artworks/${artwork.id}.jpg)`,
                  cursor: isZoomActive ? 'none' : (zoomMode ? 'zoom-out' : 'zoom-in')
                }"
              >
                <!-- 画作覆盖层（仅在非放大模式显示） -->
                <div v-if="!zoomMode" class="artwork-overlay" @click.stop="toggleAudio">
                  <div class="artwork-basic-info">
                    <h2 class="artwork-title-main">{{ artwork.title }}</h2>
                    <p class="artist-name">{{ artwork.artist }}</p>
                    <p class="artwork-year">{{ artwork.year }}年</p>
                  </div>
                </div>

                <!-- 放大模式提示 -->
                <div v-if="zoomMode" class="zoom-mode-indicator">
                  <div class="zoom-mode-content">
                    <span class="zoom-icon">🔍</span>
                    <span class="zoom-text">放大模式中</span>
                    <span class="zoom-hint">点击任意位置退出</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 荧光效果 -->
          <div class="fluorescent-glow" :class="{ 'enhanced': true }"></div>
        </div>

        <!-- 控制按钮 -->
        <div class="artwork-controls">
          <button @click="likeArtwork" class="control-btn like" :class="{ liked: isLiked }">
            <span class="icon">❤️</span>
            <span class="count">{{ artwork.likes }}</span>
            <div class="btn-glow"></div>
          </button>
          <button @click="toggleAudio" class="control-btn audio" :class="{ playing: isPlaying, loading: audioLoading }">
            <span class="icon">{{ audioLoading ? '⏳' : (isPlaying ? '⏸️' : '🔊') }}</span>
            <span class="text">{{ audioLoading ? '加载中...' : (isPlaying ? '暂停音乐' : '播放音乐') }}</span>
            <div class="btn-glow"></div>
          </button>
          <button @click="toggleZoomMode" class="control-btn zoom" :class="{ active: zoomMode }">
            <span class="icon">{{ zoomMode ? '🔍×' : '🔍+' }}</span>
            <span class="text">{{ zoomMode ? '退出放大' : '全屏放大' }}</span>
            <div class="btn-glow"></div>
          </button>
          <button @click="shareArtwork" class="control-btn share">
            <span class="icon">🔗</span>
            <span class="text">分享</span>
            <div class="btn-glow"></div>
          </button>
          <!-- 新增：复制并分享到社区的按钮 -->
          <button
            v-if="isLoggedIn"
            @click="copyAndShareArtwork"
            class="control-btn copy-and-share"
          >
            <span class="icon">📋</span>
            <span class="text">复制分享</span>
            <div class="btn-glow"></div>
          </button>
        </div>

        <!-- 音频播放器（隐藏） -->
        <audio ref="audioPlayer" :src="audioUrl" preload="metadata" hidden></audio>

        <!-- 音频控制面板 -->
        <div v-if="isPlaying || audioLoading" class="audio-control-panel">
          <div class="audio-controls">
            <div class="audio-info">
              <span class="audio-label">🎧 背景音乐</span>
              <span class="audio-title">{{ artwork.title }} - {{ artwork.artist }}</span>
            </div>
            <div class="audio-progress-container">
              <div class="audio-time-display">
                <span class="current-time">{{ formatTime(currentTime) }}</span>
                <span class="total-time">{{ formatTime(duration) }}</span>
              </div>
              <input
                type="range"
                v-model="progress"
                min="0"
                :max="duration"
                step="0.1"
                @input="seekAudio"
                @change="seekAudio"
                class="audio-progress-slider"
              />
              <div class="audio-progress-bar">
                <div class="progress-filled" :style="{ width: progressPercentage + '%' }"></div>
              </div>
            </div>
            <div class="audio-buttons">
              <button @click="restartAudio" class="audio-control-btn" title="重新播放">
                <span>🔄</span>
              </button>
              <button @click="toggleMute" class="audio-control-btn" :class="{ muted: isMuted }" title="静音">
                <span>{{ isMuted ? '🔇' : '🔊' }}</span>
              </button>
              <button @click="adjustVolume(-0.1)" class="audio-control-btn" title="减小音量">
                <span>🔉</span>
              </button>
              <div class="volume-display">{{ Math.round(volume * 100) }}%</div>
              <button @click="adjustVolume(0.1)" class="audio-control-btn" title="增大音量">
                <span>🔊</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 放大镜控制面板 -->
        <div v-if="isZoomActive && !zoomMode" class="zoom-control-panel">
          <div class="zoom-controls">
            <div class="zoom-info">
              <span class="zoom-label">放大镜</span>
              <span class="zoom-level">放大 {{ zoomLevel }}x</span>
            </div>
            <div class="zoom-slider-container">
              <input
                type="range"
                v-model="zoomLevel"
                min="1.5"
                max="4"
                step="0.5"
                @input="updateZoomLevel"
                class="zoom-slider"
              />
              <div class="zoom-level-markers">
                <span>1.5x</span>
                <span>2x</span>
                <span>3x</span>
                <span>4x</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：画作信息 -->
      <div class="artwork-info">
        <div class="info-header">
          <div class="title-section">
            <h1>{{ artwork.title }}</h1>
            <div class="artwork-style-tag">{{ getStyleName(artwork.style) }}</div>
          </div>
          <div class="artwork-meta">
            <div class="meta-item">
              <span class="meta-label">艺术家</span>
              <span class="meta-value">{{ artwork.artist }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创作年代</span>
              <span class="meta-value">{{ artwork.year }}年</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">艺术风格</span>
              <span class="meta-value">{{ getStyleName(artwork.style) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">分辨率</span>
              <span class="meta-value">{{ imageSize.width }} × {{ imageSize.height }} 像素</span>
            </div>
          </div>
        </div>

        <div class="info-sections">
          <section class="info-section">
            <h3>🎨 作品描述</h3>
            <p>{{ artwork.description }}</p>
          </section>

          <section class="info-section">
            <h3>📖 背景故事</h3>
            <p>{{ artwork.story }}</p>
          </section>

          <section class="info-section zoom-instructions">
            <h3>🔍 查看说明</h3>
            <ul class="instructions-list">
              <li><strong>悬停放大</strong>: 将鼠标移到画作上查看细节放大镜</li>
              <li><strong>放大镜调节</strong>: 使用滑块调整放大倍数 (1.5x - 4x)</li>
              <li><strong>全屏放大</strong>: 点击"全屏放大"按钮或双击画作进入全屏查看模式</li>
              <li><strong>退出全屏</strong>: 在全屏模式下点击任意位置退出</li>
            </ul>
          </section>

          <section class="info-section audio-instructions">
            <h3>🎧  背景音乐</h3>
            <ul class="instructions-list">
              <li><strong>🎧 播放/暂停</strong>: 点击画作上的喇叭按钮或直接点击画作</li>
              <li><strong>🎧 进度控制</strong>: 使用下方进度条控制播放进度</li>
              <li><strong>🎧 音量调节</strong>: 使用音量控制按钮调整音量</li>
              <li><strong>🎧 静音</strong>: 点击静音按钮暂时关闭声音</li>
            </ul>
          </section>

          <section class="info-section comments-section">
            <h3>💬 评论 ({{ artwork.comments.length }})</h3>

            <!-- 调试信息 -->
            <div v-if="debugMode" class="debug-info">
              <p><strong>调试信息</strong></p>
              <p>当前用户: {{ user?.username || '未登录' }}</p>
              <p>登录状态: {{ isLoggedIn }}</p>
              <p>用户ID: {{ user?.id }}</p>
              <button @click="forceReloadComments" style="padding: 5px 10px; background: #3498db; color: white; border: none; border-radius: 3px;">
                强制刷新评论
              </button>
            </div>

            <div class="comments-list">
              <div
                v-for="(comment, index) in artwork.comments"
                :key="comment.id"
                class="comment"
                :data-comment-id="comment.id"
                :style="{ position: 'relative' }"
              >
                <div class="comment-header">
                  <strong>{{ comment.user }}</strong>
                  <span class="comment-time">{{ comment.time }}</span>

                  <!-- 删除按钮 -->
                  <button
                    v-if="canDeleteComment(comment)"
                    @click.stop="handleDeleteComment(comment.id)"
                    class="comment-delete-btn"
                    title="删除评论"
                    style="
                      position: absolute;
                      top: 10px;
                      right: 10px;
                      background: #ff4444;
                      color: white;
                      border: none;
                      border-radius: 50%;
                      width: 28px;
                      height: 28px;
                      font-size: 18px;
                      font-weight: bold;
                      cursor: pointer;
                      z-index: 1000;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
                    "
                  >
                    ×
                  </button>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
                <div class="comment-glow"></div>
              </div>
            </div>

            <div class="comment-form">
              <textarea
                v-model="newComment"
                placeholder="在这片星空下，写下你的感悟..."
                class="comment-input"
              ></textarea>
              <button
                @click="addComment"
                class="comment-submit"
                :disabled="!newComment.trim()"
              >
                发布评论
                <div class="btn-glow"></div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 导航 -->
    <div class="navigation">
      <router-link to="/gallery1" class="nav-back">
        ← 返回星空画廊
        <div class="nav-glow"></div>
      </router-link>
    </div>

    <!-- 全局放大镜（不受画框限制） -->
    <div
      v-if="isZoomActive && !zoomMode"
      class="zoom-lens-global"
      :style="globalZoomStyle"
    >
      <div class="lens-center"></div>
      <div class="lens-info">
        放大 {{ zoomLevel }}x
      </div>
    </div>

    <!-- 音频加载提示 -->
    <div v-if="audioError" class="audio-error-message">
      <p>⚠️ 音频加载失败: {{ audioError }}</p>
      <button @click="retryAudio">重试</button>
    </div>
  </div>

  <div v-else class="artwork-not-found">
    <div class="starry-background">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
      <div
        v-for="shootingStar in shootingStars"
        :key="'shooting-' + shootingStar.id"
        class="shooting-star"
        :style="shootingStar.style"
      ></div>
    </div>
    <div class="rotating-backgrounds">
      <div class="rotating-bg rotating-bg-1"></div>
      <div class="rotating-bg rotating-bg-2"></div>
      <div class="rotating-bg rotating-bg-3"></div>
    </div>
    <div class="not-found-content">
      <h2>✨ 画作未找到 ✨</h2>
      <p>这片星域中没有找到您要寻找的艺术珍品</p>
      <router-link to="/gallery1" class="back-link">
        返回画廊继续探索
      </router-link>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { artworkAPI, commentAPI } from '../utils/api'
import './ArtworkDetail.css'

export default {
  name: 'ArtworkDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    // 使用计算属性访问 store 状态
    const artworks = computed(() => store.state.artworks)
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const user = computed(() => store.state.user)
    
    return {
      store,
      router,
      route,
      artworks,
      isLoggedIn,
      user
    }
  },
  data() {
    return {
      artwork: null,
      isZoomActive: false,
      zoomMode: false,
      zoomStyle: {},
      globalZoomStyle: {},
      zoomLevel: 2,
      zoomPosition: { x: 0, y: 0 },
      isPlaying: false,
      isLiked: false,
      newComment: '',
      stars: [],
      shootingStars: [],
      imageSize: { width: 1200, height: 800 },
      lastZoomTime: 0,
      zoomDebounce: null,
      imageLoaded: false,
      debugMode: false,
      loading: false,
      lensSize: 180,

      // 音频相关
      audioElement: null,
      audioUrl: '',
      currentTime: 0,
      duration: 0,
      progress: 0,
      volume: 0.7,
      isMuted: false,
      audioLoading: false,
      audioError: null,
      updateInterval: null,
      
      // 鼠标位置记录
      mousePosition: null
    }
  },
  computed: {
    artworkColor() {
      const colors = {
        modern: 'linear-gradient(135deg, #ff6b6b, #feca57)',
        classical: 'linear-gradient(135deg, #a29bfe, #74b9ff)',
        abstract: 'linear-gradient(135deg, #55efc4, #81ecec)'
      }
      return colors[this.artwork?.style] || '#dfe6e9'
    },
    zoomScale() {
      return this.zoomLevel
    },
    progressPercentage() {
      return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0
    }
  },
  mounted() {
    console.log('ArtworkDetail 组件挂载，ID:', this.id)
    console.log('路由参数:', this.route.params)
    this.loadArtwork()
    this.initStars()
    this.initShootingStars()
    this.createShootingStars()
    this.loadImageSize()

    window.addEventListener('resize', this.handleResize)
    window.addEventListener('keydown', this.handleKeyDown)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('keydown', this.handleKeyDown)
    if (this.zoomDebounce) {
      clearTimeout(this.zoomDebounce)
    }

    // 清理音频
    this.cleanupAudio()
  },
  methods: {
    async loadArtwork() {
      const artworkId = parseInt(this.id)
      console.log('加载作品，ID:', artworkId)
      console.log('所有作品:', this.artworks)

      this.loading = true

      try {
        // 从 Vuex store 的 artworks 中查找作品
        const localArtwork = this.artworks.find(art => art.id === artworkId)

        if (!localArtwork) {
          console.error('作品不存在:', artworkId)
          return
        }

        this.artwork = { ...localArtwork }

        // 设置音频URL
        this.audioUrl = this.artwork.audio || `/audio/${this.artwork.id}.mp3`
        console.log('音频URL:', this.audioUrl)

        // 加载评论
        await this.loadComments()

        // 初始化点赞数为本地数据的基础值
        console.log('本地作品点赞数:', this.artwork.likes)

        // 如果已登录，从后端获取实时点赞状态
        if (this.isLoggedIn) {
          try {
            console.log('从后端获取实时数据...')
            const artworkData = await artworkAPI.getDetail(artworkId)
            console.log('后端作品数据:', artworkData)

            if (artworkData && artworkData.success) {
              this.artwork.likes = artworkData.likes || 0
              this.isLiked = artworkData.is_liked || false

              console.log('更新后:', {
                点赞数: this.artwork.likes,
                是否点赞: this.isLiked
              })
            }
          } catch (error) {
            console.error('从后端获取点赞数据失败:', error)
            this.isLiked = this.artwork.is_liked || false
          }
        } else {
          this.isLiked = false
        }
      } catch (error) {
        console.error('加载作品失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 音频相关方法
    initAudio() {
      this.cleanupAudio()

      this.audioElement = new Audio(this.audioUrl)
      this.audioElement.volume = this.volume
      this.audioElement.muted = this.isMuted

      // 设置事件监听器
      this.audioElement.addEventListener('loadedmetadata', () => {
        this.duration = this.audioElement.duration
        console.log('音频加载完成，时长:', this.formatTime(this.duration))
        this.audioLoading = false
      })

      this.audioElement.addEventListener('timeupdate', () => {
        this.currentTime = this.audioElement.currentTime
        this.progress = this.currentTime
      })

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true
        this.startProgressUpdate()
      })

      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false
        this.stopProgressUpdate()
      })

      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false
        this.currentTime = 0
        this.progress = 0
        this.stopProgressUpdate()
      })

      this.audioElement.addEventListener('error', (e) => {
        console.error('音频加载错误:', e)
        this.audioError = this.getAudioErrorMessage(this.audioElement.error)
        this.audioLoading = false
        this.isPlaying = false
      })

      // 开始加载音频
      this.audioLoading = true
      this.audioError = null
      this.audioElement.load()
    },

    getAudioErrorMessage(error) {
      if (!error) return '未知错误'

      switch(error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          return '音频加载被中止'
        case MediaError.MEDIA_ERR_NETWORK:
          return '网络错误，请检查网络连接'
        case MediaError.MEDIA_ERR_DECODE:
          return '音频解码错误，文件可能损坏'
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          return '音频格式不支持'
        default:
          return '音频加载失败'
      }
    },

    async toggleAudio() {
      if (!this.audioElement) {
        this.initAudio() // 这里改为非 await
      }

      if (this.isPlaying) {
        await this.pauseAudio()
      } else {
        await this.playAudio()
      }
    },

    async playAudio() {
      try {
        if (!this.audioElement) {
          this.initAudio()
          // 等待元数据加载以避免竞争条件
          await new Promise(resolve => {
            const check = () => {
              if (this.audioElement?.duration) resolve()
              else setTimeout(check, 50)
            }
            check()
          })
        }

        // 等待音频加载完成
        if (this.audioElement.readyState < 2) {
          this.audioLoading = true
          await new Promise((resolve) => {
            const checkReady = () => {
              if (this.audioElement.readyState >= 2) {
                this.audioLoading = false
                resolve()
              } else {
                setTimeout(checkReady, 100)
              }
            }
            checkReady()
          })
        }

        await this.audioElement.play()
        console.log('音频开始播放')
      } catch (error) {
        console.error('播放失败:', error)
        this.audioError = error.message

        // 检查是否是自动播放限制
        if (error.name === 'NotAllowedError') {
          alert('浏览器阻止了自动播放，请先点击页面任意位置，然后重试播放')
        } else {
          alert('无法播放音频: ' + error.message)
        }

        this.audioLoading = false
        this.isPlaying = false
      }
    },

    async pauseAudio() {
      if (this.audioElement) {
        this.audioElement.pause()
      }
    },

    restartAudio() {
      if (this.audioElement) {
        this.audioElement.currentTime = 0
        this.currentTime = 0
        this.progress = 0

        if (!this.isPlaying) {
          this.playAudio()
        }
      }
    },

    seekAudio() {
      if (this.audioElement && this.duration > 0) {
        this.audioElement.currentTime = this.progress
        this.currentTime = this.progress
      }
    },

    toggleMute() {
      this.isMuted = !this.isMuted
      if (this.audioElement) {
        this.audioElement.muted = this.isMuted
      }
    },

    adjustVolume(delta) {
      this.volume = Math.max(0, Math.min(1, this.volume + delta))
      if (this.audioElement) {
        this.audioElement.volume = this.volume
      }
      this.isMuted = false
      if (this.audioElement) {
        this.audioElement.muted = false
      }
    },

    startProgressUpdate() {
      this.stopProgressUpdate()
      this.updateInterval = setInterval(() => {
        if (this.audioElement) {
          this.currentTime = this.audioElement.currentTime
          this.progress = this.currentTime
        }
      }, 100)
    },

    stopProgressUpdate() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
        this.updateInterval = null
      }
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00'

      const minutes = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },

    cleanupAudio() {
      if (this.audioElement) {
        this.audioElement.pause()
        this.audioElement.src = ''
        // 移除所有事件监听器
        this.audioElement.removeEventListener('loadedmetadata', ()=>{});
        this.audioElement.removeEventListener('timeupdate', ()=>{});
        this.audioElement.removeEventListener('play', ()=>{});
        this.audioElement.removeEventListener('pause', ()=>{});
        this.audioElement.removeEventListener('ended', ()=>{});
        this.audioElement.removeEventListener('error', ()=>{});
        this.audioElement = null
      }
      this.stopProgressUpdate()
      this.currentTime = 0
      this.progress = 0
      this.duration = 0
      this.isPlaying = false
      this.audioLoading = false
    },

    retryAudio() {
      this.audioError = null
      this.cleanupAudio() // 先清理旧的
      this.initAudio() // 重新初始化
      this.playAudio()
    },

    // 放大镜相关方法
    handleMouseEnter() {
      if (!this.zoomMode) {
        this.isZoomActive = true
      }
    },

    handleMouseLeave() {
      if (!this.zoomMode) {
        this.isZoomActive = false
        this.globalZoomStyle = {}
      }
    },

    handleZoom(event) {
      if (this.zoomMode) return

      const now = Date.now()
      if (now - this.lastZoomTime < 16) return
      this.lastZoomTime = now

      if (this.zoomDebounce) {
        clearTimeout(this.zoomDebounce)
      }

      this.zoomDebounce = setTimeout(() => {
        this.updateGlobalZoom(event)
      }, 8)
    },

    updateGlobalZoom(event) {
      const imageEl = this.$refs.artworkImage
      if (!imageEl || !this.isZoomActive) return

      const rect = imageEl.getBoundingClientRect()

      // 确保鼠标在画作范围内
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        this.isZoomActive = false // 鼠标移出范围时也禁用放大镜
        this.globalZoomStyle = {}
        return
      }
       
      // 如果之前是 false，重新设为 true
      if (!this.isZoomActive) {
        this.isZoomActive = true
      }

      // 计算相对位置
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height

      // 计算放大镜位置（鼠标居中）
      const lensSize = this.lensSize
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let lensX = event.clientX - lensSize / 2
      let lensY = event.clientY - lensSize / 2

      // 边界检查，防止放大镜超出视窗
      lensX = Math.max(10, Math.min(lensX, viewportWidth - lensSize - 10))
      lensY = Math.max(10, Math.min(lensY, viewportHeight - lensSize - 10))

      // 保存鼠标位置
      this.mousePosition = {
        x: event.clientX,
        y: event.clientY
      }

      this.zoomPosition = { x, y }

      // 创建放大效果
      this.globalZoomStyle = {
        backgroundImage: `url(/images/artworks/${this.artwork.id}.jpg)`,
        backgroundSize: `${rect.width * this.zoomScale}px ${rect.height * this.zoomScale}px`,
        backgroundPosition: `${x * 100}% ${y * 100}%`,
        left: `${lensX}px`,
        top: `${lensY}px`,
        width: `${lensSize}px`,
        height: `${lensSize}px`,
        opacity: 1,
        transform: `translateZ(0)`,
        zIndex: 9999
      }
    },

    updateZoomLevel() {
      if (this.isZoomActive && !this.zoomMode && this.mousePosition) {
        const fakeEvent = {
          clientX: this.mousePosition.x,
          clientY: this.mousePosition.y
        }
        this.updateGlobalZoom(fakeEvent)
      }
    },

    toggleZoomMode() {
      if (this.zoomMode) {
        this.zoomMode = false
        this.isZoomActive = false
        this.globalZoomStyle = {}
        document.body.style.overflow = 'auto'
      } else {
        this.zoomMode = true
        this.isZoomActive = true
        this.globalZoomStyle = {}
        document.body.style.overflow = 'hidden'

        setTimeout(() => {
          const imageEl = this.$refs.artworkImage
          if (imageEl) {
            const rect = imageEl.getBoundingClientRect()
            this.zoomStyle = {
              backgroundImage: `url(/images/artworks/${this.artwork.id}.jpg)`,
              backgroundSize: `${rect.width * 3}px ${rect.height * 3}px`,
              backgroundPosition: '50% 50%',
              cursor: 'zoom-out'
            }
          }
        }, 10)
      }
    },

    handleResize() {
      if (this.zoomMode) {
        const imageEl = this.$refs.artworkImage
        if (imageEl) {
          const rect = imageEl.getBoundingClientRect()
          this.zoomStyle.backgroundSize = `${rect.width * 3}px ${rect.height * 3}px`
        }
      }
    },

    handleKeyDown(event) {
      if (event.key === 'Escape' && this.zoomMode) {
        this.toggleZoomMode()
      }

      if (this.isZoomActive && !this.zoomMode) {
        if (event.key === '+' || event.key === '=') {
          event.preventDefault()
          this.zoomLevel = Math.min(4, this.zoomLevel + 0.5)
          this.updateZoomLevel()
        } else if (event.key === '-' || event.key === '_') {
          event.preventDefault()
          this.zoomLevel = Math.max(1.5, this.zoomLevel - 0.5)
          this.updateZoomLevel()
        }
      }
    },

    async loadComments() {
      if (!this.artwork) return

      try {
        console.log('加载评论，作品ID:', this.artwork.id)
        const response = await commentAPI.getByArtwork(this.artwork.id)
        console.log('评论响应:', response)

        if (response.success && response.comments) {
          this.artwork.comments = response.comments.map(comment => ({
            id: comment.id,
            user: comment.username || comment.user,
            text: comment.content,
            time: comment.formatted_time || comment.created_at,
            username: comment.username,
            content: comment.content,
            formatted_time: comment.formatted_time,
            user_id: comment.user_id
          }))
          this.artwork.comments_count = this.artwork.comments.length

          console.log('处理后的评论:', this.artwork.comments)
        } else {
          this.artwork.comments = this.artwork.comments || []
          this.artwork.comments_count = this.artwork.comments.length
        }
      } catch (error) {
        console.error('加载评论失败:', error)
        this.artwork.comments = this.artwork.comments || []
        this.artwork.comments_count = this.artwork.comments.length
      }
    },

    async forceReloadComments() {
      console.log('强制刷新评论...')
      await this.loadComments()
    },

    canDeleteComment(comment) {
      if (!this.user || !this.user.id) {
        console.log('用户未登录或没有用户ID')
        return false
      }

      const currentUserId = this.user.id
      const commentUserId = comment.user_id

      console.log('检查删除权限:', {
        当前用户ID: currentUserId,
        评论用户ID: commentUserId,
        评论ID: comment.id,
        匹配: currentUserId == commentUserId
      })

      return currentUserId == commentUserId
    },

    async handleDeleteComment(commentId) {
      console.log('🎯 === 开始删除评论 ===')
      console.log('评论ID:', commentId)
      console.log('当前用户:', this.user)

      const commentIndex = this.artwork.comments.findIndex(c => c.id == commentId)
      if (commentIndex === -1) {
        console.error('未找到评论:', commentId)
        alert('评论不存在')
        return
      }

      const comment = this.artwork.comments[commentIndex]
      console.log('找到评论:', comment)

      if (!this.canDeleteComment(comment)) {
        alert('您没有权限删除此评论')
        return
      }

      if (!confirm(`确定要删除评论"${comment.text ? comment.text.substring(0, 30) : comment.content ? comment.content.substring(0, 30) : '此评论'}..."吗？`)) {
        return
      }

      try {
        const deletedComment = this.artwork.comments.splice(commentIndex, 1)[0]
        this.artwork.comments_count = this.artwork.comments.length
        console.log('前端删除成功:', deletedComment)

        console.log('准备发送删除请求...')
        const response = await commentAPI.delete(commentId)
        console.log('后端响应:', response)

        if (response.success) {
          console.log('✅ 评论删除成功')
          alert('评论已删除')
        } else {
          console.warn('后端删除返回失败:', response.error)
          this.artwork.comments.splice(commentIndex, 0, deletedComment)
          this.artwork.comments_count = this.artwork.comments.length
          alert('删除失败: ' + response.error)
        }
      } catch (error) {
        console.error('❌ 删除评论出错详情:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          error: error
        })

        alert('删除失败: ' + (error.message || '未知错误'))
        await this.loadComments()
      }
    },

    initStars() {
      for (let i = 0; i < 150; i++) {
        this.stars.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }
        })
      }
    },

    initShootingStars() {
      for (let i = 0; i < 5; i++) {
        this.shootingStars.push({
          id: i,
          style: {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`
          }
        })
      }
    },

    createShootingStars() {
      setInterval(() => {
        if (this.shootingStars.length < 10) {
          this.shootingStars.push({
            id: Date.now(),
            style: {
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: '0s'
            }
          })
        }
      }, 5000)
    },

    async likeArtwork() {
      console.log('🎯 === 开始点赞 ===')
      console.log('当前作品ID:', this.artwork.id)
      console.log('当前显示点赞数:', this.artwork.likes)
      console.log('当前点赞状态:', this.isLiked)

      if (!this.isLoggedIn) {
        alert('请先登录后再点赞')
        return
      }

      try {
        console.log('📡 发送点赞请求...')
        const response = await artworkAPI.toggleLike(this.artwork.id)
        console.log('✅ 点赞响应:', response)

        if (response.success) {
          this.artwork.likes = response.likes
          this.isLiked = response.is_liked

          console.log('更新后的数据:', {
            点赞数: this.artwork.likes,
            是否点赞: this.isLiked
          })

          // 调用 Vuex action 来更新点赞状态
          this.store.dispatch('likeArtwork', this.artwork.id)

          const message = response.is_liked ? '已点赞！' : '已取消点赞'
          this.showLikeMessage(message)
        } else {
          alert('点赞失败: ' + response.error)
        }
      } catch (error) {
        console.error('❌ 点赞失败详情:', error)
        alert('点赞失败: ' + (error.response?.data?.error || error.message))
      }
    },

    showLikeMessage(message) {
      const messageEl = document.createElement('div')
      messageEl.className = 'like-message'
      messageEl.innerHTML = `
        <div class="message-content">
          <span class="message-icon">${this.isLiked ? '❤️' : '🤍'}</span>
          <span class="message-text">${message}</span>
        </div>
      `
      document.body.appendChild(messageEl)

      setTimeout(() => {
        messageEl.classList.add('fade-out')
        setTimeout(() => {
          document.body.removeChild(messageEl)
        }, 500)
      }, 2000)
    },

    shareArtwork() {
      const url = window.location.href
      navigator.clipboard.writeText(url)
      alert('作品链接已复制到剪贴板！')
    },

    // 新增：复制并分享到社区的方法（原始代码完整保留）
    async copyAndShareArtwork() {
      const url = window.location.href
      try {
        await navigator.clipboard.writeText(url)

        const goToCommunity = confirm(
          '您已经将当前作品复制到剪贴板，请问要跳转画廊社区分享给你的社区好友吗?'
        )

        if (goToCommunity) {
          this.router.push('/gallery-community')
        } else {
          alert('作品链接已复制，您可以在社区中手动粘贴分享给好友！')
        }
      } catch (err) {
        console.error('复制链接失败:', err)
        alert('复制链接失败，您的浏览器可能不支持或权限不足。')
      }
    },

    async addComment() {
      console.log('🎯 === 开始添加评论 ===')
      console.log('评论内容:', this.newComment)
      console.log('作品ID:', this.artwork.id)
      console.log('用户信息:', this.user)

      if (!this.newComment.trim()) {
        console.log('评论内容为空，不提交')
        return
      }

      if (!this.isLoggedIn) {
        alert('请先登录后再评论')
        return
      }

      try {
        console.log('📡 发送评论请求...')

        const commentData = {
          artwork_id: this.artwork.id,
          content: this.newComment.trim()
        }

        console.log('请求数据:', commentData)

        const response = await commentAPI.create(commentData)
        console.log('✅ 评论响应:', response)

        if (response.success) {
          console.log('评论成功，刷新评论列表...')
          await this.loadComments()
          this.newComment = ''
          alert('评论发布成功！')
        } else {
          alert('评论失败: ' + response.error)
        }
      } catch (error) {
        console.error('❌ 评论失败详情:', {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        })

        console.log('使用本地评论作为备用')
        // 调用 Vuex action 添加评论
        this.store.dispatch('addComment', {
          artworkId: this.artwork.id,
          comment: {
            user: this.user.username,
            text: this.newComment.trim(),
            user_id: this.user.id
          }
        })

        if (!this.artwork.comments) this.artwork.comments = []
        this.artwork.comments.unshift({
          id: Date.now(),
          user: this.user.username,
          text: this.newComment.trim(),
          time: new Date().toLocaleDateString(),
          username: this.user.username,
          content: this.newComment.trim(),
          formatted_time: new Date().toLocaleString(),
          user_id: this.user.id
        })

        this.artwork.comments_count = (this.artwork.comments_count || 0) + 1
        this.newComment = ''

        alert('评论已保存（本地模式），请检查网络连接')
      }
    },

    getStyleName(style) {
      const names = {
        modern: '现代艺术',
        classical: '古典艺术',
        abstract: '抽象艺术'
      }
      return names[style] || style
    },

    loadImageSize() {
      if (!this.artwork || !this.artwork.id) {
        console.warn('作品数据未加载，跳过图片加载')
        return
      }

      const img = new Image()
      const imageUrl = `/images/artworks/${this.artwork.id}.jpg`
      console.log('加载图片:', imageUrl)
      img.src = imageUrl

      img.onload = () => {
        console.log('图片加载成功:', imageUrl, '尺寸:', img.naturalWidth, 'x', img.naturalHeight)
        this.imageSize = {
          width: img.naturalWidth,
          height: img.naturalHeight
        }
        this.imageLoaded = true
      }

      img.onerror = () => {
        console.warn('图片加载失败:', imageUrl, '使用默认尺寸')
        this.imageLoaded = true
      }
    }
  },
  watch: {
    id(newId, oldId) {
      if (newId !== oldId) {
        console.log('ID变化，重新加载数据')
        // 重置组件状态
        this.artwork = null
        this.isZoomActive = false
        this.zoomMode = false
        this.isPlaying = false
        this.isLiked = false
        this.newComment = ''
        this.audioError = null

        // 清理音频
        this.cleanupAudio()

        // 重新加载数据
        this.loadArtwork()
        this.loadImageSize()
      }
    }
  }
}
</script>