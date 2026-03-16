<template>
  <div class="home">
    <!-- 星空背景 -->
    <div class="starry-background">
      <div
        v-for="star in stars"
        :key="star.id"
        class="star"
        :style="star.style"
      ></div>
    </div>

    <!-- 数字艺术门户 -->
    <div
      class="digital-portal"
      :class="{ 'portal-hidden': galleryActive }"
    >
      <!-- 半透明覆盖层 -->
      <div class="portal-overlay"></div>

      <div class="portal-content-wrapper">
        <!-- 门户界面 -->
        <div class="portal-interface">
          <div class="interface-header">
            <h1 class="gallery-title">星空虚拟画廊</h1>
            <p class="portal-subtitle">穿越星际，探索艺术的无垠宇宙</p>
          </div>

          <div class="access-controls">
            <button
              @click="activateGallery"
              class="portal-btn"
            >
              <span class="btn-glow"></span>
              <span class="btn-text">进入星空画廊</span>
              <span class="btn-pulse"></span>
            </button>

            <div class="portal-hint">
              <span class="hint-icon">✨</span>
              <span class="hint-text">体验沉浸式艺术之旅</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 画廊展示区 -->
      <div class="gallery-showcase" :class="{ 'active': galleryActive }" ref="galleryShowcase">
        <!-- 悬浮介绍面板 -->
        <div
          class="floating-info-panel"
          :class="{ 'visible': selectedArtwork }"
          @click="closeInfoPanel"
        >
          <div class="info-content" @click.stop>
            <h2 class="artwork-title">{{ selectedArtwork?.title }}</h2>
            <p class="artwork-artist">{{ selectedArtwork?.artist }}</p>

            <div class="art-period-badge">
              {{ selectedArtwork?.period }}
            </div>

            <div class="artwork-details">
              <div class="detail-item">
                <span class="detail-label">创作年代</span>
                <span class="detail-value">{{ selectedArtwork?.year }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">尺寸</span>
                <span class="detail-value">{{ selectedArtwork?.dimensions }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">材质</span>
                <span class="detail-value">{{ selectedArtwork?.medium }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">馆藏</span>
                <span class="detail-value">{{ selectedArtwork?.collection }}</span>
              </div>
            </div>

            <p class="artwork-description">{{ selectedArtwork?.description }}</p>

            <div class="artwork-tags">
              <div class="tag-item" v-for="tag in selectedArtwork?.tags" :key="tag">
                <span class="tag-label">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 横向滚动画廊 -->
        <div class="horizontal-gallery" ref="galleryContainer" @click="closeInfoPanel">
          <div class="gallery-track" :style="trackStyle">
            <div
              v-for="(artwork, index) in museumArtworks"
              :key="artwork.id"
              class="gallery-artwork"
              :class="{ 'active': artwork.id === activeArtworkId }"
              @click="selectArtwork(artwork, $event)"
              :style="getArtworkStyle(index)"
            >
              <!-- 木制画框 -->
              <div class="wooden-frame">
                <div class="frame-corner corner-tl"></div>
                <div class="frame-corner corner-tr"></div>
                <div class="frame-corner corner-bl"></div>
                <div class="frame-corner corner-br"></div>
                <div class="frame-border"></div>

                <!-- 画作内容 -->
                <div class="artwork-content">
                  <div class="artwork-image" :style="{ backgroundImage: `url(${artwork.image})` }">
                    <div class="artwork-overlay">
                      <div class="artwork-name">{{ artwork.title }}</div>
                      <div class="artist-name">{{ artwork.artist }}</div>
                      <div class="art-period-label overlay-label">
                        {{ artwork.period }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 荧光效果 -->
              <div class="fluorescent-glow" :class="{ 'enhanced': artwork.id === activeArtworkId }"></div>
            </div>
          </div>
        </div>

        <!-- 画廊控制按钮 -->
        <div class="gallery-controls">
          <button class="control-btn prev-btn" @click="scrollToPrevArtwork">
            <span class="control-icon">←</span>
          </button>
          <button class="control-btn next-btn" @click="scrollToNextArtwork">
            <span class="control-icon">→</span>
          </button>
        </div>

        <!-- 进度条 -->
        <div class="gallery-progress">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: progressWidth + '%' }"
            ></div>
          </div>
          <div class="progress-dots">
            <div
              v-for="artwork in museumArtworks"
              :key="artwork.id"
              class="progress-dot"
              :class="{ 'active': artwork.id === activeArtworkId }"
              @click="scrollToArtwork(artwork.id)"
            >
              <span class="dot-tooltip">{{ artwork.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他内容区域 -->
      <section class="styles-section content-room">
        <div class="section-header">
          <h2 class="section-title">探索多元艺术世界</h2>
          <p class="section-subtitle">从古典到现代，从东方到西方，感受不同艺术流派的独特魅力</p>
        </div>
      </section>

      <section class="featured-section content-room">
        <div class="section-header">
          <h2 class="section-title">精选艺术珍品</h2>
          <p class="section-subtitle">跨越千年的艺术对话，感受大师笔下的永恒之美</p>
        </div>
      </section>

      <section class="features-section content-room">
        <div class="section-header">
          <h2 class="section-title">沉浸式艺术体验</h2>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import './HomeView.css'

export default {
  name: 'HomeView',
  setup() {
    const store = useStore()
    
    // 从 Vuex getters 获取博物馆艺术作品
    const museumArtworks = computed(() => store.getters.museumArtworks)
    
    return {
      store,
      museumArtworks
    }
  },
  data() {
    return {
      galleryActive: false,
      scrollY: 0,
      stars: [],
      overlayStyle: { opacity: 0 },
      activeArtworkId: 2, // 设置为向日葵的ID
      selectedArtwork: null,
      scrollPosition: 0,
      scrollAnimation: null,
      autoScrollInterval: null
    }
  },
  computed: {
    trackStyle() {
      const artworkWidth = 380;
      const gap = 50;
      const totalWidth = (artworkWidth + gap) * this.museumArtworks.length;
      const translateX = -this.scrollPosition;

      return {
        width: `${totalWidth}px`,
        transform: `translateX(${translateX}px)`,
        transition: 'transform 0.5s ease-out'
      }
    },
    progressWidth() {
      const totalArtworks = this.museumArtworks.length;
      const activeIndex = this.museumArtworks.findIndex(art => art.id === this.activeArtworkId);
      return ((activeIndex + 1) / totalArtworks) * 100;
    }
  },
  mounted() {
    this.initStars()
    this.initScrollEffect()
    this.activeArtworkId = 2

    document.addEventListener('keydown', this.handleKeyDown)
  },
  methods: {
    getArtworkStyle(index) {
      const isActive = this.museumArtworks[index].id === this.activeArtworkId;
      const totalArtworks = this.museumArtworks.length;
      const distanceFromCenter = Math.abs(index - (totalArtworks - 1) / 2);

      let transform = 'scale(1)';
      let zIndex = 10;
      let margin = '0';

      if (isActive) {
        transform = 'scale(1.08)'; // 减小放大比例，避免出界
        zIndex = 50;
      } else if (distanceFromCenter <= 2) {
        const scale = 1 - (distanceFromCenter * 0.015);
        transform = `scale(${scale})`;
        zIndex = 20 - (distanceFromCenter * 2);
      }

      return {
        transform: transform,
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        zIndex: zIndex,
        margin: margin
      };
    },
    initStars() {
      for (let i = 0; i < 80; i++) { // 减少星星数量以减少卡顿
        this.stars.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2}px`,
            height: `${Math.random() * 2}px`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${Math.random() * 7 + 3}s`,
            boxShadow: `0 0 8px rgba(255, 255, 255, 0.7)`
          }
        })
      }
    },
    initScrollEffect() {
      window.addEventListener('scroll', this.handleScroll)
    },
    handleScroll() {
      this.scrollY = window.scrollY
      const opacity = Math.min(this.scrollY / 300, 0.8)
      this.overlayStyle.opacity = opacity
    },
    activateGallery() {
      this.galleryActive = true
      setTimeout(() => {
        const galleryElement = this.$refs.galleryShowcase;
        if (galleryElement) {
          const offsetTop = galleryElement.offsetTop;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }, 300)
    },
    selectArtwork(artwork, event) {
      event.stopPropagation();
      this.activeArtworkId = artwork.id
      this.selectedArtwork = artwork
      this.scrollToArtwork(artwork.id)
    },
    scrollToPrevArtwork() {
      const currentIndex = this.museumArtworks.findIndex(art => art.id === this.activeArtworkId);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.museumArtworks.length - 1;
      this.selectArtwork(this.museumArtworks[prevIndex], { stopPropagation: () => {} });
    },
    scrollToNextArtwork() {
      const currentIndex = this.museumArtworks.findIndex(art => art.id === this.activeArtworkId);
      const nextIndex = currentIndex < this.museumArtworks.length - 1 ? currentIndex + 1 : 0;
      this.selectArtwork(this.museumArtworks[nextIndex], { stopPropagation: () => {} });
    },
    scrollToArtwork(artworkId) {
      const index = this.museumArtworks.findIndex(art => art.id === artworkId)
      const artworkWidth = 380
      const gap = 50
      const containerWidth = this.$refs.galleryContainer ? this.$refs.galleryContainer.offsetWidth : 1200
      const targetPosition = index * (artworkWidth + gap) - (containerWidth - artworkWidth) / 2

      if (this.scrollAnimation) {
        cancelAnimationFrame(this.scrollAnimation)
      }

      const startPosition = this.scrollPosition
      const distance = targetPosition - startPosition
      const duration = 500
      let startTime = null

      const animateScroll = (currentTime) => {
        if (!startTime) startTime = currentTime
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeProgress = 1 - Math.pow(1 - progress, 2)
        this.scrollPosition = startPosition + (distance * easeProgress)

        if (progress < 1) {
          this.scrollAnimation = requestAnimationFrame(animateScroll)
        } else {
          this.scrollAnimation = null
        }
      }

      this.scrollAnimation = requestAnimationFrame(animateScroll)
    },
    closeInfoPanel(event) {
      if (event) {
        event.stopPropagation()
      }
      this.selectedArtwork = null
    },
    handleKeyDown(event) {
      if (event.key === 'Escape' && this.selectedArtwork) {
        this.closeInfoPanel()
      } else if (event.key === 'ArrowLeft') {
        this.scrollToPrevArtwork()
      } else if (event.key === 'ArrowRight') {
        this.scrollToNextArtwork()
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
    document.removeEventListener('keydown', this.handleKeyDown)

    if (this.scrollAnimation) {
      cancelAnimationFrame(this.scrollAnimation)
    }
  }
}
</script>