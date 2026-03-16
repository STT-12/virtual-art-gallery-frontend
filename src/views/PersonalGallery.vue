<template>
  <div class="personal-gallery">
    <!-- 星空背景元素 -->
    <div class="starry-background"></div>
    <div class="meteor-shower"></div>
    <div class="frosted-overlay"></div>
    <div class="rotating-background-frame">
      <div class="rotating-frame">
        <div class="frame-content" :style="{ backgroundImage: `url('${getRandomArtworkImage()}')` }"></div>
      </div>
    </div>
    <div class="art-silhouettes"></div>
    <div class="time-particles"></div>

    <!-- 主要内容 -->
    <div class="gallery-content">
      <!-- 头部 -->
      <div class="gallery-header">
        <h1 class="fluorescent-title">🌟 我的个人画廊</h1>
        <p class="fluorescent-subtitle">在星辰大海中，收藏您最爱的艺术作品</p>

        <!-- 按钮容器 -->
        <div class="gallery-header-buttons">
          <button @click="createNewGallery" class="cosmic-btn create-btn">
            <span class="btn-content">
              <span class="btn-glow"></span>
              <span class="icon">✨</span>
              创建我的画廊
            </span>
          </button>

          <!-- 新增：画廊社区按钮 -->
          <button @click="goToCommunity" class="cosmic-btn community-btn">
            <span class="btn-content">
              <span class="btn-glow"></span>
              <span class="icon">👥</span>
              画廊社区
            </span>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="personalGalleries.length === 0" class="empty-state">
        <div class="empty-card cosmic-card">
          <div class="card-background"></div>
          <div class="card-overlay"></div>
          <div class="card-content">
            <div class="fluorescent-icon">🖼️</div>
            <h3 class="fluorescent-title">还没有创建画廊</h3>
            <p class="fluorescent-text">让星辰见证您的艺术品味，开始收藏第一幅作品</p>
            <button @click="createNewGallery" class="cosmic-btn empty-btn">
              <span class="btn-content">
                <span class="btn-glow"></span>
                创建第一个画廊
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 画廊网格 -->
      <div v-else class="galleries-grid">
        <div
          v-for="gallery in personalGalleries"
          :key="gallery.id"
          class="gallery-card cosmic-card"
          @mouseenter="hoverGalleryCard = gallery.id"
          @mouseleave="hoverGalleryCard = null"
        >
          <div class="card-background"></div>
          <div class="card-overlay"></div>
          <div class="card-content">
            <!-- 画廊预览 -->
            <div class="gallery-preview">
              <div class="preview-artworks">
                <!-- 显示实际画作 -->
                <div
                  v-for="(item, index) in getActualGalleryItems(gallery)"
                  :key="item.id"
                  class="preview-artwork cosmic-frame"
                  :style="{
                    transform: `rotate(${(index - 1.5) * 3}deg) translateY(${hoverGalleryCard === gallery.id ? '-10px' : '0'})`,
                    zIndex: 4 - index,
                    animationDelay: `${index * 0.2}s`
                  }"
                >
                  <!-- 木制画框 -->
                  <div class="wooden-frame">
                    <div class="frame-corner corner-tl"></div>
                    <div class="frame-corner corner-tr"></div>
                    <div class="frame-corner corner-bl"></div>
                    <div class="frame-corner corner-br"></div>
                    <div class="frame-border"></div>

                    <!-- 使用实际作品图片 -->
                    <div class="artwork-content" :style="{
                      backgroundImage: `url('${item.imageUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }">
                      <div class="artwork-title-small">{{ item.title }}</div>
                      <div class="artwork-glow" :style="{ background: getArtworkColor(item.style) }"></div>
                    </div>
                  </div>

                  <!-- 荧光效果 -->
                  <div class="fluorescent-glow" :class="{ 'active': hoverGalleryCard === gallery.id }"
                       :style="{ background: getArtworkColor(item.style) }"></div>
                </div>

                <!-- 空状态提示 -->
                <div v-if="getGalleryItemCount(gallery) === 0" class="empty-preview-hint">
                  <div class="hint-icon">🎨</div>
                  <div class="hint-text">暂无作品</div>
                </div>
              </div>
              <div class="star-field">
                <span v-for="n in 8" :key="n" class="star" :style="starStyle(n)">✨</span>
              </div>

              <!-- 画廊标签 -->
              <div class="preview-label" :class="gallery.privacy">
                <span class="label-icon">{{ getPrivacyIcon(gallery.privacy) }}</span>
                <span class="label-text">{{ getPrivacyText(gallery.privacy) }}</span>
              </div>
            </div>

            <!-- 画廊信息 -->
            <div class="gallery-info">
              <div class="gallery-header-row">
                <h3 class="fluorescent-title">{{ gallery.name }}</h3>
                <button @click="confirmDeleteGallery(gallery)" class="icon-btn delete-btn">
                  <span class="icon">🗑️</span>
                </button>
              </div>
              <div class="gallery-meta">
                <span class="meta-item cosmic-text">
                  <span class="meta-icon">🎨</span>
                  {{ getGalleryItemCount(gallery) }} 件作品
                </span>
                <span class="meta-item cosmic-text">
                  <span class="meta-icon">📅</span>
                  {{ formatDate(gallery.created_at || gallery.createdAt) }}
                </span>
                <span class="meta-item privacy cosmic-text" :class="gallery.privacy">
                  <span class="meta-icon">{{ getPrivacyIcon(gallery.privacy) }}</span>
                  {{ getPrivacyText(gallery.privacy) }}
                </span>
              </div>
              <p v-if="gallery.description" class="gallery-description cosmic-text">
                {{ gallery.description }}
              </p>
              <p v-else class="gallery-description placeholder cosmic-text">
                暂无描述
              </p>
              <div class="gallery-actions">
                <button @click="editGallery(gallery)" class="cosmic-btn action-btn edit">
                  <span class="btn-content">
                    <span class="btn-glow"></span>
                    <span class="action-icon">✏️</span>
                    编辑
                  </span>
                </button>
                <button @click="shareGallery(gallery)" class="cosmic-btn action-btn share">
                  <span class="btn-content">
                    <span class="btn-glow"></span>
                    <span class="action-icon">🔗</span>
                    分享
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 画廊编辑器 -->
    <div v-if="showEditor" class="gallery-editor cosmic-editor">
      <div class="editor-overlay" @click="closeEditor"></div>
      <div class="editor-container">
        <div class="editor-card cosmic-card">
          <!-- 编辑器星空背景 -->
          <div class="editor-starry-background">
            <div v-for="star in editorStars" :key="star.id" class="editor-star" :style="star.style"></div>
          </div>
          <div class="editor-nebula"></div>

          <div class="card-background"></div>
          <div class="card-overlay"></div>
          <div class="card-content">
            <!-- 编辑器头部 -->
            <div class="editor-header">
              <h2 class="fluorescent-title">
                {{ editingGallery ? '✨ 编辑画廊' : '🌟 创建新画廊' }}
              </h2>
              <button @click="closeEditor" class="cosmic-btn close-btn">
                <span class="btn-content">×</span>
              </button>
            </div>

            <!-- 编辑器内容 -->
            <div class="editor-content">
              <!-- 侧边栏 - 可用画作 -->
              <div class="editor-sidebar">
                <h3 class="fluorescent-subtitle">🪐 可用画作</h3>
                <div class="search-box">
                  <input
                    v-model="searchQuery"
                    placeholder="搜索画作..."
                    class="cosmic-input search-input"
                  >
                </div>
                <div class="artworks-palette">
                  <div
                    v-for="artwork in availableArtworks"
                    :key="artwork.id"
                    class="palette-item"
                    draggable="true"
                    @dragstart="startDrag(artwork)"
                  >
                    <div class="palette-frame cosmic-frame">
                      <div class="palette-artwork" :style="{
                        backgroundImage: `url('${getArtworkImageUrl(artwork)}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }">
                        <div class="palette-overlay"></div>
                        <div class="palette-title">{{ artwork.title }}</div>
                      </div>
                      <div class="palette-glow" :style="{ background: getArtworkColor(artwork.style) }"></div>
                    </div>
                    <div class="palette-info">
                      <div class="palette-artist">{{ artwork.artist || '未知艺术家' }}</div>
                      <div class="palette-year">{{ artwork.year || '未知年份' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 工作区 -->
              <div
                class="editor-workspace"
                @dragover.prevent
                @drop="dropArtwork"
                ref="workspace"
                :class="[`theme-${currentGallery.theme}`, `${currentGallery.layout}-layout`]"
              >
                <!-- 星空画布背景 -->
                <div class="workspace-stars"></div>
                <div class="workspace-grid"></div>
                <div class="workspace-nebula"></div>

                <!-- 展厅墙壁效果 -->
                <div class="gallery-wall">
                  <div class="wall-pattern"></div>
                  <div class="wall-lighting"></div>
                </div>

                <!-- 工作区中的作品项 -->
                <div
                  v-for="item in currentGallery.items"
                  :key="item.id"
                  class="workspace-item"
                  :style="{
                    left: item.x + 'px',
                    top: item.y + 'px',
                    width: item.width + 'px',
                    height: item.height + 'px',
                    transform: `scale(${item.scale || 1}) rotate(${item.rotate || 0}deg)`
                  }"
                  @mousedown="startDragItem(item, $event)"
                >
                  <!-- 木制画框 -->
                  <div class="wooden-frame">
                    <div class="frame-corner corner-tl"></div>
                    <div class="frame-corner corner-tr"></div>
                    <div class="frame-corner corner-bl"></div>
                    <div class="frame-corner corner-br"></div>
                    <div class="frame-border"></div>

                    <!-- 确保显示正确的图片 -->
                    <div class="artwork-content" :style="{
                      backgroundImage: `url('${getArtworkImageUrl(item)}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }">
                      <div class="artwork-overlay"></div>
                      <div class="artwork-title-small">{{ item.title || '未命名作品' }}</div>
                      <div class="artwork-glow" :style="{ background: getArtworkColor(item.style) }"></div>
                    </div>
                  </div>

                  <button @click.stop="removeItem(item.id)" class="cosmic-btn item-remove">
                    <span class="btn-content">×</span>
                  </button>

                  <!-- 调整大小手柄 -->
                  <div class="resize-handle" @mousedown.stop="startResize(item, $event)"></div>

                  <!-- 荧光效果 -->
                  <div class="workspace-item-glow" :style="{ background: getArtworkColor(item.style) }"></div>
                </div>

                <!-- 放置提示 -->
                <div v-if="currentGallery.items.length === 0" class="drop-zone-hint">
                  <div class="hint-icon">↓</div>
                  <div class="hint-text">将画作拖拽到此处</div>
                  <div class="hint-subtext">拖动右下角可调整画作大小</div>
                </div>
              </div>

              <!-- 控制面板 -->
              <div class="editor-controls">
                <div class="gallery-settings">
                  <div class="form-group">
                    <label class="fluorescent-label">
                      <span class="star-icon">★</span>
                      画廊名称
                    </label>
                    <input
                      v-model="currentGallery.name"
                      placeholder="为您的画廊起个名字..."
                      class="cosmic-input gallery-name-input"
                      :class="{ 'error': !currentGallery.name.trim() }"
                    >
                    <div v-if="!currentGallery.name.trim()" class="error-message">
                      请输入画廊名称
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="fluorescent-label">
                      <span class="star-icon">★</span>
                      画廊描述
                    </label>
                    <textarea
                      v-model="currentGallery.description"
                      placeholder="描述一下这个画廊的主题..."
                      class="cosmic-input gallery-description-input"
                      rows="3"
                    ></textarea>
                  </div>

                  <!-- 画廊主题选择 -->
                  <div class="form-group">
                    <label class="fluorescent-label">
                      <span class="star-icon">🎨</span>
                      画廊背景
                    </label>
                    <div class="themes-grid">
                      <div
                        v-for="theme in backgroundThemes"
                        :key="theme.id"
                        :class="['theme-option', { active: currentGallery.theme === theme.id }]"
                        @click="selectTheme(theme.id)"
                        :style="{ background: theme.bg }"
                      >
                        <div class="theme-icon">{{ theme.icon }}</div>
                        <div class="theme-name">{{ theme.name }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- 画廊排列 -->
                  <div class="form-group">
                    <label class="fluorescent-label">
                      <span class="star-icon">🔄</span>
                      画作排列
                    </label>
                    <div class="layouts-grid">
                      <div
                        v-for="layout in arrangementModes"
                        :key="layout.id"
                        :class="['layout-option', { active: currentGallery.layout === layout.id }]"
                        @click="selectLayout(layout.id)"
                      >
                        <div class="layout-icon">{{ layout.icon }}</div>
                        <div class="layout-name">{{ layout.name }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="fluorescent-label">
                      <span class="star-icon">★</span>
                      隐私设置
                    </label>
                    <select v-model="currentGallery.privacy" class="cosmic-select privacy-select">
                      <option value="public">🌍 公开 - 所有人可见</option>
                      <option value="friends">👥 好友可见 - 仅好友可见</option>
                      <option value="private">🔒 私密 - 仅自己可见</option>
                    </select>
                  </div>
                </div>

                <div class="control-buttons">
                  <button @click="applyCurrentArrangement" class="cosmic-btn arrange-btn">
                    <span class="btn-content">
                      <span class="btn-glow"></span>
                      🎨 应用排列
                    </span>
                  </button>
                  <button @click="saveGallery" class="cosmic-btn save-btn" :disabled="!canSave">
                    <span class="btn-content">
                      <span class="btn-glow"></span>
                      💫 保存画廊
                    </span>
                  </button>
                  <button @click="closeEditor" class="cosmic-btn cancel-btn">
                    <span class="btn-content">取消</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="confirm-dialog">
      <div class="dialog-overlay" @click="showDeleteConfirm = false"></div>
      <div class="dialog-content cosmic-card">
        <div class="dialog-header">
          <h3 class="fluorescent-title">🗑️ 确认删除</h3>
        </div>
        <div class="dialog-body cosmic-text">
          <p>确定要删除画廊 "{{ galleryToDelete?.name }}" 吗？此操作无法撤销。</p>
        </div>
        <div class="dialog-actions">
          <button @click="deleteGallery" class="cosmic-btn delete-confirm-btn">
            <span class="btn-content">确认删除</span>
          </button>
          <button @click="showDeleteConfirm = false" class="cosmic-btn cancel-btn">
            <span class="btn-content">取消</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import './PersonalGallery.css'

export default {
  name: 'PersonalGallery',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    // 从 store 获取状态
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const personalGalleries = computed(() => store.state.personalGalleries || [])
    const artworks = computed(() => store.state.artworks || [])
    
    // 响应式数据
    const showEditor = ref(false)
    const editingGallery = ref(null)
    const hoverGalleryCard = ref(null)
    const currentGallery = ref({
      id: null,
      name: '',
      description: '',
      items: [],
      privacy: 'public',
      theme: 'starry',
      layout: 'free',
      createdAt: new Date().toISOString()
    })
    const availableArtworks = ref([])
    const filteredArtworks = ref([])
    const draggedItem = ref(null)
    const draggedGalleryItem = ref(null)
    const dragOffset = ref({ x: 0, y: 0 })
    const editorStars = ref([])
    const searchQuery = ref('')
    const resizingItem = ref(null)
    const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 })
    const showDeleteConfirm = ref(false)
    const galleryToDelete = ref(null)

    // 画廊主题选项
    const backgroundThemes = ref([
      {
        id: 'retro',
        name: '复古',
        bg: 'linear-gradient(135deg, #f8e9a1, #f76c6c, #a8d0e6)',
        icon: '🕰️'
      },
      {
        id: 'minimal',
        name: '简约',
        bg: 'linear-gradient(135deg, #f8f9fa, #e9ecef, #dee2e6)',
        icon: '⬜'
      },
      {
        id: 'starry',
        name: '星空',
        bg: 'linear-gradient(135deg, #0c2461, #1e3799, #4a69bd)',
        icon: '✨'
      },
      {
        id: 'dark',
        name: '暗夜',
        bg: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        icon: '🌙'
      }
    ])

    // 排列方式选项
    const arrangementModes = ref([
      {
        id: 'grid',
        name: '方格',
        icon: '⬛'
      },
      {
        id: 'spiral',
        name: '螺旋',
        icon: '🌀'
      },
      {
        id: 'free',
        name: '自由',
        icon: '🎨'
      },
      {
        id: 'random',
        name: '随机',
        icon: '🎲'
      }
    ])

    const canSave = computed(() => {
      return currentGallery.value.name.trim() !== '' && currentGallery.value.items.length > 0
    })

    // starStyle 方法 - 这是模板中需要的
    const starStyle = (index) => {
      return {
        position: 'absolute',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 0.8 + 0.5}rem`,
        opacity: Math.random() * 0.6 + 0.4,
        animationDelay: `${Math.random() * 2}s`,
        filter: `blur(${Math.random() * 0.3}px)`
      }
    }

    // 🟢【修复】加载个人画廊数据
    const loadPersonalGalleries = async () => {
      try {
        console.log('🟢 开始加载个人画廊...')
        
        // 使用 store 的 action 获取画廊数据
        await store.dispatch('fetchMyGalleries')
        
        // 从 store 中获取画廊数据
        const galleries = personalGalleries.value
        console.log('✅ 加载个人画廊完成:', galleries.length, '个画廊')
        
        // 打印画廊信息用于调试
        galleries.forEach((gallery, index) => {
          console.log(`画廊 ${index + 1}:`, {
            id: gallery.id,
            name: gallery.name,
            artworks_count: gallery.artworks?.length || gallery.items?.length || 0
          })
        })
        
      } catch (error) {
        console.error('❌ 加载个人画廊失败:', error)
        showMessage('加载画廊失败，请刷新页面重试', 'warning')
      }
    }

    // 🟢【修复】加载可用画作数据
    const loadAvailableArtworks = async () => {
      try {
        console.log('🟢 开始加载可用画作...')
        
        // 直接从 store 的 artworks 获取数据
        const allArtworks = artworks.value
        
        // 处理艺术作品数据
        availableArtworks.value = allArtworks.map(art => ({
          id: art.id,
          title: art.title || '未命名作品',
          artist: art.artist || '未知艺术家',
          year: art.year || '',
          style: art.style || 'classical',
          description: art.description || '',
          imageUrl: getArtworkImageUrl(art),
          width: 150,
          height: 180,
          scale: 1,
          x: 0,
          y: 0,
          rotate: 0
        }))
        
        filteredArtworks.value = [...availableArtworks.value]
        console.log('✅ 可用画作加载完成:', availableArtworks.value.length, '个')
        
      } catch (error) {
        console.error('❌ 加载画作失败:', error)
        
        // 紧急恢复：使用空数组
        availableArtworks.value = []
        filteredArtworks.value = []
        console.log('⚠️ 使用空画作数据')
      }
    }

    onMounted(async () => {
      if (!isLoggedIn.value) {
        console.log('❌ 用户未登录，跳转到登录页')
        router.push('/login')
        return
      }

      try {
        console.log('🟢 页面初始化...')
        
        // 加载用户画廊
        await loadPersonalGalleries()

        // 加载可用画作
        await loadAvailableArtworks()

        // 初始化背景特效
        initStarryBackground()
        
        console.log('✅ 页面初始化完成')
      } catch (error) {
        console.error('❌ 页面初始化失败:', error)
        showMessage('页面加载失败，请刷新重试', 'warning')
      }
    })

    watch(showEditor, (newVal) => {
      if (newVal) {
        initEditorStars()

        // 编辑器显示后应用主题
        setTimeout(() => {
          applyThemeToWorkspace()
        }, 200)
      }
    })

    watch(searchQuery, () => {
      filterArtworks()
    })

    // 跳转到画廊社区
    const goToCommunity = () => {
      router.push('/gallery-community')
    }

    // 获取随机作品图片用于旋转背景
    const getRandomArtworkImage = () => {
      // 使用固定的背景图片
      return '/images/artworks/20.jpg'
    }

    // 初始化星空背景
    const initStarryBackground = () => {
      createStars('.starry-background', 100)
      createMeteors('.meteor-shower', 8)
      createParticles('.time-particles', 30)
      createSilhouettes('.art-silhouettes', 12)
    }

    const initEditorStars = () => {
      editorStars.value = []
      for (let i = 0; i < 50; i++) {
        editorStars.value.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            opacity: Math.random() * 0.5 + 0.3
          }
        })
      }
    }

    const createStars = (selector, count) => {
      const container = document.querySelector(selector)
      if (!container) return

      for (let i = 0; i < count; i++) {
        const star = document.createElement('div')
        star.className = 'star'
        star.style.cssText = `
          position: absolute;
          width: ${Math.random() * 3 + 1}px;
          height: ${Math.random() * 3 + 1}px;
          background: white;
          border-radius: 50%;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          opacity: ${Math.random() * 0.8 + 0.2};
          animation: twinkle ${Math.random() * 3 + 2}s linear infinite ${Math.random() * 2}s;
          filter: blur(${Math.random() * 0.5}px);
        `
        container.appendChild(star)
      }
    }

    const createMeteors = (selector, count) => {
      const container = document.querySelector(selector)
      if (!container) return

      for (let i = 0; i < count; i++) {
        const meteor = document.createElement('div')
        meteor.className = 'meteor'
        meteor.style.cssText = `
          top: ${Math.random() * 50}%;
          left: ${Math.random() * 100}%;
          animation-delay: ${Math.random() * 15}s;
        `
        container.appendChild(meteor)
      }
    }

    const createParticles = (selector, count) => {
      const container = document.querySelector(selector)
      if (!container) return

      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.cssText = `
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          background: hsl(${Math.random() * 60 + 200}, 100%, 70%);
          animation-duration: ${Math.random() * 10 + 5}s;
          animation-delay: ${Math.random() * 5}s;
        `
        container.appendChild(particle)
      }
    }

    const createSilhouettes = (selector, count) => {
      const silhouettes = ['🎨', '🖼️', '✨', '🌟', '💫', '🪐', '🌌', '🌠', '⭐', '☄️', '🔭', '🎭']
      const container = document.querySelector(selector)
      if (!container) return

      for (let i = 0; i < count; i++) {
        const silhouette = document.createElement('div')
        silhouette.className = 'silhouette'
        silhouette.textContent = silhouettes[Math.floor(Math.random() * silhouettes.length)]
        silhouette.style.cssText = `
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          animation-delay: ${Math.random() * 8}s;
          font-size: ${Math.random() * 2 + 1.5}rem;
        `
        container.appendChild(silhouette)
      }
    }

    // 🟢【修复】获取画廊作品数量
    const getGalleryItemCount = (gallery) => {
      if (!gallery) return 0
      
      // 优先使用 artworks 数组
      if (gallery.artworks && Array.isArray(gallery.artworks)) {
        return gallery.artworks.length
      }
      
      // 其次使用 items 数组
      if (gallery.items && Array.isArray(gallery.items)) {
        return gallery.items.length
      }
      
      return 0
    }

    // 🟢【修复】获取画廊预览项目
    const getActualGalleryItems = (gallery) => {
      if (!gallery) return []

      console.log('获取画廊预览项目:', gallery.id, gallery.name)

      let artworks = []

      // 优先使用 artworks 数组
      if (gallery.artworks && Array.isArray(gallery.artworks)) {
        artworks = gallery.artworks
      }
      // 其次使用 items 数组
      else if (gallery.items && Array.isArray(gallery.items)) {
        artworks = gallery.items
      } else {
        console.log('画廊没有找到作品数据')
        return []
      }

      // 只返回前4个用于预览
      const previewItems = artworks.slice(0, 4).map((item, index) => {
        const artworkId = item.artwork_id || item.id

        // 获取标题
        let title = item.title
        if (!title && item.artwork) {
          title = item.artwork.title
        }
        if (!title) {
          title = '未命名作品'
        }

        // 获取图片URL
        let imageUrl = item.image_url || item.imageUrl
        if (!imageUrl && item.artwork) {
          imageUrl = item.artwork.image_url || item.artwork.imageUrl
        }
        if (!imageUrl) {
          imageUrl = getArtworkImageUrl({ id: artworkId })
        }

        // 获取样式
        let style = item.style
        if (!style && item.artwork) {
          style = item.artwork.style
        }

        return {
          id: artworkId || `item-${index}`,
          title: title,
          imageUrl: imageUrl,
          style: style || 'classical'
        }
      })

      return previewItems
    }

    // 🟢【修复】获取作品图片URL
    const getArtworkImageUrl = (artwork) => {
      if (!artwork) return '/images/default-artwork.jpg'

      // 根据ID生成图片路径
      if (artwork.id && artwork.id >= 1 && artwork.id <= 37) {
        return `/images/artworks/${artwork.id}.jpg`
      }

      // 返回默认图片
      return '/images/default-artwork.jpg'
    }

    // 获取作品颜色
    const getArtworkColor = (style) => {
      if (!style) return '#6c5ce7'

      const colors = {
        classical: '#a29bfe',
        modern: '#ff6b6b',
        abstract: '#55efc4',
        impressionism: '#fd79a8',
        surrealism: '#ffeaa7',
        expressionism: '#d63031'
      }
      return colors[style] || '#6c5ce7'
    }

    // 获取隐私图标
    const getPrivacyIcon = (privacy) => {
      const icons = {
        public: '🌍',
        friends: '👥',
        private: '🔒'
      }
      return icons[privacy] || '⭐'
    }

    // 获取隐私文本
    const getPrivacyText = (privacy) => {
      const texts = {
        public: '公开',
        friends: '好友可见',
        private: '私密'
      }
      return texts[privacy] || privacy
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未知时间'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // 🟢【修复】编辑画廊
    const editGallery = async (gallery) => {
      try {
        console.log('编辑画廊:', gallery)

        // 使用画廊的本地数据
        currentGallery.value = {
          id: gallery.id,
          name: gallery.name,
          description: gallery.description || '',
          items: formatGalleryItems(gallery),
          privacy: gallery.privacy || 'public',
          theme: gallery.theme || 'starry',
          layout: gallery.layout || 'free',
          createdAt: gallery.created_at || new Date().toISOString()
        }

        editingGallery.value = gallery
        showEditor.value = true
        searchQuery.value = ''
        filterArtworks()

        // 初始化编辑器星星
        initEditorStars()

        // 等待DOM更新后应用主题
        setTimeout(() => {
          applyThemeToWorkspace()
        }, 100)

      } catch (error) {
        console.error('编辑画廊失败:', error)
        showMessage('加载画廊详情失败', 'warning')
      }
    }

    // 格式化画廊项目
    const formatGalleryItems = (galleryData) => {
      if (!galleryData) return []

      let items = []

      // 处理artworks数组
      if (galleryData.artworks && Array.isArray(galleryData.artworks)) {
        items = galleryData.artworks.map(art => ({
          id: art.artwork_id || art.id,
          artwork_id: art.artwork_id || art.id,
          x: art.position_x || art.x || 0,
          y: art.position_y || art.y || 0,
          width: art.width || 150,
          height: art.height || 180,
          scale: art.scale || 1,
          rotate: art.rotate || 0,
          title: art.title || art.artwork?.title || '未命名作品',
          imageUrl: getArtworkImageUrl(art),
          style: art.style || art.artwork?.style || 'classical'
        }))
      }
      // 处理items数组
      else if (galleryData.items && Array.isArray(galleryData.items)) {
        items = galleryData.items.map(item => ({
          ...item,
          id: item.artwork_id || item.id,
          artwork_id: item.artwork_id || item.id,
          title: item.title || '未命名作品',
          imageUrl: getArtworkImageUrl(item),
          style: item.style || 'classical'
        }))
      }

      return items
    }

    // 创建新画廊
    const createNewGallery = () => {
      currentGallery.value = {
        id: null,
        name: '',
        description: '',
        items: [],
        privacy: 'public',
        theme: 'starry',
        layout: 'free',
        createdAt: new Date().toISOString()
      }
      showEditor.value = true
      editingGallery.value = null
      searchQuery.value = ''
      filterArtworks()

      // 初始化编辑器星星
      initEditorStars()

      // 等待DOM更新后应用主题
      setTimeout(() => {
        applyThemeToWorkspace()
      }, 100)
    }

    // 过滤画作
    const filterArtworks = () => {
      if (!searchQuery.value.trim()) {
        filteredArtworks.value = [...availableArtworks.value]
        return
      }

      const query = searchQuery.value.toLowerCase()
      filteredArtworks.value = availableArtworks.value.filter(artwork =>
        artwork.title.toLowerCase().includes(query) ||
        artwork.artist?.toLowerCase().includes(query) ||
        artwork.style?.toLowerCase().includes(query)
      )
    }

    // 🟢【修复】选择主题
    const selectTheme = (themeId) => {
      console.log('选择主题:', themeId)
      currentGallery.value.theme = themeId

      // 立即应用主题到工作区
      setTimeout(() => {
        applyThemeToWorkspace()
      }, 100)
    }

    // 应用主题到工作区
    const applyThemeToWorkspace = () => {
      const workspace = document.querySelector('.editor-workspace')
      if (!workspace) {
        console.warn('工作区元素未找到')
        return
      }

      console.log('应用主题到工作区:', currentGallery.value.theme)

      // 移除所有主题类
      const themeClasses = ['theme-retro', 'theme-minimal', 'theme-starry', 'theme-dark']
      themeClasses.forEach(cls => {
        workspace.classList.remove(cls)
      })

      // 添加当前主题类
      workspace.classList.add(`theme-${currentGallery.value.theme}`)
    }

    // 选择布局
    const selectLayout = (layoutId) => {
      console.log('选择布局:', layoutId)
      currentGallery.value.layout = layoutId
      // 应用选择的布局
      applyCurrentArrangement()
    }

    // 应用当前排列方式
    const applyCurrentArrangement = () => {
      if (currentGallery.value.items.length === 0) return

      const workspace = document.querySelector('.editor-workspace')
      if (!workspace) return

      const rect = workspace.getBoundingClientRect()
      const workspaceWidth = rect.width
      const workspaceHeight = rect.height

      switch (currentGallery.value.layout) {
        case 'grid':
          arrangeGrid(workspaceWidth, workspaceHeight)
          break
        case 'spiral':
          arrangeSpiral(workspaceWidth, workspaceHeight)
          break
        case 'random':
          arrangeRandom(workspaceWidth, workspaceHeight)
          break
        // free 布局不自动排列
      }
    }

    // 网格排列
    const arrangeGrid = (workspaceWidth, workspaceHeight) => {
      const items = currentGallery.value.items
      const itemWidth = 150
      const itemHeight = 180
      const spacing = 40

      // 计算行列
      const cols = Math.floor((workspaceWidth - spacing) / (itemWidth + spacing))
      const rows = Math.ceil(items.length / cols)

      const startX = (workspaceWidth - (cols * itemWidth + (cols - 1) * spacing)) / 2
      const startY = (workspaceHeight - (rows * itemHeight + (rows - 1) * spacing)) / 2

      items.forEach((item, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols

        item.x = startX + col * (itemWidth + spacing)
        item.y = startY + row * (itemHeight + spacing)
        item.width = itemWidth
        item.height = itemHeight
        item.rotate = 0
      })
    }

    // 螺旋排列
    const arrangeSpiral = (workspaceWidth, workspaceHeight) => {
      const items = currentGallery.value.items
      const centerX = workspaceWidth / 2
      const centerY = workspaceHeight / 2
      const angleStep = (2 * Math.PI) / items.length
      const baseRadius = Math.min(workspaceWidth, workspaceHeight) * 0.3

      items.forEach((item, index) => {
        const angle = index * angleStep
        const radius = baseRadius * (0.8 + 0.4 * (index / items.length))
        const spiralAngle = angle + (index * 0.2)

        item.x = centerX + Math.cos(spiralAngle) * radius - item.width / 2
        item.y = centerY + Math.sin(spiralAngle) * radius - item.height / 2
        item.rotate = (spiralAngle * 180 / Math.PI) % 360
      })
    }

    // 随机排列
    const arrangeRandom = (workspaceWidth, workspaceHeight) => {
      const items = currentGallery.value.items
      const padding = 100
      const maxX = workspaceWidth - 150 - padding * 2
      const maxY = workspaceHeight - 180 - padding * 2

      items.forEach((item, index) => {
        item.x = padding + Math.random() * maxX
        item.y = padding + Math.random() * maxY
        item.rotate = Math.random() * 20 - 10 // -10到10度随机旋转
        item.scale = 0.8 + Math.random() * 0.4 // 0.8到1.2随机缩放
      })
    }

    // 开始拖拽画作
    const startDrag = (artwork) => {
      console.log('开始拖拽作品:', artwork)

      draggedItem.value = {
        ...artwork,
        tempId: Date.now(),
        x: 0,
        y: 0,
        width: 150,
        height: 180,
        scale: 1,
        rotate: 0
      }
    }

    // 放置画作
    const dropArtwork = (event) => {
      if (!draggedItem.value) {
        console.log('没有拖拽数据')
        return
      }

      console.log('放置作品:', draggedItem.value)

      const workspace = document.querySelector('.editor-workspace')
      if (!workspace) {
        console.error('找不到工作区')
        return
      }

      const rect = workspace.getBoundingClientRect()
      const x = event.clientX - rect.left - (draggedItem.value.width / 2)
      const y = event.clientY - rect.top - (draggedItem.value.height / 2)

      // 确保使用数据库中的作品ID
      const artworkId = draggedItem.value.id

      if (!artworkId) {
        console.error('无效的作品ID:', artworkId)
        showMessage('作品数据不完整，无法添加', 'warning')
        return
      }

      // 创建新的画廊项目
      const newItem = {
        id: artworkId,
        artwork_id: artworkId,
        title: draggedItem.value.title,
        artist: draggedItem.value.artist,
        style: draggedItem.value.style,
        imageUrl: draggedItem.value.imageUrl,
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: draggedItem.value.width || 150,
        height: draggedItem.value.height || 180,
        scale: draggedItem.value.scale || 1,
        rotate: draggedItem.value.rotate || 0
      }

      console.log('添加到画廊的项目:', newItem)

      currentGallery.value.items.push(newItem)

      // 显示成功消息
      showMessage(`添加了作品: "${newItem.title}"`, 'success')

      draggedItem.value = null
    }

    // 开始拖拽画作项目
    const startDragItem = (item, event) => {
      draggedGalleryItem.value = item
      const rect = event.target.closest('.workspace-item').getBoundingClientRect()
      dragOffset.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }

      const onMouseMove = (e) => {
        if (!draggedGalleryItem.value) return

        const rect = document.querySelector('.editor-workspace').getBoundingClientRect()
        const x = e.clientX - rect.left - dragOffset.value.x
        const y = e.clientY - rect.top - dragOffset.value.y

        draggedGalleryItem.value.x = Math.max(0, x)
        draggedGalleryItem.value.y = Math.max(0, y)
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        draggedGalleryItem.value = null
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    // 开始调整大小
    const startResize = (item, event) => {
      event.stopPropagation()
      resizingItem.value = item
      resizeStart.value = {
        x: event.clientX,
        y: event.clientY,
        width: item.width,
        height: item.height
      }

      const onMouseMove = (e) => {
        const deltaX = e.clientX - resizeStart.value.x
        const deltaY = e.clientY - resizeStart.value.y

        // 保持宽高比
        const scale = 1 + Math.max(deltaX, deltaY) / 100
        const newWidth = Math.max(80, Math.min(300, resizeStart.value.width * scale))
        const newHeight = Math.max(100, Math.min(375, resizeStart.value.height * scale))

        item.width = newWidth
        item.height = newHeight
        item.scale = scale
      }

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        resizingItem.value = null
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    // 移除画作
    const removeItem = (itemId) => {
      currentGallery.value.items = currentGallery.value.items.filter(item => item.id !== itemId)
      showMessage('作品已移除', 'info')
    }

    // 关闭编辑器
    const closeEditor = () => {
      if (currentGallery.value.name.trim() && currentGallery.value.items.length > 0) {
        if (!confirm('您有未保存的更改，确定要关闭吗？')) {
          return
        }
      }
      showEditor.value = false
      editingGallery.value = null
    }

    // 保存画廊
    const saveGallery = async () => {
      if (!currentGallery.value.name.trim()) {
        showMessage('请输入画廊名称', 'warning')
        return
      }

      try {
        console.log('=== 开始保存画廊 ===')
        console.log('编辑模式:', !!editingGallery.value)
        console.log('画廊名称:', currentGallery.value.name)
        console.log('作品数量:', currentGallery.value.items.length)

        // 准备作品数据
        const artworks = currentGallery.value.items.map(item => ({
          artwork_id: item.artwork_id || item.id,
          position_x: Math.round(item.x || 0),
          position_y: Math.round(item.y || 0),
          width: Math.round(item.width || 150),
          height: Math.round(item.height || 180),
          scale: item.scale || 1.0,
          rotation: item.rotate || 0
        }))

        if (artworks.length === 0) {
          showMessage('画廊中至少需要一个作品', 'warning')
          return
        }

        const galleryData = {
          name: currentGallery.value.name.trim(),
          description: currentGallery.value.description || '',
          privacy: currentGallery.value.privacy || 'public',
          theme: currentGallery.value.theme || 'starry',
          layout: currentGallery.value.layout || 'grid',
          artworks: artworks
        }

        console.log('发送画廊数据:', galleryData)

        let result

        if (editingGallery.value) {
          console.log('更新画廊:', editingGallery.value.id)
          result = await store.dispatch('updateGallery', {
            galleryId: editingGallery.value.id,
            galleryData: galleryData
          })
          showMessage('✨ 画廊已更新！')
        } else {
          console.log('创建新画廊')
          result = await store.dispatch('createGallery', galleryData)
          showMessage('✨ 画廊创建成功！')
        }

        console.log('保存结果:', result)

        // 刷新画廊列表
        await loadPersonalGalleries()

        showEditor.value = false
        editingGallery.value = null

      } catch (error) {
        console.error('保存画廊失败:', error)
        showMessage('保存画廊失败: ' + (error.message || '未知错误'), 'warning')
      }
    }

    // 确认删除画廊
    const confirmDeleteGallery = (gallery) => {
      galleryToDelete.value = gallery
      showDeleteConfirm.value = true
    }

    // 🟢【修复】删除画廊
    const deleteGallery = async () => {
      if (!galleryToDelete.value) return

      try {
        console.log('开始删除画廊:', galleryToDelete.value.id, galleryToDelete.value.name)

        // 调用 store 的删除方法
        await store.dispatch('deleteGallery', galleryToDelete.value.id)

        showMessage('🗑️ 画廊 "' + galleryToDelete.value.name + '" 已删除', 'success')

        // 关闭确认对话框
        showDeleteConfirm.value = false
        galleryToDelete.value = null

        // 刷新画廊列表
        await loadPersonalGalleries()

      } catch (error) {
        console.error('删除画廊失败:', error)
        showMessage('删除失败: ' + error.message, 'warning')
      }
    }

    // 分享画廊
    const shareGallery = (gallery) => {
      if (gallery.privacy === 'private') {
        showMessage('私密画廊无法分享', 'warning')
        return
      }

      const shareUrl = `${window.location.origin}/gallery/${gallery.id}`
      navigator.clipboard.writeText(shareUrl)
      showMessage('🌟 分享链接已复制到剪贴板！')
    }

    // 显示消息
    const showMessage = (message, type = 'success') => {
      const messageEl = document.createElement('div')
      const bgColor = type === 'success'
        ? 'linear-gradient(135deg, rgba(106, 90, 205, 0.9), rgba(147, 112, 219, 0.9))'
        : type === 'warning'
        ? 'linear-gradient(135deg, rgba(241, 196, 15, 0.9), rgba(243, 156, 18, 0.9))'
        : 'linear-gradient(135deg, rgba(255, 107, 107, 0.9), rgba(255, 159, 243, 0.9))'

      messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 15px;
        box-shadow:
          0 15px 40px rgba(0, 0, 0, 0.4),
          0 0 50px rgba(255, 255, 255, 0.1);
        z-index: 10000;
        animation: cosmicSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-weight: 600;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        max-width: 300px;
      `
      messageEl.textContent = message

      document.body.appendChild(messageEl)

      setTimeout(() => {
        messageEl.style.animation = 'cosmicSlideOut 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards'
        setTimeout(() => {
          document.body.removeChild(messageEl)
        }, 500)
      }, 3000)
    }

    // 返回所有需要在模板中使用的内容
    return {
      // 响应式数据
      showEditor,
      editingGallery,
      hoverGalleryCard,
      currentGallery,
      availableArtworks: filteredArtworks,
      searchQuery,
      showDeleteConfirm,
      galleryToDelete,
      
      // 静态数据
      backgroundThemes: backgroundThemes.value,
      arrangementModes: arrangementModes.value,
      
      // 计算属性
      isLoggedIn,
      personalGalleries,
      canSave,
      
      // 方法
      starStyle,
      goToCommunity,
      getRandomArtworkImage,
      getGalleryItemCount,
      getActualGalleryItems,
      getArtworkImageUrl,
      getArtworkColor,
      getPrivacyIcon,
      getPrivacyText,
      formatDate,
      selectTheme,
      selectLayout,
      applyCurrentArrangement,
      editGallery,
      createNewGallery,
      startDrag,
      dropArtwork,
      startDragItem,
      startResize,
      removeItem,
      closeEditor,
      saveGallery,
      confirmDeleteGallery,
      deleteGallery,
      shareGallery,
      filterArtworks
    }
  }
}
</script>