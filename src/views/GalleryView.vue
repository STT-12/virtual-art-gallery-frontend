<template>
  <div class="gallery-view">
    <div class="three-container" ref="threeContainer"></div>

    <div class="gallery-ui">
      <div class="gallery-controls">
        <div class="control-section">
          <div class="control-group">
            <h3 class="control-title">🎮 导航控制</h3>
            <div class="control-buttons">
              <button @click="rotatePlanet('left')" class="control-btn" title="向左旋转"><span class="btn-icon">←</span></button>
              <button @click="rotatePlanet('right')" class="control-btn" title="向右旋转"><span class="btn-icon">→</span></button>
              <button @click="zoomIn" class="control-btn" title="放大"><span class="btn-icon">+</span></button>
              <button @click="zoomOut" class="control-btn" title="缩小"><span class="btn-icon">-</span></button>
              <button @click="resetCamera" class="control-btn" title="重置"><span class="btn-icon">⟲</span></button>
            </div>
          </div>
          <div class="control-group">
            <h3 class="control-title">🌠 视角模式</h3>
            <div class="control-buttons">
              <button @click="toggleAutoRotate" class="control-btn" :class="{ 'active': autoRotate }" title="自动旋转"><span class="btn-icon">{{ autoRotate ? '⏸️' : '▶️' }}</span></button>
              <button @click="toggleNebula" class="control-btn" :class="{ 'active': showNebula }" title="显示/隐藏星云环"><span class="btn-icon">{{ showNebula ? '🌫️' : '✨' }}</span></button>
              <button @click="toggleOrbits" class="control-btn" :class="{ 'active': showOrbits }" title="显示/隐藏轨道"><span class="btn-icon">{{ showOrbits ? '🛤️' : '🌠' }}</span></button>
            </div>
          </div>
        </div>
        <div class="style-section">
          <div class="style-selector">
            <h3 class="selector-title">🌌 选择艺术展厅</h3>
            <select v-model="currentStyle" @change="changeGallery" class="style-dropdown">
              <option value="">全艺术展厅 (程序化行星)</option>
              <option value="classical">古典艺术展厅 (奶黄立方体)</option>
              <option value="modern">现代艺术展厅 (淡粉球体)</option>
              <option value="abstract">抽象艺术展厅 (水蓝三角体)</option>
            </select>
            <div class="style-hint">探索不同风格的艺术空间</div>
          </div>
        </div>
      </div>
      <div class="help-tooltip">
        <div class="tooltip-content">
          <p>💡 提示：拖拽旋转，滚轮缩放，点击时间轴或画作聚焦</p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载艺术宇宙...</p>
    </div>

    <!-- 原始的侧边栏详情面板 -->
    <div v-if="selectedArtwork" class="artwork-detail-panel">
      <div class="detail-content">
        <button @click="closeArtworkDetail" class="close-btn">×</button>
        <h3>{{ selectedArtwork.title }}</h3>
        <p class="artist">{{ selectedArtwork.artist }}</p>
        <p class="year">{{ selectedArtwork.year }}年 · {{ selectedArtwork.style }}</p>
        <p class="description">{{ selectedArtwork.description }}</p>
        <div class="detail-actions">
          <button @click="viewFullArtwork" class="action-btn">查看完整详情</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { markRaw, computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

const MAX_ARTWORKS_DISPLAYED = 30;

export default {
  name: 'GalleryView',
  props: { style: { type: String, default: '' } },
  setup(props) {
    const store = useStore();
    const router = useRouter();
    
    // 响应式数据
    const currentStyle = ref(props.style || '');
    const scene = ref(null);
    const camera = ref(null);
    const renderer = ref(null);
    const controls = ref(null);
    const composer = ref(null);
    const autoRotate = ref(true);
    const showNebula = ref(true);
    const showOrbits = ref(true);

    const centralObject = ref(null);
    const artworkContainer = ref(null);
    const timelineContainer = ref(null);
    const planetaryRing = ref(null);
    const starfield = ref(null);
    const specialLight = ref(null);
    const cameraSpotlight = ref(null);

    const artworkGroupsForRaycast = ref([]);
    const loading = ref(true);
    const animationId = ref(null);
    const mouse = ref(new THREE.Vector2());
    const raycaster = ref(new THREE.Raycaster());
    const hoveredArtwork = ref(null);
    const cameraAnimation = ref({
      active: false,
      startTime: 0,
      duration: 1500,
      startPos: new THREE.Vector3(),
      endPos: new THREE.Vector3(),
      startTarget: new THREE.Vector3(),
      endTarget: new THREE.Vector3(),
    });

    const centralObjectsData = {
      '': { shape: 'sphere', color: '#FFFBE1', size: 18, opacity: 1 },
      'classical': { shape: 'cube', color: '#FFFBE1', size: 30, opacity: 1 },
      'modern': { shape: 'sphere', color: '#FFD1DC', size: 16, opacity: 1 },
      'abstract': { shape: 'tetrahedron', color: '#B4E9D6', size: 16, opacity: 1 }
    };

    const textureLoader = ref(null);
    const maxAnisotropy = ref(1);
    const selectedArtwork = ref(null);
    const timelineMarkers = ref([]);
    const twinkleData = ref([]);
    const baseStarColors = ref(null);

    // 计算属性 - 从 store 获取艺术作品
    const artworks = computed(() => store.state.artworks);
    
    const displayedArtworks = computed(() => {
      let filteredArtworks = artworks.value;
      if (currentStyle.value) {
        filteredArtworks = artworks.value.filter(art => art.style === currentStyle.value);
      }
      if (currentStyle.value !== 'classical' && filteredArtworks.length > MAX_ARTWORKS_DISPLAYED) {
        return filteredArtworks.slice(0, MAX_ARTWORKS_DISPLAYED);
      }
      return filteredArtworks;
    });

    onMounted(() => {
      initThree();
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      cleanupThree();
      window.removeEventListener('resize', handleResize);
    });

    // 监听 props 变化
    watch(() => props.style, (newStyle) => {
      if (currentStyle.value !== newStyle) {
        currentStyle.value = newStyle;
        changeGallery();
      }
    });

    const initThree = async () => {
      try {
        loading.value = true;
        const container = document.querySelector('.three-container');
        if (!container) return;

        scene.value = markRaw(new THREE.Scene());
        camera.value = markRaw(new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 10000));

        renderer.value = markRaw(new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }));
        renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.value.setSize(container.clientWidth, container.clientHeight);
        maxAnisotropy.value = renderer.value.capabilities.getMaxAnisotropy();
        container.appendChild(renderer.value.domElement);

        scene.value.background = new THREE.Color(0x0a0a2a);
        // --- 修改点 1：调整初始相机位置，使其更远 ---
        camera.value.position.set(0, 40, 160);

        composer.value = markRaw(new EffectComposer(renderer.value));
        composer.value.addPass(new RenderPass(scene.value, camera.value));
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(container.clientWidth, container.clientHeight),
          0.15,
          0.4,
          0.85
        );
        composer.value.addPass(bloomPass);

        controls.value = markRaw(new OrbitControls(camera.value, renderer.value.domElement));
        controls.value.enableDamping = true;
        controls.value.dampingFactor = 0.05;
        controls.value.autoRotate = autoRotate.value;
        controls.value.autoRotateSpeed = 0.4;
        controls.value.minDistance = 25;
        controls.value.maxDistance = 300;

        scene.value.add(new THREE.AmbientLight(0x606080, 0.7));
        const mainLight = new THREE.DirectionalLight(0xFFFFFF, 0.9);
        mainLight.position.set(5, 50, 20);
        scene.value.add(mainLight);

        cameraSpotlight.value = new THREE.SpotLight(0xffffff, 1.0, 200, Math.PI / 7, 0.4, 1);
        camera.value.add(cameraSpotlight.value);
        cameraSpotlight.value.position.set(0, 0, 1);
        camera.value.add(cameraSpotlight.value.target);
        cameraSpotlight.value.target.position.set(0, 0, -1);
        scene.value.add(camera.value);

        textureLoader.value = new THREE.TextureLoader();
        createStarfield();
        await rebuildScene();
        setupEventListeners();
        animate();
        loading.value = false;
      } catch (error) {
        console.error('Error initializing Three.js:', error);
        loading.value = false;
      }
    };

    const disposeObject = (obj) => {
      if (!obj) return;
      obj.traverse(child => {
        if (child.isMesh || child.isSprite || child.isPoints) {
          child.geometry?.dispose();
          if (child.material) {
            (Array.isArray(child.material) ? child.material : [child.material]).forEach(material => {
              material.map?.dispose();
              material.dispose();
            });
          }
        }
      });
      if (obj.parent) obj.parent.remove(obj);
    };

    const changeGallery = async () => {
      loading.value = true;
      await rebuildScene();
      resetCamera();
      loading.value = false;
    };

    const rebuildScene = async () => {
      disposeObject(centralObject.value);
      disposeObject(artworkContainer.value);
      disposeObject(timelineContainer.value);
      disposeObject(planetaryRing.value);
      disposeObject(specialLight.value);
      specialLight.value = null;

      artworkGroupsForRaycast.value = [];
      timelineMarkers.value = [];
      const artworks = displayedArtworks.value;
      centralObject.value = markRaw(await createCentralObject(artworks));
      if (centralObject.value) scene.value.add(centralObject.value);
      createPlanetaryRing();
      if (currentStyle.value !== 'classical') {
        artworkContainer.value = markRaw(await createArtworkRing(artworks));
        if (artworkContainer.value) scene.value.add(artworkContainer.value);
      } else {
        specialLight.value = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        scene.value.add(specialLight.value);
      }
      timelineContainer.value = markRaw(createTimelineRing(artworks));
      if (timelineContainer.value) scene.value.add(timelineContainer.value);
    };

    const createRichProceduralTexture = (baseColorHex) => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      const baseColor = new THREE.Color(baseColorHex);

      const darkerBase = baseColor.clone().multiplyScalar(0.8);
      ctx.fillStyle = `#${darkerBase.getHexString()}`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 20; i++) {
        const lightColor = baseColor.clone().lerp(new THREE.Color(0xffffff), 0.4);
        ctx.fillStyle = `rgba(${Math.round(lightColor.r * 255)}, ${Math.round(lightColor.g * 255)}, ${Math.round(lightColor.b * 255)}, ${Math.random() * 0.15 + 0.05})`;
        ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 80 + 40);
      }

      for (let i = 0; i < 3; i++) {
        const stormColor = baseColor.clone().lerp(new THREE.Color(0x000000), 0.3);
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 100 + 50;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${Math.round(stormColor.r * 255)}, ${Math.round(stormColor.g * 255)}, ${Math.round(stormColor.b * 255)}, 0.4)`);
        gradient.addColorStop(1, `rgba(${Math.round(stormColor.r * 255)}, ${Math.round(stormColor.g * 255)}, ${Math.round(stormColor.b * 255)}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.needsUpdate = true;
      return texture;
    };

    const createCentralObject = async (artworks) => {
      const data = centralObjectsData[currentStyle.value] || centralObjectsData[''];
      const group = new THREE.Group();
      let geometry;
      switch (data.shape) {
        case 'cube':
          geometry = new THREE.BoxGeometry(data.size, data.size, data.size);
          break;
        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(data.size, 1);
          break;
        default:
          geometry = new THREE.IcosahedronGeometry(data.size, 5);
          break;
      }
      const materialOptions = {
        map: createRichProceduralTexture(data.color),
        transparent: data.opacity < 1,
        opacity: data.opacity,
        shininess: 30
      };

      const material = new THREE.MeshPhongMaterial(materialOptions);
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      if (data.shape === 'cube' && artworks.length > 0) {
        const faceNormals = [
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(-1, 0, 0),
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, -1, 0),
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0, -1)
        ];

        const artworksPerFace = Math.ceil(artworks.length / 6);
        const gridSize = Math.ceil(Math.sqrt(artworksPerFace));
        const spacing = data.size * 0.8 / (gridSize + 1);

        for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
          const faceArtworks = artworks.slice(faceIndex * artworksPerFace, (faceIndex + 1) * artworksPerFace);

          for (let i = 0; i < faceArtworks.length; i++) {
            const artwork = faceArtworks[i];
            const artworkGroup = new THREE.Group();
            const halfSize = data.size / 2;

            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const u = (col + 1) * spacing - (data.size * 0.8) / 2;
            const v = (row + 1) * spacing - (data.size * 0.8) / 2;

            let position;
            if (faceIndex === 0 || faceIndex === 1) {
              position = new THREE.Vector3(faceNormals[faceIndex].x * (halfSize + 0.1), u, v);
            } else if (faceIndex === 2 || faceIndex === 3) {
              position = new THREE.Vector3(u, faceNormals[faceIndex].y * (halfSize + 0.1), v);
            } else {
              position = new THREE.Vector3(u, v, faceNormals[faceIndex].z * (halfSize + 0.1));
            }

            artworkGroup.position.copy(position);

            switch (faceIndex) {
              case 0:
                artworkGroup.rotation.y = Math.PI / 2;
                break;
              case 1:
                artworkGroup.rotation.y = -Math.PI / 2;
                break;
              case 2:
                artworkGroup.rotation.x = -Math.PI / 2;
                break;
              case 3:
                artworkGroup.rotation.x = Math.PI / 2;
                break;
              case 4:
                break;
              case 5:
                artworkGroup.rotation.y = Math.PI;
                break;
            }

            await addArtworkToGroup(artwork, artworkGroup);
            group.add(artworkGroup);
            artworkGroupsForRaycast.value.push(artworkGroup);
          }
        }
      }
      return group;
    };

    const addArtworkToGroup = async (artwork, artworkGroup) => {
      const frameWidth = 9,
        frameHeight = 7.2,
        frameDepth = 0.3;
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth),
        new THREE.MeshPhongMaterial({ color: 0x3d291f, shininess: 30 })
      );
      artworkGroup.add(frame);
      try {
        const texture = await loadTextureWithFallback(`/images/artworks/${artwork.id}.jpg`, artwork);
        const canvas = new THREE.Mesh(
          new THREE.PlaneGeometry(frameWidth * 0.95, frameHeight * 0.95),
          new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
        );
        canvas.position.z = frameDepth / 2 + 0.01;
        canvas.userData = { type: 'artwork', artwork, group: artworkGroup };
        frame.userData = { type: 'artwork', artwork, group: artworkGroup };
        artworkGroup.add(canvas);
      } catch (e) {
        console.warn(`Failed to load artwork ${artwork.id}`, e);
      }
      const titleSprite = createTitleSprite(artwork);
      titleSprite.position.y = frameHeight / 2 + 1.2;
      titleSprite.position.z = frameDepth / 2 + 0.02;
      titleSprite.visible = false;
      titleSprite.userData.type = 'title';
      artworkGroup.add(titleSprite);
    };

    const createArtworkRing = async (artworks) => {
      if (!artworks || artworks.length === 0 || currentStyle.value === 'classical') return null;
      const ringGroup = new THREE.Group();
      const numArtworks = artworks.length;
      const ringRadius = 80;
      const promises = artworks.map(async (artwork, i) => {
        const artworkGroup = new THREE.Group();
        const angle = (i / numArtworks) * Math.PI * 2;
        const x = ringRadius * Math.cos(angle),
          z = ringRadius * Math.sin(angle);
        artworkGroup.position.set(x, 0, z);
        artworkGroup.lookAt(new THREE.Vector3(x * 2, 0, z * 2));
        await addArtworkToGroup(artwork, artworkGroup);
        ringGroup.add(artworkGroup);
        artworkGroupsForRaycast.value.push(artworkGroup);
      });
      await Promise.all(promises);
      return ringGroup;
    };

    const loadTextureWithFallback = (url, artwork) => {
      return new Promise((resolve) => {
        textureLoader.value.load(
          url,
          (texture) => {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = maxAnisotropy.value;
            texture.generateMipmaps = true;
            texture.premultiplyAlpha = false;
            texture.encoding = THREE.sRGBEncoding;
            resolve(texture);
          },
          undefined,
          () => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext("2d");
            const hue = Math.random() * 360;
            const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
            gradient.addColorStop(0, `hsla(${hue}, 50%, 30%, 0.9)`);
            gradient.addColorStop(1, `hsla(${hue + 40}, 60%, 10%, 0.9)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1024, 1024);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(artwork.title, 512, 460);
            ctx.font = '32px Arial';
            ctx.fillText(artwork.artist, 512, 560);
            const fallbackTexture = new THREE.CanvasTexture(canvas);
            fallbackTexture.minFilter = THREE.LinearMipmapLinearFilter;
            fallbackTexture.magFilter = THREE.LinearFilter;
            fallbackTexture.anisotropy = maxAnisotropy.value;
            resolve(fallbackTexture);
          }
        );
      });
    };

    const createPlanetaryRing = () => {
      disposeObject(planetaryRing.value);
      if (!showNebula.value) return;
      const ringGroup = new THREE.Group();
      const innerRadius = 100,
        outerRadius = 140,
        height = 4.0;
      const particleCount = 20000;
      const positions = new Float32Array(particleCount * 3),
        colors = new Float32Array(particleCount * 3);
      const c1 = new THREE.Color("#B4E9D6"),
        c2 = new THREE.Color("#A4C8F5"),
        c3 = new THREE.Color("#C9A7E8");

      for (let i = 0; i < particleCount; i++) {
        const u1 = Math.random(),
          u2 = Math.random(),
          z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const midRadius = (innerRadius + outerRadius) / 2,
          spread = (outerRadius - innerRadius) / 6;
        let radius = midRadius + z * spread;
        radius = Math.max(innerRadius, Math.min(outerRadius, radius));
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * height * Math.pow(1 - Math.abs(radius - midRadius) / ((outerRadius - innerRadius) / 2), 0.5);
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        const angleProgress = angle / (Math.PI * 2);
        let finalColor;
        if (angleProgress < 1 / 3) finalColor = c1.clone().lerp(c2, angleProgress * 3);
        else if (angleProgress < 2 / 3) finalColor = c2.clone().lerp(c3, (angleProgress - 1 / 3) * 3);
        else finalColor = c3.clone().lerp(c1, (angleProgress - 2 / 3) * 3);
        finalColor.multiplyScalar(0.7 + Math.random() * 0.3);
        finalColor.toArray(colors, i * 3);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      });
      const points = new THREE.Points(geometry, material);
      ringGroup.add(points);
      planetaryRing.value = markRaw(ringGroup);
      scene.value.add(planetaryRing.value);
    };

    const createTimelineRing = (artworks) => {
      const allYears = [...new Set(artworks.map(a => a.year))].sort((a, b) => a - b);
      if (allYears.length === 0) return null;
      const timelineYears = getTimelineYears(allYears);
      const ringGroup = new THREE.Group();
      const timelineRadius = (100 + 140) / 2;
      const tiltAngle = Math.PI / 6;
      if (showOrbits.value && timelineYears.length > 1) {
        const orbitGeometry = new THREE.TorusGeometry(timelineRadius, 0.3, 16, 120);
        const orbitMaterial = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          transparent: true,
          opacity: 0.7
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2 + tiltAngle;
        ringGroup.add(orbit);
      }
      timelineYears.forEach((year, i) => {
        const angle = (i / timelineYears.length) * Math.PI * 2;
        const x = Math.cos(angle) * timelineRadius;
        const y = Math.sin(angle) * Math.sin(tiltAngle) * timelineRadius;
        const z = Math.sin(angle) * timelineRadius;
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x99DDFF })
        );
        marker.position.set(x, y, z);
        marker.userData = {
          type: 'timeline',
          year,
          onClick: () => focusOnYear(year)
        };
        timelineMarkers.value.push(marker);
        ringGroup.add(marker);
        const yearSprite = createYearSprite(year);
        yearSprite.position.set(x, y + 2.5, z);
        yearSprite.userData.year = year;
        ringGroup.add(yearSprite);
      });
      return ringGroup;
    };

    const createYearSprite = (year) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 150;
      canvas.height = 50;
      ctx.shadowColor = 'rgba(100, 150, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(year.toString(), canvas.width / 2, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      }));
      sprite.scale.set(12, 4, 1);
      sprite.userData.type = 'yearLabel';
      return sprite;
    };

    const createTitleSprite = (artwork) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = 'bold 18px Arial';
      const titleWidth = ctx.measureText(artwork.title).width;
      ctx.font = '16px Arial';
      const artistWidth = ctx.measureText(artwork.artist).width;
      const maxWidth = Math.max(titleWidth, artistWidth);
      canvas.width = maxWidth + 40;
      canvas.height = 50;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 5;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(artwork.title, canvas.width / 2, 20);
      ctx.font = '16px Arial';
      ctx.fillText(artwork.artist, canvas.width / 2, 38);
      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      }));
      sprite.scale.set(canvas.width / 15, canvas.height / 15, 1);
      return sprite;
    };

    const getTimelineYears = (years) => {
      if (years.length <= 12) return years;
      const step = Math.ceil(years.length / 12);
      return years.filter((_, i) => i % step === 0);
    };

    const createStarfield = () => {
      const stars = 8000;
      const positions = new Float32Array(stars * 3);
      const colors = new Float32Array(stars * 3);
      const radius = 2000;
      twinkleData.value = [];
      for (let i = 0; i < stars; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 2) * radius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);
        const brightness = Math.random() * 0.7 + 0.3;
        colors[i3] = brightness;
        colors[i3 + 1] = brightness;
        colors[i3 + 2] = brightness;
        twinkleData.value.push({
          speed: Math.random() * 0.5 + 0.1,
          offset: Math.random() * 10
        });
      }
      baseStarColors.value = new Float32Array(colors);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const starsMesh = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          size: 1.2,
          vertexColors: true,
          transparent: true,
          sizeAttenuation: true
        })
      );
      starfield.value = markRaw(starsMesh);
      scene.value.add(starfield.value);
    };

    const setupEventListeners = () => {
      const domElement = renderer.value.domElement;
      domElement.addEventListener('click', onCanvasClick);
      domElement.addEventListener('mousemove', onMouseMove);
      document.addEventListener('keydown', handleKeyDown);
    };

    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const onMouseMove = (event) => {
      if (cameraAnimation.value.active) return;
      const bounds = renderer.value.domElement.getBoundingClientRect();
      mouse.value.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.value.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.value.setFromCamera(mouse.value, camera.value);
      const intersects = raycaster.value.intersectObjects(artworkGroupsForRaycast.value, true);
      const newHoverTarget = (intersects.length > 0 && intersects[0].object.userData.artwork) ? intersects[0].object.userData.group : null;
      if (hoveredArtwork.value !== newHoverTarget) {
        if (hoveredArtwork.value) {
          const title = hoveredArtwork.value.getObjectByProperty("userData.type", "title");
          if (title) title.visible = false;
        }
        hoveredArtwork.value = newHoverTarget;
        if (hoveredArtwork.value) {
          const title = hoveredArtwork.value.getObjectByProperty("userData.type", "title");
          if (title) title.visible = true;
        }
      }
    };

    const onCanvasClick = (event) => {
      if (cameraAnimation.value.active) return;
      const bounds = renderer.value.domElement.getBoundingClientRect();
      mouse.value.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.value.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.value.setFromCamera(mouse.value, camera.value);
      const intersects = raycaster.value.intersectObjects(scene.value.children, true);
      if (intersects.length > 0) {
        for (const intersect of intersects) {
          const userData = intersect.object.userData;
          if (userData.type === 'timeline' || userData.year) {
            focusOnYear(userData.year);
            return;
          }
          if (userData.type === 'artwork') {
            const artworkGroup = userData.group;
            const targetPosition = new THREE.Vector3();
            artworkGroup.getWorldPosition(targetPosition);
            viewArtworkDetail(userData.artwork, artworkGroup, targetPosition);
            return;
          }
        }
      }
    };

    const viewArtworkDetail = (artwork, artworkGroup, worldPosition) => {
      if (!artworkGroup) return;
      const artworkPosition = worldPosition || artworkGroup.position;
      const direction = new THREE.Vector3().subVectors(camera.value.position, artworkPosition).normalize();
      cameraAnimation.value.active = true;
      cameraAnimation.value.startTime = Date.now();
      cameraAnimation.value.duration = 1200;
      cameraAnimation.value.startPos.copy(camera.value.position);
      cameraAnimation.value.endPos.copy(
        artworkPosition.clone().add(direction.multiplyScalar(currentStyle.value === 'classical' ? 35 : 20))
      );
      cameraAnimation.value.startTarget.copy(controls.value.target);
      cameraAnimation.value.endTarget.copy(artworkPosition);
      selectedArtwork.value = artwork;
      if (autoRotate.value) toggleAutoRotate();
    };

    const closeArtworkDetail = () => {
      resetCamera();
    };

    const focusOnYear = (year) => {
      const artworksOfYear = artworkGroupsForRaycast.value.filter(group => {
        return group.children.find(c => c.userData && c.userData.artwork && c.userData.artwork.year === year);
      });
      if (artworksOfYear.length === 0) return;
      const centerPoint = new THREE.Vector3();
      artworksOfYear.forEach(group => {
        const worldPos = new THREE.Vector3();
        group.getWorldPosition(worldPos);
        centerPoint.add(worldPos);
      });
      centerPoint.divideScalar(artworksOfYear.length);
      const direction = new THREE.Vector3().subVectors(camera.value.position, centerPoint).normalize();
      const focusDistance = 60;
      cameraAnimation.value.active = true;
      cameraAnimation.value.startTime = Date.now();
      cameraAnimation.value.duration = 1500;
      cameraAnimation.value.startPos.copy(camera.value.position);
      cameraAnimation.value.endPos.copy(
        centerPoint.clone().add(direction.multiplyScalar(focusDistance))
      );
      cameraAnimation.value.startTarget.copy(controls.value.target);
      cameraAnimation.value.endTarget.copy(centerPoint);
      if (artworksOfYear.length > 0) {
        const firstArtwork = artworksOfYear[0].children.find(c => c.userData && c.userData.artwork);
        if (firstArtwork) {
          selectedArtwork.value = firstArtwork.userData.artwork;
          if (autoRotate.value) toggleAutoRotate();
        }
      }
    };

    const rotatePlanet = (direction) => {
      const rotationAmount = (currentStyle.value === 'classical' ? 0.02 : 0.05);
      if (centralObject.value) centralObject.value.rotation.y += (direction === 'left' ? rotationAmount : -rotationAmount);
    };

    const toggleAutoRotate = () => {
      autoRotate.value = !autoRotate.value;
      if (controls.value) controls.value.autoRotate = autoRotate.value;
    };

    const toggleNebula = () => {
      showNebula.value = !showNebula.value;
      createPlanetaryRing();
    };

    const toggleOrbits = async () => {
      showOrbits.value = !showOrbits.value;
      await rebuildScene();
    };

    const zoomIn = () => {
      controls.value.dollyIn(1.1);
      controls.value.update();
    };

    const zoomOut = () => {
      controls.value.dollyOut(1.1);
      controls.value.update();
    };

    const resetCamera = () => {
      cameraAnimation.value.active = true;
      cameraAnimation.value.startTime = Date.now();
      cameraAnimation.value.duration = 1500;
      cameraAnimation.value.startPos.copy(camera.value.position);
      // --- 修改点 2：调整重置后的相机位置，与初始位置保持一致 ---
      cameraAnimation.value.endPos.set(0, 40, 160);
      cameraAnimation.value.startTarget.copy(controls.value.target);
      cameraAnimation.value.endTarget.set(0, 0, 0);
      selectedArtwork.value = null;
      if (!autoRotate.value) toggleAutoRotate();
    };

    const viewFullArtwork = () => {
      if (selectedArtwork.value) router.push(`/artwork/${selectedArtwork.value.id}`);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeArtworkDetail();
      const actions = {
        "ArrowLeft": () => rotatePlanet("left"),
        "ArrowRight": () => rotatePlanet("right"),
        "ArrowUp": () => zoomIn(),
        "ArrowDown": () => zoomOut(),
        " ": () => toggleAutoRotate(),
        "Enter": () => resetCamera()
      };
      if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]();
      }
    };

    const handleResize = () => {
      if (!camera.value || !renderer.value) return;
      const container = document.querySelector('.three-container');
      if (!container) return;
      camera.value.aspect = container.clientWidth / container.clientHeight;
      camera.value.updateProjectionMatrix();
      renderer.value.setSize(container.clientWidth, container.clientHeight);
      composer.value.setSize(container.clientWidth, container.clientHeight);
    };

    const animate = () => {
      animationId.value = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      if (cameraAnimation.value.active) {
        const elapsed = Date.now() - cameraAnimation.value.startTime;
        const progress = Math.min(elapsed / cameraAnimation.value.duration, 1);
        const easeProgress = easeInOutCubic(progress);
        camera.value.position.lerpVectors(cameraAnimation.value.startPos, cameraAnimation.value.endPos, easeProgress);
        controls.value.target.lerpVectors(cameraAnimation.value.startTarget, cameraAnimation.value.endTarget, easeProgress);
        if (progress >= 1) {
          cameraAnimation.value.active = false;
          camera.value.position.copy(cameraAnimation.value.endPos);
          controls.value.target.copy(cameraAnimation.value.endTarget);
        }
      }
      if (starfield.value && twinkleData.value.length > 0) {
        const colors = starfield.value.geometry.attributes.color;
        for (let i = 0; i < twinkleData.value.length; i++) {
          const { speed, offset } = twinkleData.value[i];
          const baseBrightness = baseStarColors.value[i * 3];
          const brightness = baseBrightness * (0.5 + 0.5 * Math.abs(Math.sin(time * speed + offset)));
          colors.setXYZ(i, brightness, brightness, brightness);
        }
        colors.needsUpdate = true;
      }
      if (planetaryRing.value) planetaryRing.value.rotation.y += 0.0005;
      if (centralObject.value) centralObject.value.rotation.y += 0.001;
      controls.value?.update();
      composer.value?.render();
    };

    const cleanupThree = () => {
      cancelAnimationFrame(animationId.value);
      const domElement = renderer.value?.domElement;
      if (domElement) {
        domElement.removeEventListener("click", onCanvasClick);
        domElement.removeEventListener("mousemove", onMouseMove);
      }
      document.removeEventListener("keydown", handleKeyDown);
      disposeObject(centralObject.value);
      disposeObject(artworkContainer.value);
      disposeObject(timelineContainer.value);
      disposeObject(planetaryRing.value);
      disposeObject(starfield.value);
      disposeObject(specialLight.value);
      if (camera.value) camera.value.remove(cameraSpotlight.value);
      renderer.value?.dispose();
      if (domElement?.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };

    // 返回所有需要在模板中使用的数据和方法
    return {
      currentStyle,
      autoRotate,
      showNebula,
      showOrbits,
      loading,
      selectedArtwork,
      artworks: displayedArtworks,
      rotatePlanet,
      zoomIn,
      zoomOut,
      resetCamera,
      toggleAutoRotate,
      toggleNebula,
      toggleOrbits,
      changeGallery,
      closeArtworkDetail,
      viewFullArtwork
    };
  }
}
</script>

<style scoped>
.gallery-view { height: 100vh; width: 100vw; position: relative; background: #0a0a2a; overflow: hidden; color: white; }
.three-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; cursor: grab; }
.three-container:active { cursor: grabbing; }
.loading-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 10, 42, 0.95); backdrop-filter: blur(15px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; transition: opacity 0.5s ease; }
.loading-spinner { width: 70px; height: 70px; border: 5px solid rgba(255, 255, 255, 0.1); border-radius: 50%; border-top-color: #8a8aff; animation: spin 1.2s ease-in-out infinite; margin-bottom: 25px; box-shadow: 0 0 20px rgba(138, 138, 255, 0.3); }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-overlay p { color: white; font-size: 1.3rem; text-shadow: 0 0 15px rgba(138, 138, 255, 0.6); letter-spacing: 1px; }
.gallery-controls, .help-tooltip { pointer-events: none; }
.gallery-controls > *, .help-tooltip > *, .gallery-ui > * { pointer-events: auto; }
.gallery-ui { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; pointer-events: none;}
.gallery-controls { position: absolute; top: 25px; left: 0; right: 0; display: flex; justify-content: space-between; align-items: flex-start; padding: 0 2.5rem; }
.control-section, .style-section { background: rgba(10, 10, 42, 0.85); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 18px; padding: 1.8rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
.control-section { display: flex; gap: 2.5rem; }
.control-group { display: flex; flex-direction: column; gap: 1rem; }
.control-title { color: rgba(255, 255, 255, 0.95); font-size: 1rem; font-weight: 600; margin: 0; letter-spacing: 0.5px; }
.control-buttons { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.control-btn { padding: 1rem; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 14px; cursor: pointer; color: white; font-weight: bold; transition: all 0.3s ease; min-width: 60px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
.control-btn:hover { background: rgba(138, 138, 255, 0.4); border-color: rgba(138, 138, 255, 0.7); transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 20px rgba(138, 138, 255, 0.4); }
.control-btn.active { background: rgba(138, 138, 255, 0.5); border-color: rgba(138, 138, 255, 0.8); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(138, 138, 255, 0.5); }
.btn-icon { font-size: 1.4rem; filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6)); }
.style-dropdown { padding: 1rem 1.2rem; background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 14px; color: white; font-size: 1.1rem; cursor: pointer; min-width: 280px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); transition: all 0.3s ease; }
.style-dropdown:hover { background: rgba(255, 255, 255, 0.18); border-color: rgba(255, 255, 255, 0.4); }
.style-dropdown:focus { outline: none; border-color: rgba(138, 138, 255, 0.8); box-shadow: 0 0 0 3px rgba(138, 138, 255, 0.2); }
.style-dropdown option { background: #1a1a4a; color: white; padding: 10px; }
.style-hint { color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-top: 10px; font-style: italic; }
.help-tooltip { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); }
.tooltip-content { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 1rem 2rem; color: rgba(255, 255, 255, 0.9); font-size: 0.95rem; text-align: center; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3); max-width: 400px; }
.artwork-detail-panel { position: absolute; top: 50%; right: 30px; transform: translateY(-50%); z-index: 200; width: 320px; background: rgba(10, 10, 42, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); animation: slideIn 0.5s ease-out; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-50%) translateX(50px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }
.detail-content { color: white; }
.detail-content h3 { margin: 0 0 10px 0; font-size: 1.5rem; color: #ffffff; }
.detail-content .artist { margin: 0 0 5px 0; font-size: 1.1rem; color: #ccccff; font-weight: 500; }
.detail-content .year { margin: 0 0 15px 0; font-size: 0.9rem; color: #aaaacc; opacity: 0.8; }
.detail-content .description { margin: 15px 0; line-height: 1.6; font-size: 0.95rem; color: #eeeeff; max-height: 200px; overflow-y: auto; padding-right: 10px; }
.detail-actions { margin-top: 20px; }
.action-btn { width: 100%; padding: 12px; background: rgba(138, 138, 255, 0.3); border: 1px solid rgba(138, 138, 255, 0.5); border-radius: 10px; color: white; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; }
.action-btn:hover { background: rgba(138, 138, 255, 0.5); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(138, 138, 255, 0.3); }
.close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; font-size: 1.8rem; cursor: pointer; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.3s ease; }
.close-btn:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.1); }
@media (max-width: 1024px) { .gallery-controls { flex-direction: column; gap: 1.2rem; padding: 1.2rem; align-items: center; } .control-section, .style-section { width: 100%; max-width: 95vw; box-sizing: border-box; justify-content: center; padding: 1.5rem; } .style-dropdown { width: 100%; min-width: auto; } .help-tooltip { display: none; } .control-section { flex-direction: column; gap: 1.5rem; } .artwork-detail-panel { width: 280px; right: 20px; } }
@media (max-width: 768px) { .gallery-controls { top: 15px; padding: 1rem; } .control-title { font-size: 0.9rem; } .control-btn { padding: 0.8rem; min-width: 50px; } .btn-icon { font-size: 1.2rem; } .style-dropdown { padding: 0.8rem 1rem; font-size: 1rem; } .artwork-detail-panel { position: fixed; top: auto; bottom: 20px; right: 20px; left: 20px; transform: none; width: auto; max-height: 300px; } .detail-content .description { max-height: 120px; } }
</style>