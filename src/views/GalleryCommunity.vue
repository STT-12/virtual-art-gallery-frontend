<template>
  <div class="gallery-community">
    <!-- 星空背景 -->
    <div class="starry-background"></div>
    <div class="meteor-shower"></div>
    <div class="frosted-overlay"></div>

    <!-- 旋转背景框 -->
    <div class="rotating-background-frame">
      <div class="rotating-frame">
        <div class="frame-content"></div>
      </div>
    </div>

    <!-- 主要内容容器 -->
    <div class="community-container">
      <!-- 头部区域 -->
      <header class="community-header">
        <button @click="goBack" class="back-btn">
          <span class="btn-content">
            <span class="icon">←</span>
            返回
          </span>
        </button>

        <div class="header-center">
          <h1 class="fluorescent-title">👥 画廊社区</h1>
          <p class="fluorescent-subtitle">与好友分享艺术，在星辰下交流</p>
        </div>

        <!-- 通知按钮和面板 -->
        <div class="notification-container">
          <button @click="toggleNotifications" class="notification-btn">
            <span class="btn-content">
              <span class="icon">🔔</span>
              <span v-if="unreadNotificationCount > 0" class="notification-badge">
                {{ unreadNotificationCount }}
              </span>
            </span>
          </button>

          <!-- 通知面板 -->
          <div v-if="showNotifications" class="notifications-panel cosmic-card">
            <div class="notifications-header">
              <h3 class="fluorescent-text">通知中心</h3>
              <div class="notifications-actions">
                <button @click="showFriendRequests = true" class="view-requests-btn cosmic-btn">
                  好友请求 ({{ pendingRequests.length }})
                </button>
                <button @click="markAllNotificationsAsRead" class="mark-all-read-btn cosmic-btn">
                  全部已读
                </button>
              </div>
            </div>

            <!-- 好友请求预览 -->
            <div v-if="pendingRequests.length > 0" class="requests-preview cosmic-card">
              <div class="preview-header">
                <span class="fluorescent-label">好友请求</span>
                <span class="preview-count">{{ pendingRequests.length }} 个待处理</span>
              </div>
              <div class="preview-items">
                <div
                  v-for="request in pendingRequests.slice(0, 3)"
                  :key="request.user_id"
                  class="preview-item"
                >
                  <img
                    :src="getUserAvatar(request.avatar)"
                    :alt="request.username"
                    class="preview-avatar"
                  >
                  <div class="preview-info">
                    <span class="preview-name">{{ request.username }}</span>
                    <span class="preview-time">{{ formatTime(request.created_at) }}</span>
                  </div>
                  <div class="preview-actions">
                    <button
                      @click.stop="acceptFriendRequest(request.user_id)"
                      class="preview-accept-btn cosmic-btn"
                    >
                      接受
                    </button>
                    <button
                      @click.stop="rejectFriendRequest(request.user_id)"
                      class="preview-reject-btn cosmic-btn"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              </div>
              <button
                @click="showFriendRequests = true; showNotifications = false"
                class="view-all-btn cosmic-btn"
              >
                查看所有好友请求
              </button>
            </div>

            <!-- 通知列表 -->
            <div class="notifications-list">
              <div v-if="filteredNotifications.length === 0" class="empty-notifications">
                <div class="empty-icon">🔔</div>
                <p>暂无通知</p>
              </div>

              <div
                v-for="notification in filteredNotifications"
                :key="notification.id"
                :class="['notification-item cosmic-card', { unread: !notification.read }]"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-icon">
                  <span v-if="notification.type === 'friend_request'">👥</span>
                  <span v-else-if="notification.type === 'friend_request_accepted'">✅</span>
                  <span v-else-if="notification.type === 'gallery_like'">❤️</span>
                  <span v-else-if="notification.type === 'comment'">💬</span>
                  <span v-else-if="notification.type === 'gallery_shared'">🎨</span>
                  <span v-else>🔔</span>
                </div>

                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-text">{{ notification.content }}</div>
                  <div class="notification-meta">
                    <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
                    <span v-if="!notification.read" class="unread-dot"></span>
                  </div>
                </div>

                <button
                  v-if="notification.type === 'friend_request' && !notification.read"
                  @click.stop="handleFriendRequestInPanel(notification)"
                  class="notification-action-btn cosmic-btn"
                >
                  处理
                </button>
                <button
                  v-else-if="notification.type === 'gallery_shared'"
                  @click.stop="handleGalleryShareNotification(notification)"
                  class="notification-action-btn cosmic-btn"
                >
                  查看
                </button>
                <button
                  v-else
                  @click.stop="markNotificationAsRead(notification.id)"
                  class="notification-read-btn"
                  :class="{ read: notification.read }"
                >
                  ●
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- 分享画廊成功提示 -->
      <div v-if="shareSuccessMessage" class="share-success-alert">
        <div class="alert-content cosmic-card">
          <div class="alert-icon">🎉</div>
          <div class="alert-info">
            <strong class="alert-title">{{ shareSuccessMessage }}</strong>
          </div>
          <button @click="shareSuccessMessage = ''" class="alert-close-btn cosmic-btn">
            ×
          </button>
        </div>
      </div>

      <!-- 主内容区域 -->
      <main class="community-main">
        <!-- 左侧 - 好友列表和聊天 -->
        <aside class="friends-sidebar cosmic-card">
          <div class="sidebar-header">
            <h3 class="fluorescent-subtitle">🌟 我的好友</h3>
            <button @click="showAddFriendModal = true" class="add-friend-btn cosmic-btn">
              <span class="btn-content">
                <span class="icon">+</span>
                添加好友
              </span>
            </button>
          </div>

          <!-- 好友列表 -->
          <div class="friends-list">
            <div
              v-for="friend in friends"
              :key="friend.id"
              :class="['friend-item', { active: activeFriend?.id === friend.id }]"
              @click="selectFriend(friend)"
            >
              <div class="friend-avatar">
                <img
                  :src="getUserAvatar(friend.avatar)"
                  :alt="friend.username"
                  class="avatar-img"
                >
                <div class="online-indicator" :class="{ online: friend.online }"></div>
              </div>

              <div class="friend-info">
                <div class="friend-name">{{ friend.username }}</div>
                <div class="friend-status">
                  <span class="status-text">{{ friend.online ? '在线' : '离线' }}</span>
                  <span v-if="friend.unread_count > 0" class="unread-badge">
                    {{ friend.unread_count }}
                  </span>
                </div>
                <div class="friend-stats">
                  <span class="stat">
                    <span class="stat-icon">🎨</span>
                    {{ friend.gallery_count || 0 }}
                  </span>
                  <span class="stat">
                    <span class="stat-icon">❤️</span>
                    {{ friend.likes_count || 0 }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="friends.length === 0" class="empty-friends">
              <div class="empty-icon">👥</div>
              <p class="empty-text">还没有好友呢</p>
              <button @click="showAddFriendModal = true" class="find-friends-btn cosmic-btn">
                寻找好友
              </button>
            </div>
          </div>

          <!-- 聊天窗口 -->
          <div v-if="activeFriend" class="chat-window cosmic-card">
            <div class="chat-header">
              <div class="chat-user">
                <img
                  :src="getUserAvatar(activeFriend.avatar)"
                  :alt="activeFriend.username"
                  class="chat-avatar"
                >
                <div class="chat-user-info">
                  <h4 class="chat-username">{{ activeFriend.username }}</h4>
                  <span class="chat-status" :class="{ online: activeFriend.online }">
                    {{ activeFriend.online ? '在线' : '离线' }}
                  </span>
                </div>
              </div>
              <button @click="closeChat" class="close-chat-btn">×</button>
            </div>

            <div class="chat-messages" ref="chatMessages">
              <div v-if="conversationMessages.length === 0" class="empty-chat">
                <div class="chat-empty-icon">💬</div>
                <p>开始和 {{ activeFriend.username }} 聊天吧！</p>
              </div>

              <div
                v-for="message in conversationMessages"
                :key="message.id"
                :class="['message', {
                  'me': message.sender_id === user?.id,
                  'gallery-share': message.type === 'gallery_share'
                }]"
              >
                <div v-if="message.type === 'gallery_share'" class="gallery-share-message">
                  <div class="share-header">
                    <span class="share-icon">🎨</span>
                    <span class="share-title">画廊分享</span>
                  </div>
                  <div class="share-content">
                    <div class="share-gallery-info">
                      <div class="gallery-name">{{ getGalleryShareName(message) }}</div>
                      <div class="gallery-author">
                        作者：{{ getGalleryShareAuthor(message) }}
                      </div>
                      <div class="share-time">{{ formatTime(message.created_at) }}</div>
                    </div>
                    <button
                      @click.stop="viewSharedGallery(message)"
                      class="view-shared-gallery-btn cosmic-btn"
                    >
                      查看画廊
                    </button>
                  </div>
                  <div v-if="message.content" class="share-message-text">
                    {{ message.content }}
                  </div>
                </div>
                <div v-else class="message-content">
                  <div class="message-text">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.created_at) }}</div>
                </div>
              </div>
            </div>

            <div class="chat-input">
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                placeholder="输入消息..."
                class="message-input cosmic-input"
              >
              <button @click="sendMessage" class="send-btn cosmic-btn">
                <span class="btn-content">发送</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- 右侧 - 画廊展示 -->
        <section class="friend-galleries">
          <div class="galleries-header cosmic-card">
            <div class="galleries-title">
              <h3 class="fluorescent-subtitle">
                {{ activeFriend ? `${activeFriend.username} 的画廊` : '探索画廊' }}
                <span v-if="activeFriend" class="friend-galleries-count">
                  ({{ friendGalleryCount }} 个画廊)
                </span>
              </h3>
              <div v-if="activeFriend" class="friend-info-badge">
                <img
                  :src="getUserAvatar(activeFriend.avatar)"
                  :alt="activeFriend.username"
                  class="friend-avatar-sm"
                >
                <span class="friend-name-sm">{{ activeFriend.username }}</span>
                <button @click="closeFriendFilter" class="close-filter-btn" title="清除筛选">
                  ×
                </button>
              </div>
            </div>

            <div class="search-controls">
              <div class="search-box">
                <input
                  v-model="gallerySearchQuery"
                  @input="searchGalleries"
                  placeholder="搜索画廊..."
                  class="search-input cosmic-input"
                >
                <span class="search-icon">🔍</span>
              </div>
              <button @click="toggleViewMode('grid')" class="view-mode-btn cosmic-btn" :class="{ active: viewMode === 'grid' }">
                <span class="icon">◼◼</span>
                网格
              </button>
              <button @click="toggleViewMode('list')" class="view-mode-btn cosmic-btn" :class="{ active: viewMode === 'list' }">
                <span class="icon">≡</span>
                列表
              </button>
            </div>
          </div>

          <!-- 画廊网格/列表 -->
          <div :class="['galleries-container', viewMode]">
            <div
              v-for="gallery in displayedGalleries"
              :key="gallery.id"
              :class="['gallery-card cosmic-card', {
                'disabled': !canViewGallery(gallery),
                'private': gallery.privacy === 'private',
                'friends-only': gallery.privacy === 'friends',
                'friend-gallery': gallery.user_id === activeFriend?.id
              }]"
              @click="handleGalleryClick(gallery)"
            >
              <div class="card-background" :style="{ background: getGalleryTheme(gallery.theme) }"></div>
              <div class="card-overlay"></div>

              <!-- 好友画廊标记 -->
              <div v-if="gallery.user_id === activeFriend?.id" class="friend-gallery-badge">
                <span class="badge-icon">👤</span>
                <span class="badge-text">好友画廊</span>
              </div>

              <!-- 权限锁覆盖层 -->
              <div v-if="!canViewGallery(gallery)" class="permission-overlay">
                <span class="lock-icon">{{ gallery.privacy === 'private' ? '😴' : '😊' }}</span>
                <div class="lock-text">
                  {{ gallery.privacy === 'private' ? '您好，这是作者私人画廊哦' : '您还不是作者的好友，暂时没有权限查看哦' }}
                </div>
              </div>

              <div class="card-content">
                <!-- 画廊预览 -->
                <div class="gallery-preview">
                  <div class="preview-artworks">
                    <div
                      v-for="(item, index) in getGalleryPreviewItems(gallery)"
                      :key="item.id"
                      class="preview-artwork"
                      :style="{
                        transform: `rotate(${(index - 1) * 5}deg)`,
                        zIndex: 3 - index,
                        left: `${index * 40}px`
                      }"
                    >
                      <div class="wooden-frame">
                        <div class="artwork-content" :style="{
                          backgroundImage: `url('${getArtworkImageUrl(item)}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }">
                          <div class="artwork-overlay"></div>
                          <div v-if="item.artwork?.title" class="artwork-title-small">
                            {{ item.artwork.title }}
                          </div>
                        </div>
                        <div class="frame-corner corner-tl"></div>
                        <div class="frame-corner corner-tr"></div>
                        <div class="frame-corner corner-bl"></div>
                        <div class="frame-corner corner-br"></div>
                      </div>
                      <div class="artwork-glow" :style="{ background: getArtworkColor(item.artwork?.style) }"></div>
                    </div>
                  </div>

                  <div class="star-field">
                    <span v-for="n in 5" :key="n" class="star" :style="starStyle(n)">✨</span>
                  </div>

                  <div class="preview-label" :class="gallery.privacy">
                    <span class="label-icon">{{ getPrivacyIcon(gallery.privacy) }}</span>
                    <span class="label-text">{{ getPrivacyText(gallery.privacy) }}</span>
                  </div>
                </div>

                <!-- 画廊信息 -->
                <div class="gallery-info">
                  <div class="gallery-header-row">
                    <h4 class="gallery-title">{{ gallery.name }}</h4>
                    <div class="gallery-meta">
                      <div class="meta-item">
                        <span class="meta-icon">🕒</span>
                        <span class="meta-text">{{ formatTime(gallery.created_at) }}</span>
                      </div>
                      <div class="meta-item">
                        <span class="meta-icon">{{ getThemeIcon(gallery.theme) }}</span>
                        <span class="meta-text">{{ getThemeName(gallery.theme) }}</span>
                      </div>
                    </div>
                  </div>

                  <p class="gallery-description">
                    {{ gallery.description || '这个画廊还没有描述' }}
                  </p>

                  <div class="gallery-stats">
                    <div class="stat">
                      <span class="stat-icon">🎨</span>
                      {{ gallery.artworks?.length || 0 }} 作品
                    </div>
                    <div class="stat">
                      <span class="stat-icon">❤️</span>
                      {{ gallery.likes_count || 0 }}
                    </div>
                    <div class="stat">
                      <span class="stat-icon">💬</span>
                      {{ gallery.comments_count || 0 }}
                    </div>
                  </div>

                  <div class="gallery-actions" v-if="canInteractWithGallery(gallery)">
                  
                  </div>
                  <div class="gallery-actions" v-else>
                    <button class="action-btn disabled-btn" disabled>
                      <span class="action-icon">🔒</span>
                      无权限
                    </button>
                  </div>

                  <div class="gallery-author">
                    <img
                      :src="getUserAvatar(gallery.author_avatar)"
                      :alt="gallery.username"
                      class="author-avatar"
                    >
                    <span class="author-name">{{ gallery.username }}</span>
                    <span v-if="isFriend(gallery.user_id)" class="friend-badge">好友</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="displayedGalleries.length === 0" class="empty-state">
            <div class="empty-card cosmic-card">
              <div class="card-background"></div>
              <div class="card-overlay"></div>
              <div class="card-content">
                <div class="empty-icon">🖼️</div>
                <h3>暂无画廊</h3>
                <p v-if="activeFriend && gallerySearchQuery">{{ activeFriend.username }} 没有匹配的画廊</p>
                <p v-else-if="activeFriend">{{ activeFriend.username }} 还没有创建画廊</p>
                <p v-else>没有找到符合条件的画廊</p>
                <button v-if="activeFriend" @click="closeFriendFilter" class="clear-filter-btn cosmic-btn">
                  查看所有画廊
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- 添加好友模态框 -->
    <div v-if="showAddFriendModal" class="add-friend-modal">
      <div class="modal-overlay" @click="showAddFriendModal = false"></div>
      <div class="modal-content cosmic-card">
        <div class="modal-header">
          <h3 class="fluorescent-text">👥 添加好友</h3>
          <button @click="showAddFriendModal = false" class="close-modal-btn">×</button>
        </div>

        <div class="modal-body">
          <div class="search-section">
            <div class="search-box">
              <input
                v-model="friendSearchQuery"
                @input="debouncedSearchUsers"
                placeholder="搜索用户名或邮箱..."
                class="search-input cosmic-input"
              >
              <span class="search-icon">🔍</span>
            </div>

            <div v-if="friendRequestResult" class="result-message" :class="friendRequestResult.type">
              {{ friendRequestResult.message }}
            </div>
          </div>

          <div class="search-results">
            <div v-if="searchingUsers" class="loading-results">
              <div class="spinner"></div>
              <p>搜索中...</p>
            </div>

            <div v-else-if="searchResults.length === 0 && friendSearchQuery" class="empty-results">
              <div class="empty-icon">👤</div>
              <p>未找到相关用户</p>
              <p class="hint-text">请检查搜索关键词是否正确</p>
            </div>

            <div v-else-if="searchResults.length === 0" class="empty-results">
              <div class="empty-icon">🔍</div>
              <p>输入用户名或邮箱搜索用户</p>
              <p class="hint-text">你可以通过用户名、邮箱地址查找好友</p>
            </div>

            <div v-else class="results-list">
              <div
                v-for="user in searchResults"
                :key="user.id"
                class="search-result-item cosmic-card"
              >
                <div class="result-header">
                  <img
                    :src="getUserAvatar(user.avatar)"
                    :alt="user.username"
                    class="result-avatar"
                  >
                  <div class="result-info">
                    <div class="result-name">{{ user.username }}</div>
                    <div class="result-email">{{ user.email }}</div>
                    <div class="result-status">
                      <span :class="['status-dot', { online: user.online }]"></span>
                      {{ user.online ? '在线' : '离线' }}
                    </div>
                  </div>
                </div>

                <div class="result-footer">
                  <div class="result-stats">
                    <div class="stat">
                      <span class="stat-icon">🎨</span>
                      <span class="stat-value">{{ user.gallery_count || 0 }}</span>
                      <span class="stat-label">画廊</span>
                    </div>
                    <div class="stat">
                      <span class="stat-icon">❤️</span>
                      <span class="stat-value">{{ user.likes_count || 0 }}</span>
                      <span class="stat-label">获赞</span>
                    </div>
                  </div>

                  <div class="result-actions">
                    <button
                      v-if="user.friend_status === 'none'"
                      @click="sendFriendRequest(user)"
                      class="add-btn cosmic-btn"
                    >
                      添加好友
                    </button>

                    <button
                      v-else-if="user.friend_status === 'request_sent'"
                      class="pending-btn cosmic-btn"
                      disabled
                    >
                      已发送请求
                    </button>

                    <button
                      v-else-if="user.friend_status === 'request_received'"
                      @click="showFriendRequests = true"
                      class="received-btn cosmic-btn"
                    >
                      待处理请求
                    </button>

                    <button
                      v-else-if="user.friend_status === 'friend'"
                      class="friend-btn cosmic-btn"
                      disabled
                    >
                      已是好友
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 好友请求模态框 -->
    <div v-if="showFriendRequests" class="friend-requests-modal">
      <div class="modal-overlay" @click="showFriendRequests = false"></div>
      <div class="modal-content cosmic-card">
        <div class="modal-header">
          <h3 class="fluorescent-text">👥 好友请求</h3>
          <button @click="showFriendRequests = false" class="close-modal-btn">×</button>
        </div>

        <div class="modal-body">
          <div v-if="pendingRequests.length === 0" class="empty-requests">
            <div class="empty-icon">✅</div>
            <p>暂无好友请求</p>
            <p class="hint-text">所有请求已处理完成</p>
          </div>

          <div v-else class="requests-list">
            <div
              v-for="request in pendingRequests"
              :key="request.id"
              class="request-item cosmic-card"
            >
              <div class="request-header">
                <img
                  :src="getUserAvatar(request.avatar)"
                  :alt="request.username"
                  class="request-avatar"
                >
                <div class="request-info">
                  <div class="request-name">{{ request.username }}</div>
                  <div class="request-email">{{ request.email }}</div>
                  <div class="request-time">{{ formatTime(request.created_at) }}</div>
                </div>
              </div>

              <div class="request-actions">
                <button @click="acceptFriendRequest(request.user_id)" class="accept-btn cosmic-btn">
                  接受
                </button>
                <button @click="rejectFriendRequest(request.user_id)" class="reject-btn cosmic-btn">
                  拒绝
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分享画廊模态框 -->
    <div v-if="showShareModal && selectedGallery" class="share-gallery-modal">
      <div class="modal-overlay" @click="showShareModal = false"></div>
      <div class="modal-content cosmic-card">
        <div class="modal-header">
          <h3 class="fluorescent-text">🎨 分享画廊</h3>
          <button @click="showShareModal = false" class="close-modal-btn">×</button>
        </div>

        <div class="modal-body">
          <!-- 画廊预览 -->
          <div class="gallery-share-preview cosmic-card">
            <div class="preview-content">
              <div class="preview-header">
                <h4>{{ selectedGallery.name }}</h4>
                <div class="privacy-tag" :class="selectedGallery.privacy">
                  {{ getPrivacyText(selectedGallery.privacy) }}
                </div>
              </div>
              <p class="gallery-description">{{ selectedGallery.description || '暂无描述' }}</p>
              <div class="gallery-stats-preview">
                <span>🎨 {{ selectedGallery.artworks?.length || 0 }} 作品</span>
                <span>❤️ {{ selectedGallery.likes_count || 0 }} 点赞</span>
                <span>👁️ {{ selectedGallery.views_count || 0 }} 浏览</span>
              </div>
              <div class="gallery-author-preview">
                <img :src="getUserAvatar(selectedGallery.author_avatar)"
                     :alt="selectedGallery.username"
                     class="author-avatar-sm">
                <span>作者：{{ selectedGallery.username }}</span>
              </div>
            </div>
          </div>

          <!-- 分享方式选择 -->
          <div class="share-options">
            <div class="option-section">
              <h4>选择分享方式：</h4>
              <div class="option-buttons">
                <button @click="shareMethod = 'friend'"
                        :class="{ active: shareMethod === 'friend' }"
                        class="share-option-btn cosmic-btn">
                  👥 分享给好友
                </button>
                <button @click="shareMethod = 'link'"
                        :class="{ active: shareMethod === 'link' }"
                        class="share-option-btn cosmic-btn">
                  🔗 复制链接
                </button>
              </div>
            </div>

            <!-- 分享给好友 -->
            <div v-if="shareMethod === 'friend'" class="share-to-friend">
              <div class="friends-selector">
                <div class="friends-search">
                  <input v-model="friendSearchFilter"
                        placeholder="搜索好友..."
                        class="search-input cosmic-input"
                        @keyup.enter="filterFriends">
                  <span class="search-icon">🔍</span>
                </div>

                <div class="friends-list-select scrollable">
                  <div v-if="filteredShareFriends.length === 0" class="empty-friends-select">
                    <div class="empty-icon">👥</div>
                    <p>暂无好友</p>
                  </div>

                  <div v-for="friend in filteredShareFriends"
                      :key="friend.id"
                      :class="['friend-select-item', { selected: selectedFriends.includes(friend.id) }]"
                      @click="toggleFriendSelection(friend.id)">
                    <div class="friend-select-avatar">
                      <img :src="getUserAvatar(friend.avatar)" :alt="friend.username">
                      <div class="online-indicator" :class="{ online: friend.online }"></div>
                    </div>
                    <div class="friend-select-info">
                      <div class="friend-select-name">{{ friend.username }}</div>
                      <div class="friend-select-status">
                        {{ friend.online ? '在线' : '离线' }}
                      </div>
                    </div>
                    <div class="friend-select-checkbox">
                      <div class="checkbox" :class="{ checked: selectedFriends.includes(friend.id) }">
                        {{ selectedFriends.includes(friend.id) ? '✓' : '' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分享消息 -->
              <div class="share-message">
                <h4>附加消息（可选）：</h4>
                <textarea v-model="shareMessage"
                          placeholder="给你的好友留言..."
                          class="message-input cosmic-input"
                          rows="3"></textarea>
              </div>

              <button @click="shareGalleryToFriends"
                      :disabled="selectedFriends.length === 0 || isSharing"
                      class="send-share-btn cosmic-btn">
                <span v-if="isSharing" class="spinner-small"></span>
                <span v-else>✉️ 发送给 {{ selectedFriends.length }} 位好友</span>
              </button>
            </div>

            <!-- 复制链接 -->
            <div v-else class="share-link">
              <div class="link-preview">
                <input :value="galleryShareUrl"
                      readonly
                      class="link-input cosmic-input"
                      ref="shareLinkInput">
                <button @click="copyGalleryLink" class="copy-link-btn cosmic-btn">
                  复制链接
                </button>
              </div>
              <p class="link-hint">
                🔗 将链接发送给任何人，他们都可以查看这个画廊（根据隐私设置）
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 画廊详情路由视图 -->
    <router-view />
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  friendAPI,
  notificationAPI,
  galleryAPI,
  messageAPI,
  messageSharesAPI
} from '../utils/api'
import './GalleryCommunity.css'

export default {
  name: 'GalleryCommunity',
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  setup() {
    const store = useStore()
    
    // 使用计算属性访问 store 状态
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const user = computed(() => store.state.user)
    
    return { 
      store,
      isLoggedIn,
      user
    }
  },
  data() {
    return {
      friends: [],
      activeFriend: null,
      pendingRequests: [],
      allGalleries: [],
      gallerySearchQuery: '',
      conversationMessages: [],
      newMessage: '',
      showAddFriendModal: false,
      friendSearchQuery: '',
      searchResults: [],
      searchingUsers: false,
      searchTimeout: null,
      showNotifications: false,
      notifications: [],
      showFriendRequests: false,
      friendRequestResult: null,
      viewMode: 'grid',
      showShareModal: false,
      selectedGallery: null,
      selectedFriends: [],
      friendSearchFilter: '',
      shareMessage: '',
      friendIds: [],
      isLoadingGalleries: false,
      shareMethod: 'friend',
      isSharing: false,
      shareSuccessMessage: '',
      origin: '',
      permissionDenied: null
    }
  },
  computed: {
    filteredNotifications() {
      return this.notifications.filter(notif => {
        if (notif.type === 'friend_request') {
          const hasPendingRequest = this.pendingRequests.some(
            req => req.user_id === notif.related_id
          )
          return !hasPendingRequest || notif.read
        }
        return true
      })
    },
    displayedGalleries() {
      let galleries = [...this.allGalleries]

      if (this.gallerySearchQuery) {
        const query = this.gallerySearchQuery.toLowerCase()
        galleries = galleries.filter(g =>
          g.name.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query) ||
          g.username?.toLowerCase().includes(query)
        )
      }

      if (this.activeFriend) {
        galleries.forEach(gallery => {
          gallery.isFriendGallery = gallery.user_id === this.activeFriend.id
        })
      }

      galleries.sort((a, b) => {
        if (a.isFriendGallery && !b.isFriendGallery) return -1
        if (!a.isFriendGallery && b.isFriendGallery) return 1
        return new Date(b.created_at) - new Date(a.created_at)
      })

      return galleries
    },
    unreadNotificationCount() {
      return this.notifications.filter(n => !n.read).length
    },
    filteredShareFriends() {
      if (!this.friendSearchFilter) return this.friends
      const query = this.friendSearchFilter.toLowerCase()
      return this.friends.filter(friend =>
        friend.username.toLowerCase().includes(query) ||
        friend.email?.toLowerCase().includes(query)
      )
    },
    friendGalleryCount() {
      if (!this.activeFriend) return 0
      return this.allGalleries.filter(g => g.user_id === this.activeFriend.id).length
    },
    galleryShareUrl() {
      if (!this.selectedGallery || !this.origin) return ''
      return `${this.origin}/gallery/${this.selectedGallery.id}`
    }
  },
  async mounted() {
    if (typeof window !== 'undefined') {
      this.origin = window.location.origin
    }

    this.initBackground()
    if (this.id) {
      await this.handleSharedGallery(this.id)
    } else {
      await this.loadCommunityData()
    }
  },
  methods: {
    // 查看画廊详情
    async viewGalleryDetail(gallery) {
      if (!this.canViewGallery(gallery)) {
        this.showMessage('您没有权限查看此画廊', 'warning')
        return
      }

      // 使用路由跳转到画廊详情页面
      this.$router.push(`/gallery/${gallery.id}`)
    },

    // 显示分享画廊模态框
    showShareGalleryModal(gallery) {
      if (!gallery) return

      this.selectedGallery = gallery
      this.selectedFriends = []
      this.shareMessage = `我向你分享了我的画廊：${gallery.name}`
      this.shareMethod = 'friend'
      this.showShareModal = true

      // 如果有当前聊天好友，默认选中
      if (this.activeFriend && this.friendIds.includes(this.activeFriend.id)) {
        this.selectedFriends = [this.activeFriend.id]
      }

      console.log('打开分享模态框，画廊:', gallery.name)
    },

    // 分享画廊给好友
    async shareGalleryToFriends() {
      if (!this.selectedGallery || this.selectedFriends.length === 0) {
        this.showMessage('请至少选择一个好友', 'warning')
        return
      }

      this.isSharing = true

      try {
        const response = await messageSharesAPI.batchShareGallery({
          friend_ids: this.selectedFriends,
          gallery_id: this.selectedGallery.id,
          message: this.shareMessage
        })

        if (response.data.success) {
          this.shareSuccessMessage = `成功分享给 ${response.data.results.length} 位好友`
          this.showShareModal = false
          this.showMessage(this.shareSuccessMessage, 'success')

          // 如果是分享给当前聊天好友，在聊天窗口中显示分享消息
          if (this.activeFriend && this.selectedFriends.includes(this.activeFriend.id)) {
            await this.loadConversation(this.activeFriend.id)
          }
        } else {
          this.showMessage('分享失败: ' + response.data.error, 'error')
        }
      } catch (error) {
        console.error('分享画廊失败:', error)
        this.showMessage('分享失败，请重试: ' + error.message, 'error')
      } finally {
        this.isSharing = false
      }
    },

    // 复制画廊链接
    async copyGalleryLink() {
      if (!this.selectedGallery) return

      try {
        // 创建临时输入框
        const textArea = document.createElement('textarea')
        textArea.value = this.galleryShareUrl
        document.body.appendChild(textArea)
        textArea.select()

        // 执行复制
        const successful = document.execCommand('copy')

        // 清理
        document.body.removeChild(textArea)

        if (successful) {
          this.showMessage('画廊链接已复制到剪贴板！', 'success')
          this.showShareModal = false
        } else {
          // 如果 execCommand 失败，尝试使用 Clipboard API
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(this.galleryShareUrl)
            this.showMessage('画廊链接已复制到剪贴板！', 'success')
            this.showShareModal = false
          } else {
            this.showMessage('复制失败，请手动复制链接', 'error')
          }
        }
      } catch (err) {
        console.error('复制链接失败:', err)
        this.showMessage('复制失败，请手动复制链接', 'error')
      }
    },

    // 切换好友选择
    toggleFriendSelection(friendId) {
      const index = this.selectedFriends.indexOf(friendId)
      if (index === -1) {
        this.selectedFriends.push(friendId)
      } else {
        this.selectedFriends.splice(index, 1)
      }
    },

    // 过滤好友
    filterFriends() {
      // 搜索逻辑由 computed 属性 filteredShareFriends 处理
    },

    // 获取隐私文本
    getPrivacyText(privacy) {
      const privacyMap = {
        'public': '公开',
        'friends': '好友可见',
        'private': '私密'
      }
      return privacyMap[privacy] || '未知'
    },

    async handleSharedGallery(galleryId) {
      try {
        const response = await galleryAPI.getGalleryDetail(galleryId)

        if (response.success && response.gallery) {
          const gallery = response.gallery
          if (gallery._canView) {
            // 用户有权限查看，跳转到画廊详情页面
            this.$router.push(`/gallery/${galleryId}`)
          } else {
            // 用户没有权限，根据隐私设置显示不同提示
            if (gallery.privacy === 'friends') {
              this.permissionDenied = {
                icon: '😊',
                title: '好友专属画廊',
                message: `这是作者「${gallery.username}」的好友可见画廊。`,
                actionText: '添加好友以查看',
                action: () => {
                  this.showAddFriendModal = true
                  // 可以在添加好友模态框中预先填入搜索词
                  this.friendSearchQuery = gallery.username
                  this.debouncedSearchUsers()
                }
              }
            } else if (gallery.privacy === 'private') {
              this.permissionDenied = {
                icon: '😴',
                title: '私密画廊',
                message: '抱歉，这是作者的私密画廊，您没有权限查看。',
                actionText: '返回社区',
                action: () => this.$router.push('/community')
              }
            }
          }
        } else {
          // API返回错误或画廊不存在
          this.permissionDenied = {
            icon: '🖼️',
            title: '画廊不存在',
            message: '您访问的画廊可能已被删除或链接无效。',
            actionText: '返回社区',
            action: () => this.$router.push('/community')
          }
        }
      } catch (error) {
        console.error('处理分享画廊失败:', error)
        this.permissionDenied = {
          icon: '❌',
          title: '加载失败',
          message: '加载画廊时发生错误，请稍后再试。',
          actionText: '返回首页',
          action: () => this.$router.push('/')
        }
      }
    },

    // 查看分享的画廊
    async viewSharedGallery(message) {
      try {
        if (message.metadata) {
          const metadata = typeof message.metadata === 'string'
            ? JSON.parse(message.metadata)
            : message.metadata
          if (metadata.gallery_id) {
            await this.handleSharedGallery(metadata.gallery_id)
          }
        }
      } catch (error) {
        console.error('查看分享画廊失败:', error)
        this.showMessage('无法查看分享的画廊', 'error')
      }
    },

    // 处理画廊分享通知
    handleGalleryShareNotification(notification) {
      try {
        if (notification.metadata) {
          const metadata = typeof notification.metadata === 'string'
            ? JSON.parse(notification.metadata)
            : notification.metadata
          if (metadata.gallery_id) {
            this.handleSharedGallery(metadata.gallery_id)
            this.markNotificationAsRead(notification.id)
            this.showNotifications = false
          }
        }
      } catch (error) {
        console.error('处理画廊分享通知失败:', error)
      }
    },

    // 获取画廊分享信息
    getGalleryShareName(message) {
      try {
        if (message.metadata) {
          const metadata = typeof message.metadata === 'string'
            ? JSON.parse(message.metadata)
            : message.metadata
          return metadata.gallery_name || '未命名画廊'
        }
        return '画廊分享'
      } catch (error) {
        return '画廊分享'
      }
    },

    getGalleryShareAuthor(message) {
      try {
        if (message.metadata) {
          const metadata = typeof message.metadata === 'string'
            ? JSON.parse(message.metadata)
            : message.metadata
          return metadata.gallery_author || '未知作者'
        }
        return '未知作者'
      } catch (error) {
        return '未知作者'
      }
    },

    initBackground() {
      this.createStars('.starry-background', 100)
      this.createMeteors('.meteor-shower', 8)
    },

    createStars(selector, count) {
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
    },

    createMeteors(selector, count) {
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
    },

    // 权限检查
    canViewGallery(gallery) {
      if (!gallery) return false

      const userId = this.user?.id

      // 自己的画廊都可以看
      if (gallery.user_id === userId) return true

      // 公开画廊都可以看
      if (gallery.privacy === 'public') return true

      // 好友可见的画廊，检查是否是好友
      if (gallery.privacy === 'friends') {
        return this.isFriend(gallery.user_id)
      }

      // 私密画廊不能看
      return false
    },

    canInteractWithGallery(gallery) {
      if (!this.canViewGallery(gallery)) return false

      // 检查是否被拉黑等（这里可以根据需要扩展）
      return true
    },

    isFriend(userId) {
      return this.friendIds.includes(userId)
    },

    // 画廊点击处理
    handleGalleryClick(gallery) {
      if (!this.canViewGallery(gallery)) {
        this.showMessage('您没有权限查看此画廊', 'warning')
        return
      }
      this.viewGalleryDetail(gallery)
    },

    // 切换视图模式
    toggleViewMode(mode) {
      this.viewMode = mode
    },

    handleFriendRequestInPanel(notification) {
      const request = this.pendingRequests.find(
        req => req.user_id === notification.related_id
      )

      if (request) {
        if (confirm(`是否接受 ${request.username} 的好友请求？`)) {
          this.acceptFriendRequest(request.user_id)
        } else {
          this.rejectFriendRequest(request.user_id)
        }
      } else {
        this.showFriendRequests = true
        this.showNotifications = false
      }
      this.markNotificationAsRead(notification.id)
    },

    async loadCommunityData() {
      try {
        await Promise.all([
          this.loadFriends(),
          this.loadFriendRequests(),
          this.loadNotifications(),
          this.loadAllGalleries()
        ])
      } catch (error) {
        console.error('加载社区数据失败:', error)
        this.showMessage('加载社区数据失败', 'warning')
      }
    },

    async loadFriends() {
      try {
        // 使用 Vuex actions 获取好友列表
        const friends = await this.store.dispatch('fetchFriends')
        this.friends = friends || []
        this.friendIds = this.friends.map(friend => friend.id)
        console.log(`加载好友完成: ${this.friends.length} 位好友`)
      } catch (error) {
        console.error('加载好友列表失败:', error)
        this.friends = []
        this.friendIds = []
      }
    },

    async loadFriendRequests() {
      try {
        // 使用 Vuex actions 获取好友请求
        const requests = await this.store.dispatch('fetchFriendRequests')
        this.pendingRequests = (requests || []).filter(r =>
          r.status === 'pending' || !r.status
        )
        console.log(`加载好友请求完成: ${this.pendingRequests.length} 个待处理`)
      } catch (error) {
        console.error('加载好友请求失败:', error)
        this.pendingRequests = []
      }
    },

    async loadNotifications() {
      try {
        // 使用 Vuex actions 获取通知
        const notifications = await this.store.dispatch('fetchNotifications')
        this.notifications = notifications || []
      } catch (error) {
        console.error('加载通知失败:', error)
        this.notifications = []
      }
    },

    // 加载所有画廊（包括公共和好友可见的）
    async loadAllGalleries() {
      if (this.isLoadingGalleries) return

      this.isLoadingGalleries = true
      try {
        console.log('开始加载所有画廊...')

        // 先尝试获取所有可访问的画廊
        const response = await this.getAllGalleries()

        if (response.success) {
          this.allGalleries = response.galleries || []
          console.log(`✅ 加载所有画廊成功: ${this.allGalleries.length} 个`)
        } else {
          console.error('获取所有画廊失败:', response.error)
          this.allGalleries = []
        }
      } catch (error) {
        console.error('加载所有画廊失败:', error)
        this.allGalleries = []
      } finally {
        this.isLoadingGalleries = false
      }
    },

    // 获取所有可访问的画廊
    async getAllGalleries() {
      try {
        const response = await galleryAPI.getAllGalleries()
        return response.data || response
      } catch (error) {
        console.error('获取所有画廊失败:', error)
        return { success: false, error: error.message }
      }
    },

    async searchUsers() {
      if (!this.friendSearchQuery.trim()) {
        this.searchResults = []
        return
      }

      try {
        this.searchingUsers = true
        // 使用 Vuex actions 搜索用户
        const users = await this.store.dispatch('searchUsers', this.friendSearchQuery.trim())
        this.searchResults = users || []
      } catch (error) {
        console.error('搜索用户失败:', error)
        this.searchResults = []
        this.showMessage('搜索用户失败', 'error')
      } finally {
        this.searchingUsers = false
      }
    },

    debouncedSearchUsers() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.searchTimeout = setTimeout(() => {
        this.searchUsers()
      }, 300)
    },

    async selectFriend(friend) {
      console.log('👥 选择好友:', friend)
      this.activeFriend = friend

      // 加载对话
      await this.loadConversation(friend.id)

      console.log(`✅ 选择了好友 ${friend.username}`)
    },

    closeFriendFilter() {
      this.activeFriend = null
      console.log('✅ 清除了好友筛选')
    },

    async sendMessage() {
      if (!this.newMessage.trim() || !this.activeFriend) {
        console.log('消息为空或没有选中好友')
        return
      }

      console.log('发送消息给:', this.activeFriend.username)

      try {
        const response = await messageAPI.sendMessage({
          receiver_id: this.activeFriend.id,
          content: this.newMessage.trim(),
          type: 'text'
        })

        if (response.success && response.message) {
          const message = response.message
          console.log('✅ 消息发送成功:', message)
          this.conversationMessages.unshift(message)
          this.newMessage = ''
          this.$nextTick(() => {
            this.scrollToBottom('chatMessages')
          })
          this.showMessage('消息发送成功', 'success')
        } else {
          console.error('消息发送失败:', response.error)
          this.showMessage(`发送失败: ${response.error}`, 'error')
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        const tempMessage = {
          id: Date.now(),
          sender_id: this.user?.id,
          receiver_id: this.activeFriend.id,
          content: this.newMessage,
          created_at: new Date().toISOString(),
          sender_name: this.user?.username
        }
        this.conversationMessages.unshift(tempMessage)
        this.newMessage = ''
        this.showMessage('消息已发送（本地模拟）', 'info')
        this.$nextTick(() => {
          this.scrollToBottom('chatMessages')
        })
      }
    },

    async loadConversation(friendId) {
      try {
        console.log(`加载与用户 ${friendId} 的对话`)
        const response = await messageAPI.getConversation(friendId)

        if (response.success) {
          this.conversationMessages = response.messages || []
          console.log(`✅ 加载到 ${this.conversationMessages.length} 条消息`)
        } else {
          console.error('获取对话失败:', response.error)
          this.conversationMessages = []
        }
      } catch (error) {
        console.error('加载对话失败:', error)
        this.conversationMessages = []
      }
    },

    closeChat() {
      this.activeFriend = null
      this.conversationMessages = []
    },

    async sendFriendRequest(user) {
      console.log('🎯 === 开始发送好友请求 ===')
      console.log('目标用户:', user)

      try {
        this.friendRequestResult = null
        // 使用 Vuex actions 发送好友请求
        await this.store.dispatch('sendFriendRequest', user.id)
        console.log('✅ store调用成功')
        const userIndex = this.searchResults.findIndex(u => u.id === user.id)
        if (userIndex !== -1) {
          this.searchResults[userIndex].friend_status = 'request_sent'
        }
        await this.loadFriendRequests()
        this.friendRequestResult = {
          type: 'success',
          message: `已向 ${user.username} 发送好友请求`
        }
        this.showMessage(`已向 ${user.username} 发送好友请求`, 'success')
        setTimeout(() => {
          this.friendRequestResult = null
        }, 3000)
      } catch (storeError) {
        console.error('❌ store调用失败:', storeError)
        this.friendRequestResult = {
          type: 'error',
          message: storeError.response?.data?.error || '发送好友请求失败'
        }
        this.showMessage(`发送失败: ${storeError.response?.data?.error || storeError.message}`, 'error')
        setTimeout(() => {
          this.friendRequestResult = null
        }, 3000)
      }
    },

    async acceptFriendRequest(userId) {
      try {
        // 使用 Vuex actions 接受好友请求
        await this.store.dispatch('acceptFriendRequest', userId)
        this.showMessage('好友请求已接受', 'success')
        this.pendingRequests = this.pendingRequests.filter(r => r.user_id !== userId)
        await this.loadFriends()
        await this.loadAllGalleries()  // 重新加载画廊，因为权限可能已变化
        if (this.pendingRequests.length === 0) {
          this.showFriendRequests = false
        }
      } catch (error) {
        console.error('接受好友请求失败:', error)
        this.showMessage('接受好友请求失败', 'error')
      }
    },

    async rejectFriendRequest(userId) {
      try {
        // 使用 Vuex actions 拒绝好友请求
        await this.store.dispatch('rejectFriendRequest', userId)
        this.showMessage('好友请求已拒绝', 'success')
        this.pendingRequests = this.pendingRequests.filter(r => r.user_id !== userId)
        if (this.pendingRequests.length === 0) {
          this.showFriendRequests = false
        }
      } catch (error) {
        console.error('拒绝好友请求失败:', error)
        this.showMessage('拒绝好友请求失败', 'error')
      }
    },

    async toggleLikeGallery(gallery) {
      if (!this.canInteractWithGallery(gallery)) {
        this.showMessage('您没有权限点赞此画廊', 'warning')
        return
      }

      try {
        await galleryAPI.toggleGalleryLike(gallery.id)
        gallery.is_liked = !gallery.is_liked
        gallery.likes_count = gallery.is_liked ?
          (gallery.likes_count || 0) + 1 :
          Math.max(0, (gallery.likes_count || 0) - 1)
        this.showMessage(gallery.is_liked ? '已点赞' : '已取消点赞', 'success')
      } catch (error) {
        console.error('点赞操作失败:', error)
        this.showMessage('点赞操作失败', 'error')
      }
    },

    getGalleryPreviewItems(gallery) {
      return (gallery.artworks || []).slice(0, 3)
    },

    getArtworkImageUrl(item) {
      if (!item) return '/images/default-artwork.jpg'
      if (item.artwork?.image_url) return item.artwork.image_url
      if (item.image_url) return item.image_url
      return '/images/default-artwork.jpg'
    },

    getUserAvatar(avatarPath) {
      if (!avatarPath) {
        return `https://ui-avatars.com/api/?name=User&size=200&background=3B82F6&color=ffffff&bold=true`
      }
      if (avatarPath.startsWith('http')) return avatarPath
      return avatarPath
    },

    getGalleryTheme(theme) {
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
    },

    getThemeIcon(theme) {
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
    },

    getThemeName(theme) {
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
    },

    getPrivacyIcon(privacy) {
      const icons = {
        public: '🌍',
        friends: '😊',
        private: '😴'
      }
      return icons[privacy] || '❓'
    },

    getArtworkColor(style) {
      const colors = {
        classical: '#a29bfe',
        modern: '#ff6b6b',
        abstract: '#55efc4',
        impressionism: '#fd79a8',
        surrealism: '#ffeaa7'
      }
      return colors[style] || '#6c5ce7'
    },

    formatTime(dateString) {
      if (!dateString) return '未知时间'
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
      return date.toLocaleDateString('zh-CN')
    },

    starStyle(index) {
      return {
        position: 'absolute',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 0.6 + 0.4}rem`,
        opacity: Math.random() * 0.5 + 0.3,
        animationDelay: `${Math.random() * 2}s`
      }
    },

    goBack() {
      this.$router.push('/personal-gallery')
    },

    toggleNotifications() {
      this.showNotifications = !this.showNotifications
    },

    handleNotificationClick(notification) {
      if (notification.type === 'friend_request') {
        this.showFriendRequests = true
        this.showNotifications = false
      } else if (notification.type === 'gallery_shared') {
        this.handleGalleryShareNotification(notification)
      }
      this.markNotificationAsRead(notification.id)
    },

    async markNotificationAsRead(notificationId) {
      try {
        await notificationAPI.markAsRead(notificationId)
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read = true
        }
      } catch (error) {
        console.error('标记通知为已读失败:', error)
      }
    },

    async markAllNotificationsAsRead() {
      try {
        await notificationAPI.markAllAsRead()
        this.notifications.forEach(n => n.read = true)
        this.showMessage('所有通知已标记为已读', 'success')
      } catch (error) {
        console.error('标记所有通知为已读失败:', error)
      }
    },

    scrollToBottom(refName) {
      const element = this.$refs[refName]
      if (element) {
        element.scrollTop = element.scrollHeight
      }
    },

    showMessage(message, type = 'success') {
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
    },

    searchGalleries() {
      // 搜索逻辑已在上面的 computed 中处理
    }
  }
}
</script>
<style scoped>
/* 添加缺失的样式 */
.spinner-small {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 确保分享模态框的样式正确 */
.share-gallery-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.share-gallery-modal .modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}

.share-gallery-modal .modal-content {
  position: relative;
  z-index: 1001;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  width: 90%;
}

/* 确保复选框可见 */
.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
}

.checkbox.checked {
  background: var(--cosmic-purple);
  border-color: var(--cosmic-purple);
  color: white;
}

/* 确保输入框样式正确 */
.link-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  padding: 12px 15px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
}

.copy-link-btn {
  white-space: nowrap;
  padding: 12px 20px;
}
</style>
