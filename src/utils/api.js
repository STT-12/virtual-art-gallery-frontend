// api.js - 安全扩展版
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:3001/api'

// 基础配置
const baseConfig = {
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// 创建实例
const apiWithoutAuth = axios.create(baseConfig);
const apiWithAuth = axios.create(baseConfig);

// 请求拦截器
apiWithAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API请求 - Token:', token ? '存在' : '不存在');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('设置Authorization头:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
const handleResponse = (response) => {
  console.log('API响应成功:', response.config.url);
  return response.data;
};

const handleError = (error) => {
  console.error('API错误:', error.config?.url, error.response?.status, error.message);

  if (error.response?.status === 401) {
    console.log('认证过期，清除本地数据');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return Promise.reject(error);
};

apiWithoutAuth.interceptors.response.use(handleResponse, handleError);
apiWithAuth.interceptors.response.use(handleResponse, handleError);

// 导出原有API（保持不变）

export const authAPI = {
  register: (data) => apiWithoutAuth.post('/auth/register', data),
  login: (data) => apiWithoutAuth.post('/auth/login', data),
  validateToken: () => apiWithAuth.get('/auth/validate')
};

export const artworkAPI = {
  getAll: () => apiWithAuth.get('/artworks'),
  getDetail: (id) => apiWithAuth.get(`/artworks/${id}`),
  getStats: (id) => apiWithAuth.get(`/artworks/${id}/stats`),
  toggleLike: (artworkId) => apiWithAuth.post(`/likes/artwork/${artworkId}`),
  getMyLikes: () => apiWithAuth.get('/likes/my')
};

export const commentAPI = {
  create: (data) => apiWithAuth.post('/comments', data),
  getByArtwork: (artworkId) => apiWithAuth.get(`/comments/artwork/${artworkId}`),
  delete: (commentId) => apiWithAuth.delete(`/comments/${commentId}`)
};

// 新增的社区API
export const galleryAPI = {
  // 获取个人画廊
  getMyGalleries: () => apiWithAuth.get('/galleries/my'),

  // 创建画廊
  createGallery: (data) => apiWithAuth.post('/galleries', data),

  // 更新画廊
  updateGallery: (id, data) => apiWithAuth.put(`/galleries/${id}`, data),

  // 删除画廊
  deleteGallery: (id) => apiWithAuth.delete(`/galleries/${id}`),

  // 获取画廊详情
  getGalleryDetail: (id) => apiWithAuth.get(`/galleries/${id}`),

  // 点赞/取消点赞画廊
  toggleGalleryLike: (galleryId) => apiWithAuth.post(`/galleries/${galleryId}/like`),

  // 添加画廊评论
  addGalleryComment: (galleryId, data) => apiWithAuth.post(`/galleries/${galleryId}/comments`, data),

  // 获取画廊评论
  getGalleryComments: (galleryId) => apiWithAuth.get(`/galleries/${galleryId}/comments`),

  // 获取好友画廊
  getFriendGalleries: () => apiWithAuth.get('/galleries/friends/galleries'),

  // 搜索画廊
  searchGalleries: (query) => apiWithAuth.get(`/galleries/search?query=${encodeURIComponent(query)}`),
  getAllGalleries: () => apiWithAuth.get('/galleries/all'),

  // 获取画廊评论
  getGalleryComments: (galleryId) => apiWithAuth.get(`/galleries/${galleryId}/comments`),

  // 添加画廊评论
  addGalleryComment: (galleryId, data) => apiWithAuth.post(`/galleries/${galleryId}/comments`, data)
};

export const friendAPI = {
  // 获取好友列表
  getFriends: () => apiWithAuth.get('/friends'),

  // 获取好友请求
  getFriendRequests: () => apiWithAuth.get('/friends/requests'),

  // 获取已发送的请求
  getSentRequests: () => apiWithAuth.get('/friends/sent-requests'),

  // 发送好友请求
  sendFriendRequest: (userId) => apiWithAuth.post(`/friends/${userId}/request`),

  // 接受好友请求
  acceptFriendRequest: (userId) => apiWithAuth.post(`/friends/${userId}/accept`),

  // 拒绝好友请求
  rejectFriendRequest: (userId) => apiWithAuth.post(`/friends/${userId}/reject`),

  // 删除好友
  removeFriend: (userId) => apiWithAuth.delete(`/friends/${userId}`),

  // 搜索用户
  searchUsers: (query) => apiWithAuth.get(`/friends/search?query=${encodeURIComponent(query)}`),

  // 检查好友状态
  checkFriendStatus: (userId) => apiWithAuth.get(`/friends/${userId}/status`)
};

export const messageAPI = {
  // 发送消息
  sendMessage: (data) => apiWithAuth.post('/messages', data),

  // 获取对话消息
  getConversation: (userId, params) => apiWithAuth.get(`/messages/conversation/${userId}`, { params }),

  // 获取消息列表
  getMessageList: () => apiWithAuth.get('/messages/list'),

  // 获取未读消息数
  getUnreadCount: () => apiWithAuth.get('/messages/unread-count'),

  // 删除消息
  deleteMessage: (messageId) => apiWithAuth.delete(`/messages/${messageId}`),

  // 标记消息为已读
  markAsRead: (data) => apiWithAuth.post('/messages/mark-read', data)

};

export const notificationAPI = {
  // 获取通知
  getNotifications: (params) => apiWithAuth.get('/notifications', { params }),

  // 获取未读通知数
  getUnreadCount: () => apiWithAuth.get('/notifications/unread-count'),

  // 标记通知为已读
  markAsRead: (notificationId) => apiWithAuth.post(`/notifications/${notificationId}/read`),

  // 标记所有为已读
  markAllAsRead: () => apiWithAuth.post('/notifications/read-all'),

  // 删除通知
  deleteNotification: (notificationId) => apiWithAuth.delete(`/notifications/${notificationId}`)
};
export const galleryCommunityAPI = {
  // 获取好友画廊
  getFriendGalleries: () => apiWithAuth.get('/galleries/friends/galleries'),

  // 获取用户画廊
  getUserGalleries: (userId) => apiWithAuth.get(`/galleries/user/${userId}`)
};
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
  return {
    'Content-Type': 'application/json'
  }
}

// 画廊分享相关 API
export const messageSharesAPI = {
  // 分享画廊给好友
  async shareGallery(data) {
    return await axios.post('/message-shares/share-gallery', data, {
      headers: getAuthHeader()
    })
  },

  // 批量分享画廊给多个好友
  async batchShareGallery(data) {
    return await axios.post('/message-shares/share-gallery/batch', data, {
      headers: getAuthHeader()
    })
  },

  // 获取分享的画廊消息
  async getSharedGalleries(params = {}) {
    return await axios.get('/message-shares/shared-galleries', {
      params,
      headers: getAuthHeader()
    })
  }
}

// 导出实例
export { apiWithoutAuth, apiWithAuth };
export default apiWithAuth;
