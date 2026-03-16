<template>
  <div class="gallery-view" :class="currentStyle">
    <!-- 控制栏部分 -->
    <div class="gallery-controls">
      <div class="control-section">
        <div class="control-group">
          <h3 class="control-title">🎮 导航控制</h3>
          <div class="control-buttons">
            <button @click="move('left')" class="control-btn" title="向左移动"><span class="btn-icon">←</span></button>
            <button @click="move('right')" class="control-btn" title="向右移动"><span class="btn-icon">→</span></button>
            <button @click="move('up')" class="control-btn" title="向上移动"><span class="btn-icon">↑</span></button>
            <button @click="move('down')" class="control-btn" title="向下移动"><span class="btn-icon">↓</span></button>
          </div>
        </div>
        <div class="control-group">
          <h3 class="control-title">🔍 视角控制</h3>
          <div class="control-buttons">
            <button @click="zoomIn" class="control-btn" title="放大"><span class="btn-icon">+</span></button>
            <button @click="zoomOut" class="control-btn" title="缩小"><span class="btn-icon">-</span></button>
            <button @click="resetView" class="control-btn" title="重置视图"><span class="btn-icon">⟲</span></button>
          </div>
        </div>
      </div>
      <div class="style-section">
        <div class="style-selector">
          <h3 class="selector-title">🌌 选择畅游不同展厅</h3>
          <select v-model="currentStyle" @change="changeStyle" class="style-dropdown">
            <option value="">全部艺术作品展厅</option>
            <option value="classical">古典艺术展厅</option>
            <option value="modern">现代艺术展厅</option>
            <option value="abstract">抽象艺术展厅</option>
          </select>
          <div class="style-hint">探索不同艺术时期的独特魅力</div>
        </div>
      </div>
    </div>

    <!-- 画廊画布 -->
    <div class="gallery-container" ref="galleryContainer">
      <canvas
        ref="canvas"
        @mousedown="startDrag"
        @mousemove="drag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @wheel="handleWheel"
      ></canvas>

      <!-- 画作元素 -->
      <div
        v-for="artwork in masonryArtworks"
        :key="artwork.id"
        class="artwork-item"
        :style="getArtworkStyle(artwork)"
        @mouseenter="showArtworkInfo(artwork)"
        @mouseleave="hideArtworkInfo"
        @click="viewArtwork(artwork)"
      >
        <div class="wooden-frame">
          <div class="frame-corner corner-tl"></div>
          <div class="frame-corner corner-tr"></div>
          <div class="frame-corner corner-bl"></div>
          <div class="frame-corner corner-br"></div>
          <div class="frame-border"></div>
          <div class="artwork-content" :style="{
            backgroundImage: `url(/images/artworks/${artwork.id}.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }">
            <div class="artwork-info-overlay" :class="{ 'show': hoveredArtworkId === artwork.id }">
              <div class="artwork-info">
                <div class="artwork-title">{{ artwork.title }}</div>
                <div class="artwork-artist">{{ artwork.artist }}</div>
                <div class="artwork-year">{{ artwork.year }}年</div>
                <div class="artwork-style">{{ getStyleName(artwork.style) }}</div>
                <div class="artwork-description">{{ artwork.description }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="fluorescent-glow" :class="{ 'show': hoveredArtworkId === artwork.id }"></div>
      </div>

      <!-- 展厅标识 -->
      <div class="gallery-label" :style="galleryLabelStyle">
        <div class="label-content">
          <h3>{{ galleryTitle }}</h3>
          <p>{{ galleryDescription }}</p>
        </div>
      </div>
    </div>

    <!-- 时间轴 -->
    <div class="timeline-section">
       <div class="timeline-container">
        <h3 class="timeline-title">🕰️ 艺术时间轴</h3>
        <div class="timeline">
          <div class="timeline-track">
            <div class="track-line"></div>
            <div
              v-for="era in timelineEras"
              :key="era.year"
              class="timeline-era"
              :style="{ left: era.position + '%' }"
              @click="scrollToEra(era.year)"
            >
              <div class="era-marker">
                <div class="marker-glow"></div>
                <div class="marker-core"></div>
              </div>
              <div class="era-label">{{ era.year }}</div>
              <div class="era-artworks">
                <div
                  v-for="art in era.artworks.slice(0, 3)"
                  :key="art.id"
                  class="era-artwork"
                  :style="{ background: getArtworkColor(art.style) }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import './GalleryView1.css'

const MASONRY_CONFIG = {
  COLS: 5,
  BASE_WIDTH: 200,
  GAP: 120
}

const BG_OBJECT_TYPE = {
  STAR: 'STAR',
  NEBULA: 'NEBULA',
  COMET: 'COMET',
  SATURN_PLANET: 'SATURN_PLANET',
  ASTRONAUT: 'ASTRONAUT',
  CELESTIAL_HORSE: 'CELESTIAL_HORSE'
}

export default {
  name: 'GalleryView1',
  props: {
    style: {
      type: String,
      default: ''
    }
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    // 使用计算属性访问 store 状态
    const artworks = computed(() => store.state.artworks)
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const user = computed(() => store.state.user)
    
    return {
      store,
      router,
      artworks,
      isLoggedIn,
      user
    }
  },
  data() {
    return {
      offset: { x: 50, y: 150 },
      isDragging: false,
      lastMousePos: { x: 0, y: 0 },
      scale: 1,
      currentStyle: '',
      canvasSize: { width: 0, height: 0 },
      hoveredArtworkId: null,
      backgroundObjects: [],
      animationFrameId: null
    }
  },
  computed: {
    galleryBackgroundColors() {
      const colors = {
        '': ['#1c255a', '#0b102e'], // Obvious Blue
        'classical': ['#343438', '#1a1a1e'], // Black Silk
        'modern': ['#5e1c3b', '#2c0b1a'], // Pink/Magenta
        'abstract': ['#4a1c5e', '#210b2c'] // Purple
      }
      return colors[this.currentStyle] || colors['']
    },
    
    displayedArtworks() {
      if (this.currentStyle) {
        return this.artworks.filter(art => art.style === this.currentStyle)
      }
      return this.artworks
    },
    
    masonryArtworks() {
      const columnHeights = new Array(MASONRY_CONFIG.COLS).fill(0)
      const columnWidth = MASONRY_CONFIG.BASE_WIDTH + MASONRY_CONFIG.GAP
      
      return this.displayedArtworks.map(artwork => {
        // 确保每个作品都有宽高属性
        if (!artwork.width || !artwork.height) {
          const isVertical = Math.random() > 0.5
          artwork.width = isVertical ? 800 + Math.random() * 200 : 1200 + Math.random() * 400
          artwork.height = isVertical ? 1200 + Math.random() * 400 : 800 + Math.random() * 200
        }
        
        const minHeight = Math.min(...columnHeights)
        const columnIndex = columnHeights.indexOf(minHeight)
        const aspectRatio = artwork.height / artwork.width
        const scaledHeight = MASONRY_CONFIG.BASE_WIDTH * aspectRatio
        
        const position = {
          x: columnIndex * columnWidth,
          y: minHeight,
          width: MASONRY_CONFIG.BASE_WIDTH,
          height: scaledHeight
        }
        
        columnHeights[columnIndex] += scaledHeight + MASONRY_CONFIG.GAP
        return { ...artwork, masonryPosition: position }
      })
    },
    
    timelineEras() {
      const years = [...new Set(this.artworks.map(art => art.year))].sort((a, b) => a - b)
      if (years.length === 0) return []
      
      const minYear = Math.min(...years)
      const maxYear = Math.max(...years)
      const range = maxYear - minYear
      
      const importantYears = [344, 970, 1085, 1113, 1350, 1503, 1511, 1642, 1889, 1893, 1923, 1930, 1931, 1937, 1950, 1952]
      
      const majorYears = [...new Set(years.filter((year, index) => {
        if (importantYears.includes(year)) return true
        if (year % 100 === 0 && years.length > 20 && index % Math.floor(years.length / 15) === 0) return true
        if (index === 0 || index === years.length - 1) return true
        return false
      }))].sort((a, b) => a - b)
      
      return majorYears.map(year => {
        const artworksInYear = this.artworks.filter(art => art.year === year)
        const position = range > 0 ? ((year - minYear) / range) * 90 + 5 : 50
        return { year, position, artworks: artworksInYear }
      })
    },
    
    galleryTitle() {
      const styles = {
        '': '全部艺术作品展厅',
        'classical': '古典艺术展厅',
        'modern': '现代艺术展厅',
        'abstract': '抽象艺术展厅'
      }
      return styles[this.currentStyle] || '星空艺术画廊'
    },
    
    galleryDescription() {
      const descriptions = {
        '': '穿越时空的艺术长廊，探索人类文明的视觉史诗',
        'classical': '古典美的典范，理性与和谐的永恒追求',
        'modern': '打破传统的桎梏，现代艺术的多元探索',
        'abstract': '形式的解放，内在情感的直接表达'
      }
      return descriptions[this.currentStyle] || ''
    },
    
    galleryLabelStyle() {
      return {
        transform: `translate(${this.offset.x + 50}px, ${this.offset.y + 50}px)`
      }
    }
  },
  mounted() {
    this.currentStyle = this.style || ''
    this.initCanvas()
    this.initBackgroundObjects()
    this.animate()
    this.setupKeyboardControls()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('keydown', this.handleKeyDown)
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  },
  methods: {
    initCanvas() {
      const container = this.$refs.galleryContainer
      const canvas = this.$refs.canvas
      
      this.canvasSize = {
        width: container.clientWidth,
        height: container.clientHeight
      }
      
      canvas.width = this.canvasSize.width
      canvas.height = this.canvasSize.height
    },
    
    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate)
      this.drawBackground()
    },
    
    drawBackground() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制背景渐变
      const [color1, color2] = this.galleryBackgroundColors
      const gradient = ctx.createRadialGradient(
        this.canvasSize.width / 2,
        this.canvasSize.height / 2,
        0,
        this.canvasSize.width / 2,
        this.canvasSize.height / 2,
        Math.max(this.canvasSize.width, this.canvasSize.height)
      )
      gradient.addColorStop(0, color2)
      gradient.addColorStop(1, color1)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height)
      
      // 绘制网格
      this.drawGrid(ctx)
      
      // 绘制背景对象
      this.backgroundObjects.forEach(obj => {
        this.updateObject(obj)
        this.drawObject(ctx, obj)
      })
    },
    
    drawGrid(ctx) {
      ctx.strokeStyle = 'rgba(255, 223, 100, 0.1)'
      ctx.lineWidth = 1
      
      const gridSize = 100 * this.scale
      const offsetX = this.offset.x % gridSize
      const offsetY = this.offset.y % gridSize
      
      // 绘制垂直线
      for (let x = offsetX; x < this.canvasSize.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, this.canvasSize.height)
        ctx.stroke()
      }
      
      // 绘制水平线
      for (let y = offsetY; y < this.canvasSize.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(this.canvasSize.width, y)
        ctx.stroke()
      }
    },
    
    initBackgroundObjects() {
      this.backgroundObjects = []
      const baseStarCount = 150
      
      let config = { [BG_OBJECT_TYPE.STAR]: baseStarCount }
      
      switch (this.currentStyle) {
        case 'classical':
          Object.assign(config, {
            [BG_OBJECT_TYPE.NEBULA]: 8,
            [BG_OBJECT_TYPE.CELESTIAL_HORSE]: 1
          })
          break
        case 'modern':
          Object.assign(config, {
            [BG_OBJECT_TYPE.COMET]: 10
          })
          break
        case 'abstract':
          Object.assign(config, {
            [BG_OBJECT_TYPE.SATURN_PLANET]: 8,
            [BG_OBJECT_TYPE.ASTRONAUT]: 2
          })
          break
        default:
          Object.assign(config, {
            [BG_OBJECT_TYPE.COMET]: 3,
            [BG_OBJECT_TYPE.SATURN_PLANET]: 4,
            [BG_OBJECT_TYPE.ASTRONAUT]: 1,
            [BG_OBJECT_TYPE.CELESTIAL_HORSE]: 1
          })
          break
      }
      
      for (let type in config) {
        for (let i = 0; i < config[type]; i++) {
          this.createObject(type)
        }
      }
    },
    
    createObject(type) {
      const obj = {
        type,
        x: Math.random() * this.canvasSize.width,
        y: -Math.random() * this.canvasSize.height
      }
      
      const opacity = Math.random() * 0.7 + 0.3
      
      switch (type) {
        case BG_OBJECT_TYPE.STAR:
          obj.size = Math.random() * 1.5 + 0.5
          obj.speed = Math.random() * 0.2 + 0.1
          obj.opacity = opacity
          obj.color = `rgba(255, 223, 100, ${opacity})`
          break
          
        case BG_OBJECT_TYPE.SATURN_PLANET:
          obj.size = Math.random() * 15 + 10
          obj.speed = Math.random() * 0.2 + 0.05
          obj.rotation = Math.random() * Math.PI * 2
          obj.rotationSpeed = (Math.random() - 0.5) * 0.002
          obj.tilt = (Math.random() - 0.5) * 0.8
          break
          
        case BG_OBJECT_TYPE.NEBULA:
          obj.size = Math.random() * 300 + 200
          obj.speed = Math.random() * 0.08 + 0.02
          obj.color1 = 'rgba(255, 223, 100, 0.02)'
          obj.color2 = 'rgba(255, 165, 0, 0.08)'
          obj.y = Math.random() * this.canvasSize.height
          break
          
        case BG_OBJECT_TYPE.COMET:
          obj.size = Math.random() * 2 + 1
          obj.opacity = Math.random() * 0.5 + 0.3
          obj.speedX = (Math.random() - 0.7) * 2
          obj.speedY = (Math.random() + 0.2) * 2
          obj.color = ['#ADD8E6', '#FFB6C1', '#98FB98', '#F0E68C'][Math.floor(Math.random() * 4)]
          
          if (this.currentStyle === 'modern') {
            obj.color = ['#87CEEB', '#4682B4', '#5F9EA0', '#6495ED'][Math.floor(Math.random() * 4)]
            obj.speedX *= 1.5
            obj.speedY *= 1.5
          }
          
          obj.y = -50
          obj.x = Math.random() * this.canvasSize.width
          break
          
        case BG_OBJECT_TYPE.ASTRONAUT:
          obj.size = Math.random() * 15 + 15
          obj.speed = Math.random() * 0.3 + 0.1
          obj.rotation = Math.random() * Math.PI * 2
          obj.rotationSpeed = (Math.random() - 0.5) * 0.005
          break
          
        case BG_OBJECT_TYPE.CELESTIAL_HORSE:
          obj.size = Math.random() * 20 + 40
          obj.speed = Math.random() * 0.2 + 0.1
          obj.opacity = Math.random() * 0.4 + 0.4
          obj.color = 'rgba(255, 223, 100, 0.8)'
          obj.x = -obj.size
          obj.y = Math.random() * this.canvasSize.height
          break
      }
      
      this.backgroundObjects.push(obj)
    },
    
    updateObject(obj) {
      if (obj.type === BG_OBJECT_TYPE.COMET) {
        obj.x += obj.speedX
        obj.y += obj.speedY
        
        if (obj.y > this.canvasSize.height + 50 || 
            obj.x < -50 || 
            obj.x > this.canvasSize.width + 50) {
          this.resetObject(obj)
        }
      } else if (obj.type === BG_OBJECT_TYPE.CELESTIAL_HORSE) {
        obj.x += obj.speed
        
        if (obj.x > this.canvasSize.width + obj.size) {
          this.resetObject(obj)
        }
      } else {
        obj.y += obj.speed || 0
        
        if (obj.type === BG_OBJECT_TYPE.ASTRONAUT || 
            obj.type === BG_OBJECT_TYPE.SATURN_PLANET) {
          obj.rotation += obj.rotationSpeed
        }
        
        if (obj.y > this.canvasSize.height + (obj.size || 10) * 2) {
          this.resetObject(obj)
        }
      }
    },
    
    resetObject(obj) {
      obj.y = -(obj.size || 50)
      obj.x = Math.random() * this.canvasSize.width
      
      if (obj.type === BG_OBJECT_TYPE.CELESTIAL_HORSE || 
          obj.type === BG_OBJECT_TYPE.COMET) {
        obj.x = -(obj.size || 50)
        obj.y = Math.random() * this.canvasSize.height * 0.8
      }
    },
    
    drawObject(ctx, obj) {
      ctx.globalAlpha = obj.opacity || 1
      
      switch (obj.type) {
        case BG_OBJECT_TYPE.SATURN_PLANET:
          ctx.save()
          ctx.translate(obj.x, obj.y)
          ctx.rotate(obj.rotation)
          
          // 绘制土星环
          ctx.fillStyle = 'rgba(180, 150, 220, 0.2)'
          ctx.beginPath()
          ctx.ellipse(0, 0, obj.size * 1.8, obj.size * 0.5, obj.tilt, 0, 2 * Math.PI)
          ctx.fill()
          
          // 绘制土星本体
          ctx.fillStyle = 'rgba(128, 90, 200, 0.3)'
          ctx.shadowColor = 'rgba(128, 90, 200, 0.5)'
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(0, 0, obj.size, 0, 2 * Math.PI)
          ctx.fill()
          
          ctx.restore()
          ctx.shadowBlur = 0
          break
          
        case BG_OBJECT_TYPE.STAR:
          ctx.fillStyle = obj.color
          ctx.beginPath()
          ctx.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case BG_OBJECT_TYPE.NEBULA:
          const nebGrad = ctx.createRadialGradient(
            obj.x, obj.y, 0,
            obj.x, obj.y, obj.size
          )
          nebGrad.addColorStop(0, obj.color1)
          nebGrad.addColorStop(1, obj.color2)
          
          ctx.fillStyle = nebGrad
          ctx.fillRect(
            obj.x - obj.size,
            obj.y - obj.size,
            obj.size * 2,
            obj.size * 2
          )
          break
          
        case BG_OBJECT_TYPE.COMET:
          const angle = Math.atan2(obj.speedY, obj.speedX)
          const tailLength = obj.size * 25
          
          // 绘制彗尾
          const tailGrad = ctx.createLinearGradient(
            obj.x, obj.y,
            obj.x - Math.cos(angle) * tailLength,
            obj.y - Math.sin(angle) * tailLength
          )
          tailGrad.addColorStop(0, `${obj.color}66`)
          tailGrad.addColorStop(1, 'transparent')
          
          ctx.beginPath()
          ctx.moveTo(
            obj.x + Math.sin(angle) * obj.size,
            obj.y - Math.cos(angle) * obj.size
          )
          ctx.lineTo(
            obj.x - Math.cos(angle) * tailLength,
            obj.y - Math.sin(angle) * tailLength
          )
          ctx.lineTo(
            obj.x - Math.sin(angle) * obj.size,
            obj.y + Math.cos(angle) * obj.size
          )
          ctx.closePath()
          ctx.fillStyle = tailGrad
          ctx.fill()
          
          // 绘制彗核
          const headGrad = ctx.createRadialGradient(
            obj.x, obj.y, 0,
            obj.x, obj.y, obj.size * 2
          )
          headGrad.addColorStop(0, 'rgba(255, 255, 255, 1)')
          headGrad.addColorStop(0.5, `${obj.color}B3`)
          headGrad.addColorStop(1, 'transparent')
          
          ctx.fillStyle = headGrad
          ctx.beginPath()
          ctx.arc(obj.x, obj.y, obj.size * 2, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case BG_OBJECT_TYPE.ASTRONAUT:
          ctx.save()
          ctx.translate(obj.x, obj.y)
          ctx.rotate(obj.rotation)
          
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
          ctx.lineWidth = obj.size * 0.08
          
          // 绘制宇航服身体
          ctx.beginPath()
          ctx.roundRect(
            -obj.size * 0.4,
            -obj.size * 0.5,
            obj.size * 0.8,
            obj.size,
            obj.size * 0.2
          )
          ctx.stroke()
          
          // 绘制头盔
          ctx.beginPath()
          ctx.arc(0, 0, obj.size * 0.4, 0, Math.PI * 2)
          ctx.fill()
          
          // 绘制面罩
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
          ctx.beginPath()
          ctx.arc(obj.size * 0.1, 0, obj.size * 0.3, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.restore()
          break
          
        case BG_OBJECT_TYPE.CELESTIAL_HORSE:
          ctx.save()
          ctx.translate(obj.x, obj.y)
          ctx.scale(obj.size / 50, obj.size / 50)
          
          ctx.strokeStyle = obj.color
          ctx.lineWidth = 1.5
          ctx.shadowColor = obj.color
          ctx.shadowBlur = 10
          
          // 绘制天马轮廓
          ctx.beginPath()
          ctx.moveTo(-22, -5)
          ctx.lineTo(-15, -15)
          ctx.lineTo(5, -20)
          ctx.lineTo(10, -10)
          ctx.lineTo(2, -5)
          ctx.lineTo(-22, -5)
          ctx.moveTo(-10, -3)
          ctx.lineTo(15, 0)
          ctx.lineTo(25, 20)
          ctx.lineTo(20, 22)
          ctx.moveTo(15, 0)
          ctx.lineTo(10, 25)
          ctx.lineTo(5, 23)
          ctx.stroke()
          
          ctx.restore()
          ctx.shadowBlur = 0
          break
      }
      
      ctx.globalAlpha = 1
    },
    
    getArtworkStyle(artwork) {
      const { x, y, width, height } = artwork.masonryPosition
      const baseX = x * this.scale + this.offset.x
      const baseY = y * this.scale + this.offset.y
      
      let finalScale = this.scale
      if (this.hoveredArtworkId === artwork.id) {
        finalScale *= 1.05
      }
      
      const transform = `translate(${baseX}px, ${baseY}px) scale(${finalScale})`
      
      return {
        transform,
        width: `${width}px`,
        height: `${height}px`
      }
    },
    
    animateToOffset(targetX, targetY) {
      const startX = this.offset.x
      const startY = this.offset.y
      const duration = 1200
      let startTime = null
      
      const step = (currentTime) => {
        if (!startTime) startTime = currentTime
        
        const progress = Math.min((currentTime - startTime) / duration, 1)
        const ease = 0.5 * (1 - Math.cos(Math.PI * progress))
        
        this.offset.x = startX + (targetX - startX) * ease
        this.offset.y = startY + (targetY - startY) * ease
        
        if (progress < 1) {
          requestAnimationFrame(step)
        }
      }
      
      requestAnimationFrame(step)
    },
    
    changeStyle() {
      this.resetView()
      this.initBackgroundObjects()
    },
    
    scrollToEra(year) {
      const artwork = this.masonryArtworks.find(art => art.year === year)
      
      if (artwork) {
        const { x, y, width, height } = artwork.masonryPosition
        const targetX = -x * this.scale + (this.canvasSize.width / 2) - (width * this.scale / 2)
        const targetY = -y * this.scale + (this.canvasSize.height / 2) - (height * this.scale / 2)
        
        this.animateToOffset(targetX, targetY)
      }
    },
    
    handleResize() {
      this.initCanvas()
      this.initBackgroundObjects()
    },
    
    drag(event) {
      if (!this.isDragging) return
      
      const dx = event.clientX - this.lastMousePos.x
      const dy = event.clientY - this.lastMousePos.y
      
      this.offset.x += dx
      this.offset.y += dy
      
      this.lastMousePos = {
        x: event.clientX,
        y: event.clientY
      }
    },
    
    handleWheel(event) {
      event.preventDefault()
      
      const delta = -Math.sign(event.deltaY) * 0.1
      const newScale = Math.max(0.3, Math.min(3, this.scale + delta))
      
      const rect = this.$refs.canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      const scaleFactor = newScale / this.scale
      
      this.offset.x = mouseX - (mouseX - this.offset.x) * scaleFactor
      this.offset.y = mouseY - (mouseY - this.offset.y) * scaleFactor
      
      this.scale = newScale
    },
    
    move(direction) {
      const moveAmount = 100
      
      switch (direction) {
        case 'left':
          this.offset.x += moveAmount
          break
        case 'right':
          this.offset.x -= moveAmount
          break
        case 'up':
          this.offset.y += moveAmount
          break
        case 'down':
          this.offset.y -= moveAmount
          break
      }
    },
    
    zoomIn() {
      this.scale = Math.min(3, this.scale * 1.2)
    },
    
    zoomOut() {
      this.scale = Math.max(0.3, this.scale / 1.2)
    },
    
    resetView() {
      this.animateToOffset(50, 150)
      this.scale = 1
    },
    
    showArtworkInfo(artwork) {
      this.hoveredArtworkId = artwork.id
    },
    
    hideArtworkInfo() {
      this.hoveredArtworkId = null
    },
    
    startDrag(event) {
      this.isDragging = true
      this.lastMousePos = {
        x: event.clientX,
        y: event.clientY
      }
      event.target.style.cursor = 'grabbing'
    },
    
    endDrag() {
      this.isDragging = false
      if (this.$refs.canvas) {
        this.$refs.canvas.style.cursor = 'grab'
      }
    },
    
    getArtworkColor(style) {
      const colors = {
        classical: '#a29bfe',
        modern: '#ff7675',
        abstract: '#55efc4'
      }
      return colors[style] || '#95a5a6'
    },
    
    getStyleName(style) {
      const styleNames = {
        classical: '古典艺术',
        modern: '现代艺术',
        abstract: '抽象艺术'
      }
      return styleNames[style] || '艺术'
    },
    
    viewArtwork(artwork) {
      this.router.push(`/artwork/${artwork.id}`)
    },
    
    setupKeyboardControls() {
      document.addEventListener('keydown', this.handleKeyDown)
    },
    
    handleKeyDown(event) {
      const keyActions = {
        'ArrowLeft': () => this.move('left'),
        'ArrowRight': () => this.move('right'),
        'ArrowUp': () => this.move('up'),
        'ArrowDown': () => this.move('down'),
        '=': () => this.zoomIn(),
        '+': () => this.zoomIn(),
        '-': () => this.zoomOut(),
        '0': () => this.resetView()
      }
      
      if (keyActions[event.key]) {
        event.preventDefault()
        keyActions[event.key]()
      }
    }
  },
  watch: {
    style(newStyle) {
      this.currentStyle = newStyle
      this.resetView()
      this.initBackgroundObjects()
    }
  }
}
</script>