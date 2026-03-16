<!-- file name: GalleryDetail.vue -->
<template>
  <!-- 模板部分保持不变，只修改CSS和添加一些调试元素 -->
  <!-- 以下是完整的修复版本 -->

<div class="gallery-detail-page">
    <!-- 星空背景 -->
    <div class="starry-background"></div>
    <div class="meteor-shower"></div>
    <div class="frosted-overlay"></div>

    <!-- 主要内容容器 -->
    <div class="detail-container">
      <!-- 返回按钮 -->
      <button @click="goBack" class="back-btn detail-back-btn">
        <span class="btn-content">
          <span class="icon">←</span>
          返回社区
        </span>
      </button>

      <!-- 画廊详情内容 -->
      <div v-if="!permissionError && !isLoading" class="gallery-detail-content cosmic-card" :class="'theme-' + (gallery.theme || 'starry')">
        <!-- 画廊头部 -->
        <div class="gallery-detail-header">
          <div class="header-left">
            <h1 class="fluorescent-title">
              <span class="gallery-palette-icon">🎨</span>
              {{ gallery.name }}
            </h1>
            <div class="gallery-privacy-badge" :class="gallery.privacy">
              <span class="badge-icon">{{ getPrivacyIcon(gallery.privacy) }}</span>
              <span class="badge-text">{{ getPrivacyText(gallery.privacy) }}</span>
            </div>
          </div>

          <div class="header-right">
            <button @click="shareGalleryLink()" class="action-btn share-btn">
              <span class="action-icon">🔗</span>
              分享链接
            </button>
          </div>
        </div>

        <!-- 画廊作者信息 -->
        <div class="gallery-author-info cosmic-card">
          <div class="author-header">
            <img
              :src="getUserAvatar(gallery.author_avatar)"
              :alt="gallery.username"
              class="detail-author-avatar"
            >
            <div class="detail-author-details">
              <div class="detail-author-name">{{ gallery.username }}</div>
              <div class="detail-author-bio">
                {{ gallery.author_bio || '这位艺术家还没有个人简介' }}
              </div>
            </div>
            <div class="author-actions">
              <span v-if="isFriend(gallery.user_id)" class="friend-badge-large">好友</span>
            </div>
          </div>

          <div class="detail-gallery-stats">
            <div class="stat-item">
              <span class="stat-value">{{ gallery.artworks?.length || 0 }}</span>
              <span class="stat-label">作品</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ gallery.likes_count || 0 }}</span>
              <span class="stat-label">点赞</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ gallery.comments_count || 0 }}</span>
              <span class="stat-label">评论</span>
            </div>
          </div>
        </div>

        <!-- 画廊描述和基本信息 -->
        <div class="gallery-info-section">
          <div class="gallery-description-box cosmic-card">
            <h4 class="section-title">📝 画廊描述</h4>
            <p class="gallery-description-detail">
              {{ gallery.description || '这个画廊还没有描述' }}
            </p>
          </div>

          <div class="gallery-meta-box cosmic-card">
            <h4 class="section-title">ℹ️ 画廊信息</h4>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">创建时间</span>
                <span class="meta-value">{{ formatTime(gallery.created_at) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">更新时间</span>
                <span class="meta-value">{{ formatTime(gallery.updated_at) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">画廊主题</span>
                <span class="meta-value theme-badge" :style="{ background: getGalleryTheme(gallery.theme) }">
                  <span class="theme-icon">{{ getThemeIcon(gallery.theme) }}</span>
                  {{ getThemeName(gallery.theme) }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">画廊布局</span>
                <span class="meta-value layout-badge">
                  {{ gallery.layout === 'grid' ? '网格布局' : '列表布局' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 画廊作品展示 -->
        <div class="gallery-artworks-display cosmic-card">
          <div class="artworks-header">
            <h4 class="section-title">🎨 画廊作品 ({{ gallery.artworks?.length || 0 }})</h4>
            <div class="artworks-actions">
              <button
                @click="toggleDetailViewMode"
                class="view-mode-btn cosmic-btn"
              >
                {{ detailViewMode === 'grid' ? '切换为列表' : '切换为网格' }}
              </button>
            </div>
          </div>

          <div v-if="!gallery.artworks || gallery.artworks.length === 0" class="no-artworks cosmic-card">
            <div class="empty-icon">🖼️</div>
            <p>这个画廊还没有添加作品</p>
            <p class="hint-text">画廊作者正在创作中...</p>
          </div>

          <div v-else class="artworks-container" :class="[detailViewMode, `theme-${gallery.theme || 'starry'}`]">
            <!-- 主题背景层 -->
            <div class="theme-background-layer" :style="{ background: getGalleryTheme(gallery.theme) }"></div>

            <!-- 工作区背景效果 -->
            <div class="workspace-stars"></div>
            <div class="workspace-grid"></div>
            <div class="workspace-nebula"></div>

            <!-- 展厅墙壁效果 -->
            <div class="gallery-wall">
              <div class="wall-pattern"></div>
              <div class="wall-lighting"></div>
            </div>

            <!-- 调试信息（仅在开发环境显示） -->
            <div class="debug-info" v-if="isDevelopment">
              <div>图片数量: {{ gallery.artworks.length }}</div>
              <div>当前视图模式: {{ detailViewMode }}</div>
              <div>第一个作品图片URL: {{ getArtworkImageUrl(gallery.artworks[0]) }}</div>
            </div>

            <div
              v-for="item in gallery.artworks"
              :key="item.id"
              :class="['artwork-display-item', detailViewMode]"
              :style="getArtworkStyle(item)"
              @click="viewArtworkDetail(item)"
            >
              <!-- 调试框 -->
              <div class="debug-frame" v-if="isDevelopment"></div>
              
              <div class="wooden-frame">
                <div
                  class="artwork-content"
                  :style="getArtworkContentStyle(item)"
                  :data-artwork-id="item.id"
                  :data-image-url="getArtworkImageUrl(item)"
                >
                  <!-- 图片加载状态指示器 -->
                  <div class="image-loading-indicator" v-if="!imageLoaded[item.id]">
                    <div class="loading-spinner"></div>
                    <span>加载中...</span>
                  </div>
                  
                  <div class="artwork-overlay"></div>
                  <div class="artwork-title-small">{{ getArtworkTitle(item) }}</div>
                  <div class="artwork-glow" :style="{ background: getArtworkColor(item.artwork?.style) }"></div>
                </div>
                <div class="frame-corner corner-tl"></div>
                <div class="frame-corner corner-tr"></div>
                <div class="frame-corner corner-bl"></div>
                <div class="frame-corner corner-br"></div>
              </div>

              <div class="artwork-hover-info">
                <div class="artwork-hover-title">{{ getArtworkTitle(item) }}</div>
                <div class="artwork-hover-artist">{{ item.artwork?.artist || '未知艺术家' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 画廊操作 -->
        <div class="gallery-detail-actions cosmic-card" v-if="canInteractWithGallery">
          <button
            @click="toggleLikeGallery"
            class="action-btn like-btn"
            :class="{ liked: gallery.is_liked }"
          >
            <span class="action-icon">❤️</span>
            {{ gallery.is_liked ? '已点赞' : '点赞' }} ({{ gallery.likes_count || 0 }})
          </button>
          <button @click="toggleComments" class="action-btn comment-btn">
            <span class="action-icon">💬</span>
            评论 ({{ gallery.comments_count || 0 }})
          </button>
        </div>

        <!-- 评论区域 -->
        <div v-if="showComments && canInteractWithGallery" class="gallery-comments cosmic-card">
          <div class="comments-header">
            <h4 class="section-title">💬 评论</h4>
            <div class="comments-count">{{ gallery.comments_count || 0 }} 条评论</div>
          </div>

          <div class="add-comment">
            <textarea
              v-model="newComment"
              placeholder="写下你的评论..."
              class="comment-input cosmic-input"
              rows="3"
            ></textarea>
            <button @click="submitComment" class="submit-comment-btn cosmic-btn">
              发表评论
            </button>
          </div>

          <div v-if="galleryComments.length === 0" class="empty-comments">
            <div class="empty-icon">💬</div>
            <p>还没有评论，快来抢沙发吧！</p>
          </div>

          <div v-else class="comments-list">
            <div
              v-for="comment in galleryComments"
              :key="comment.id"
              class="comment-item cosmic-card"
            >
              <div class="comment-header">
                <img
                  :src="getUserAvatar(comment.avatar)"
                  :alt="comment.username"
                  class="comment-avatar"
                >
                <div class="comment-user-info">
                  <div class="comment-author">{{ comment.username }}</div>
                  <div class="comment-time">{{ formatTime(comment.created_at) }}</div>
                </div>
              </div>

              <div class="comment-content">
                {{ comment.content }}
              </div>

              <div class="comment-actions">
                <button
                  @click="toggleLikeComment(comment)"
                  class="comment-like-btn"
                  :class="{ liked: comment.is_liked }"
                >
                  <span class="icon">❤️</span>
                  {{ comment.likes_count || 0 }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="showComments && !canInteractWithGallery" class="gallery-comments cosmic-card">
          <div class="no-permission">
            <div class="permission-icon">🔒</div>
            <h4>评论功能不可用</h4>
            <p>您没有权限在此画廊评论</p>
          </div>
        </div>
      </div>

      <!-- 加载中状态 -->
      <div v-if="isLoading" class="loading-container cosmic-card">
        <div class="loading-content">
          <div class="spinner-large"></div>
          <p>正在加载画廊详情...</p>
        </div>
      </div>

      <!-- 权限错误提示 -->
      <div v-if="permissionError && !isLoading" class="permission-error-container cosmic-card">
        <div class="permission-error-content">
          <div class="permission-icon">{{ permissionError.icon }}</div>
          <h2 class="permission-title">{{ permissionError.title }}</h2>
          <p class="permission-message">{{ permissionError.message }}</p>

          <div class="permission-actions">
            <button @click="goBack" class="back-to-community-btn cosmic-btn">
              🔙 返回社区
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 复制成功对话框 -->
    <div v-if="showSuccessDialog" class="copy-success-dialog-overlay" @click.self="showSuccessDialog = false">
      <div class="copy-success-dialog cosmic-card">
        <div class="success-icon">✅</div>

        <h3 class="dialog-title">复制成功！</h3>

        <p class="dialog-message">
          画廊链接已复制到剪贴板！<br>
          现在你可以返回好友社区<br>
          将链接分享给你的好友哦！
        </p>

        <div class="dialog-actions">
          <button @click="stayHere" class="cancel-btn cosmic-btn">
            稍后再说
          </button>
          <button @click="goToCommunity" class="confirm-btn cosmic-btn">
            🔗 返回社区分享
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { galleryAPI, friendAPI } from '../utils/api'
import './GalleryDetail.css'

export default {
  name: 'GalleryDetail',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    
    // 从 store 获取用户信息
    const user = computed(() => store.state.user)
    
    // 响应式数据
    const gallery = ref({})
    const detailViewMode = ref('grid')
    const showComments = ref(false)
    const newComment = ref('')
    const galleryComments = ref([])
    const showSuccessDialog = ref(false)
    const origin = ref('')
    const isLoading = ref(true)
    const friends = ref([])
    const permissionError = ref(null)
    const friendIds = ref([])
    const imageLoaded = ref({}) // 图片加载状态
    const isDevelopment = ref(process.env.NODE_ENV === 'development') // 开发环境标志

    // 🟢【关键修复】直接从 gallery._canView 获取权限
    const canViewGallery = computed(() => {
      if (!gallery.value) return false
      // 优先使用后端返回的权限字段
      if (gallery.value._canView !== undefined) {
        return gallery.value._canView
      }

      // 如果后端没有返回权限字段，则使用前端计算
      const userId = user.value?.id

      // 自己的画廊都可以看
      if (gallery.value.user_id === userId) return true

      // 公开画廊都可以看
      if (gallery.value.privacy === 'public') return true

      // 好友可见的画廊，检查是否是好友
      if (gallery.value.privacy === 'friends') {
        return isFriend(gallery.value.user_id)
      }

      // 私密画廊不能看
      return false
    })

    const canInteractWithGallery = computed(() => {
      if (!canViewGallery.value) return false
      return true
    })

    // 🟢【修复】检查是否是好友 - 使用 friendIds 数组
    const isFriend = (userId) => {
      if (!friendIds.value || friendIds.value.length === 0) {
        return false
      }
      return friendIds.value.includes(userId)
    }

    // 🟢【修复】加载好友列表
    const loadFriends = async () => {
      try {
        const response = await friendAPI.getFriends()
        if (response.success) {
          friends.value = response.friends || []
          friendIds.value = friends.value.map(friend => friend.id)
          console.log(`✅ 加载好友完成: ${friends.value.length} 位好友`)
        }
      } catch (error) {
        console.error('加载好友列表失败:', error)
        friends.value = []
        friendIds.value = []
      }
    }

    // 🟢【修复】加载画廊详情
    const loadGalleryDetail = async () => {
      isLoading.value = true
      permissionError.value = null
      imageLoaded.value = {} // 重置图片加载状态

      try {
        console.log(`加载画廊详情: ${props.id}`)
        const response = await galleryAPI.getGalleryDetail(props.id)

        if (response.success && response.gallery) {
          gallery.value = response.gallery
          
          // 调试：查看作品数据结构
          console.log('画廊作品数据:', gallery.value.artworks)
          if (gallery.value.artworks && gallery.value.artworks.length > 0) {
            const firstArtwork = gallery.value.artworks[0]
            console.log('第一个作品:', firstArtwork)
            const imageUrl = getArtworkImageUrl(firstArtwork)
            console.log('图片路径:', imageUrl)
            
            // 预加载所有图片
            preloadImages()
          }

          // 使用后端返回的权限字段 _canView
          const canView = gallery.value._canView !== undefined
            ? gallery.value._canView
            : canViewGallery.value

          if (!canView) {
            // 根据隐私设置显示不同的提示
            if (gallery.value.privacy === 'friends') {
              permissionError.value = {
                icon: '😊',
                title: '好友专属画廊',
                message: `这是作者「${gallery.value.username}」的好友可见画廊。您需要成为作者的好友才能查看。`
              }
            } else if (gallery.value.privacy === 'private') {
              permissionError.value = {
                icon: '😴',
                title: '私密画廊',
                message: '抱歉，这是作者的私密画廊，您没有权限查看。'
              }
            } else {
              permissionError.value = {
                icon: '🔒',
                title: '没有权限',
                message: '您没有权限查看此画廊。'
              }
            }
            return
          }

          // 加载评论
          await loadGalleryComments()
        } else {
          permissionError.value = {
            icon: '🖼️',
            title: '画廊不存在',
            message: '您访问的画廊可能已被删除或链接无效。'
          }
        }
      } catch (error) {
        console.error('加载画廊详情失败:', error)

        if (error.response?.status === 404) {
          permissionError.value = {
            icon: '🖼️',
            title: '画廊不存在',
            message: '您访问的画廊可能已被删除或链接无效。'
          }
        } else if (error.response?.status === 403) {
          permissionError.value = {
            icon: '🔒',
            title: '没有权限',
            message: '您没有权限查看此画廊。'
          }
        } else {
          permissionError.value = {
            icon: '❌',
            title: '加载失败',
            message: '加载画廊时发生错误，请稍后再试。'
          }
        }
      } finally {
        isLoading.value = false
      }
    }

    // 🟢【修复】图片URL处理方法
    const getArtworkImageUrl = (item) => {
      if (!item) {
        return '/images/default-artwork.jpg'
      }

      // 尝试多种可能的图片路径
      const possiblePaths = [
        item.artwork?.image_url,
        item.image_url,
        item.artwork?.image,
        item.image,
        item.artwork?.url,
        item.url,
        item.artwork?.file_path,
        item.file_path
      ]

      let foundPath = null
      for (const path of possiblePaths) {
        if (path) {
          foundPath = path
          break
        }
      }

      if (!foundPath) {
        return '/images/default-artwork.jpg'
      }

      // 🟢【关键修复】处理不同情况下的图片路径
      // 情况1: 已经是完整的URL
      if (foundPath.startsWith('http://') || foundPath.startsWith('https://')) {
        return foundPath
      }
      
      // 情况2: 相对路径（以/开头）
      if (foundPath.startsWith('/')) {
        // 🟢【关键】对于分享链接访问，需要使用完整的URL
        const fullUrl = `${window.location.origin}${foundPath}`
        return fullUrl
      }
      
      // 情况3: 相对路径（不以/开头）
      const fullUrl = `${window.location.origin}/uploads/${foundPath}`
      return fullUrl
    }

    // 🟢【新增】获取作品内容样式 - 修复CSS问题
    const getArtworkContentStyle = (item) => {
      const imageUrl = getArtworkImageUrl(item)
      console.log(`为作品 ${item.id} 设置背景图片: ${imageUrl}`)
      
      return {
        backgroundImage: `url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'absolute',
        top: '0',
        left: '0'
      }
    }

    // 🟢【新增】预加载图片并跟踪加载状态
    const preloadImages = () => {
      if (!gallery.value.artworks || gallery.value.artworks.length === 0) return
      
      gallery.value.artworks.forEach(item => {
        const img = new Image()
        const url = getArtworkImageUrl(item)
        
        img.onload = () => {
          console.log(`✅ 图片预加载成功: ${item.id} - ${url}`)
          imageLoaded.value[item.id] = true
          
          // 触发DOM更新
          setTimeout(() => {
            const elements = document.querySelectorAll(`[data-artwork-id="${item.id}"]`)
            elements.forEach(el => {
              el.classList.add('image-loaded')
            })
          }, 100)
        }
        
        img.onerror = () => {
          console.log(`❌ 图片预加载失败: ${item.id} - ${url}`)
          imageLoaded.value[item.id] = false
          
          // 尝试使用默认图片
          setTimeout(() => {
            const elements = document.querySelectorAll(`[data-artwork-id="${item.id}"]`)
            elements.forEach(el => {
              el.style.backgroundImage = "url('/images/default-artwork.jpg')"
            })
          }, 100)
        }
        
        img.src = url
      })
    }

    // 🟢【新增】获取作品标题
    const getArtworkTitle = (item) => {
      return item.artwork?.title || item.title || '未命名作品'
    }

    // 🟢【修复】获取作品样式 - 确保有正确的尺寸
    const getArtworkStyle = (item) => {
      if (detailViewMode.value === 'grid') {
        const style = {
          left: `${item.position_x || 0}px`,
          top: `${item.position_y || 0}px`,
          width: `${item.width || 200}px`,
          height: `${item.height || 150}px`,
          transform: `scale(${item.scale || 1})`,
          position: 'absolute',
          display: 'block',
          zIndex: 1
        }
        
        // 调试样式
        if (isDevelopment.value) {
          style.border = '1px dashed rgba(255, 255, 255, 0.3)'
          style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
        }
        
        return style
      }
      
      // 列表视图的样式
      return {
        width: '100%',
        marginBottom: '20px',
        position: 'relative'
      }
    }

    const loadGalleryComments = async () => {
      try {
        if (!gallery.value) return

        const response = await galleryAPI.getGalleryComments(gallery.value.id)
        if (response.success) {
          galleryComments.value = response.comments || []
        } else {
          console.warn('加载评论失败:', response.error)
          galleryComments.value = []
        }
      } catch (error) {
        console.error('加载评论失败:', error)
        galleryComments.value = []
      }
    }

    const submitComment = async () => {
      if (!newComment.value.trim() || !gallery.value || !canInteractWithGallery.value) return

      try {
        const response = await galleryAPI.addGalleryComment(gallery.value.id, {
          content: newComment.value.trim()
        })

        if (response.success) {
          await loadGalleryComments()
          gallery.value.comments_count = (gallery.value.comments_count || 0) + 1
          newComment.value = ''
          showMessage('评论发表成功', 'success')
        } else {
          throw new Error(response.error || '发表评论失败')
        }
      } catch (error) {
        console.error('发表评论失败:', error)
        showMessage('发表评论失败', 'error')
      }
    }

    const toggleLikeGallery = async () => {
      if (!canInteractWithGallery.value) {
        showMessage('您没有权限点赞此画廊', 'warning')
        return
      }

      try {
        await galleryAPI.toggleGalleryLike(gallery.value.id)
        gallery.value.is_liked = !gallery.value.is_liked
        gallery.value.likes_count = gallery.value.is_liked ?
          (gallery.value.likes_count || 0) + 1 :
          Math.max(0, (gallery.value.likes_count || 0) - 1)
        showMessage(gallery.value.is_liked ? '已点赞' : '已取消点赞', 'success')
      } catch (error) {
        console.error('点赞操作失败:', error)
        showMessage('点赞操作失败', 'error')
      }
    }

    const toggleComments = () => {
      showComments.value = !showComments.value
      if (showComments.value && gallery.value && canInteractWithGallery.value) {
        loadGalleryComments()
      }
    }

    const toggleLikeComment = async (comment) => {
      try {
        comment.is_liked = !comment.is_liked
        comment.likes_count = comment.is_liked ?
          (comment.likes_count || 0) + 1 :
          Math.max(0, (comment.likes_count || 0) - 1)
      } catch (error) {
        console.error('点赞评论失败:', error)
      }
    }

    // 🟢【简化】分享画廊链接
    const shareGalleryLink = () => {
      if (!gallery.value) return

      const shareUrl = `${window.location.origin}/gallery/${gallery.value.id}`

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            showSuccessDialog.value = true
          })
          .catch(err => {
            console.error('复制链接失败:', err)
            showMessage('复制失败，请手动复制链接', 'error')
          })
      } else {
        // 兼容旧浏览器
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()

        try {
          const successful = document.execCommand('copy')
          document.body.removeChild(textArea)

          if (successful) {
            showSuccessDialog.value = true
          } else {
            showMessage('复制失败，请手动复制链接', 'error')
          }
        } catch (err) {
          document.body.removeChild(textArea)
          console.error('复制链接失败:', err)
          showMessage('复制失败，请手动复制链接', 'error')
        }
      }
    }

    const goBack = () => {
      router.push('/gallery-community')
    }

    const goToCommunity = () => {
      showSuccessDialog.value = false
      router.push('/gallery-community')
    }

    const stayHere = () => {
      showSuccessDialog.value = false
      showMessage('你可以稍后在社区中分享链接给好友', 'info')
    }

    const toggleDetailViewMode = () => {
      detailViewMode.value = detailViewMode.value === 'grid' ? 'list' : 'grid'
    }

    const viewArtworkDetail = (artwork) => {
      console.log('查看作品详情:', artwork)
      showMessage('查看作品详情功能开发中...', 'info')
    }

    const initBackground = () => {
      createStars('.starry-background', 100)
      createMeteors('.meteor-shower', 8)
    }

    const createStars = (selector, count) => {
      const container = document.querySelector(selector)
      if (!container) return

      container.innerHTML = ''
      for (let i = 0; i < count; i++) {
        const star = document.createElement('div')
        star.className = 'star'
        star.style.cssText = `
          position: absolute;
          width: ${Math.random() * 2 + 1}px;
          height: ${Math.random() * 2 + 1}px;
          background: #ffffff;
          border-radius: 50%;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          opacity: ${Math.random() * 0.6 + 0.2};
          animation: twinkle ${Math.random() * 4 + 2}s ease-in-out infinite ${Math.random() * 3}s;
          box-shadow:
            0 0 15px rgba(255, 255, 255, 0.9),
            0 0 30px rgba(255, 255, 255, 0.6),
            0 0 45px rgba(255, 215, 0, 0.3);
        `
        container.appendChild(star)
      }
    }

    const createMeteors = (selector, count) => {
      const container = document.querySelector(selector)
      if (!container) return

      container.innerHTML = ''
      for (let i = 0; i < count; i++) {
        const meteor = document.createElement('div')
        meteor.className = 'meteor'
        meteor.style.cssText = `
          position: absolute;
          width: 2px;
          height: 2px;
          background: linear-gradient(90deg,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.8) 50%,
            transparent 100%);
          border-radius: 50%;
          filter: blur(1px);
          top: ${Math.random() * 30}%;
          left: ${Math.random() * 100}%;
          animation: meteorFall 3s linear infinite;
          animation-delay: ${Math.random() * 20}s;
        `
        container.appendChild(meteor)
      }
    }

    // 工具方法
    const getPrivacyText = (privacy) => {
      const privacyMap = {
        'public': '公开',
        'friends': '好友可见',
        'private': '私密'
      }
      return privacyMap[privacy] || '未知'
    }

    const getPrivacyIcon = (privacy) => {
      const icons = {
        public: '🌍',
        friends: '😊',
        private: '😴'
      }
      return icons[privacy] || '❓'
    }

    const getGalleryTheme = (theme) => {
      const themes = {
        starry: 'linear-gradient(135deg, #0c2461 0%, #17255f 40%, #2a2b5f 70%, #3c3d6a 100%)',
        night: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        retro: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%)',
        classic: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 50%, #2c3e50 100%)',
        modern: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
        abstract: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #6c5ce7 100%)',
        simple: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }
      return themes[theme] || themes.starry
    }

    const getThemeIcon = (theme) => {
      const icons = {
        starry: '🌌',
        night: '🌃',
        retro: '🕰️',
        classic: '🎨',
        modern: '🔄',
        abstract: '🌀',
        simple: '⚪'
      }
      return icons[theme] || '🌃'
    }

    const getThemeName = (theme) => {
      const names = {
        starry: '星空',
        night: '暗夜',
        retro: '复古',
        classic: '经典',
        modern: '现代',
        abstract: '抽象',
        simple: '简约'
      }
      return names[theme] || '暗夜'
    }

    const getArtworkColor = (style) => {
      const colors = {
        classical: '#a29bfe',
        modern: '#ff6b6b',
        abstract: '#55efc4',
        impressionism: '#fd79a8',
        surrealism: '#ffeaa7'
      }
      return colors[style] || '#6c5ce7'
    }

    const getUserAvatar = (avatarPath) => {
      if (!avatarPath) {
        return `https://ui-avatars.com/api/?name=User&size=200&background=3B82F6&color=ffffff&bold=true`
      }
      if (avatarPath.startsWith('http')) return avatarPath
      // 对于相对路径的头像
      if (avatarPath.startsWith('/')) {
        return `${window.location.origin}${avatarPath}`
      }
      return avatarPath
    }

    const formatTime = (dateString) => {
      if (!dateString) return '未知时间'
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
      return date.toLocaleDateString('zh-CN')
    }

    const showMessage = (message, type = 'success') => {
      const messageEl = document.createElement('div')
      const bgColor = type === 'success'
        ? 'linear-gradient(135deg, rgba(39, 174, 96, 0.9), rgba(46, 204, 113, 0.9))'
        : type === 'error'
        ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.9), rgba(192, 57, 43, 0.9))'
        : 'linear-gradient(135deg, rgba(241, 196, 15, 0.9), rgba(243, 156, 18, 0.9))'

      messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: cosmicSlideIn 0.3s ease, cosmicSlideOut 0.3s ease 2.7s forwards;
        font-weight: 600;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        max-width: 300px;
      `
      messageEl.textContent = message

      document.body.appendChild(messageEl)

      setTimeout(() => {
        messageEl.style.animation = 'cosmicSlideOut 0.5s ease forwards'
        setTimeout(() => {
          document.body.removeChild(messageEl)
        }, 500)
      }, 3000)
    }

    onMounted(async () => {
      if (typeof window !== 'undefined') {
        origin.value = window.location.origin
      }

      // 先加载好友列表，再加载画廊详情
      await loadFriends()
      await loadGalleryDetail()
      initBackground()
    })

    // 返回所有需要在模板中使用的内容
    return {
      // 响应式数据
      gallery,
      detailViewMode,
      showComments,
      newComment,
      galleryComments,
      showSuccessDialog,
      isLoading,
      permissionError,
      imageLoaded,
      isDevelopment,
      
      // 计算属性
      canViewGallery,
      canInteractWithGallery,
      
      // 方法
      getArtworkStyle,
      getArtworkContentStyle,
      getArtworkTitle,
      shareGalleryLink,
      goBack,
      goToCommunity,
      stayHere,
      toggleDetailViewMode,
      viewArtworkDetail,
      getPrivacyText,
      getPrivacyIcon,
      getGalleryTheme,
      getThemeIcon,
      getThemeName,
      getArtworkImageUrl,
      getArtworkColor,
      getUserAvatar,
      formatTime,
      isFriend,
      toggleLikeGallery,
      toggleComments,
      toggleLikeComment,
      submitComment,
      showMessage
    }
  }
}
</script>