
import { createStore } from 'vuex'
import axios from 'axios'
import {
  artworkAPI,
  commentAPI,
  galleryAPI,
  friendAPI,
  messageAPI,
  notificationAPI
} from '../utils/api'

export default createStore({
  state: {
    // ========== 用户状态 ==========
    user: JSON.parse(localStorage.getItem('user')) || null,
    isLoggedIn: !!localStorage.getItem('user'),
    personalGalleries: JSON.parse(localStorage.getItem('galleries')) || [],

    // ========== 画廊社区状态 ==========
    friends: JSON.parse(localStorage.getItem('friends')) || [],
    friendRequests: JSON.parse(localStorage.getItem('friendRequests')) || [],
    sentRequests: JSON.parse(localStorage.getItem('sentRequests')) || [],
    communityGalleries: JSON.parse(localStorage.getItem('communityGalleries')) || [],
    messages: JSON.parse(localStorage.getItem('messages')) || [],
    notifications: JSON.parse(localStorage.getItem('notifications')) || [],

    // ========== 艺术作品数据（完全保持原样） ==========
    artworks: [
      // 中国古典画作
      {
        id: 1,
        title: '千里江山图',
        artist: '王希孟',
        year: 1113,
        style: 'classical',
        description: '北宋青绿山水画的代表作，描绘了壮丽的江山景色',
        story: '《千里江山图》是北宋画家王希孟的传世之作...',
        likes: 289,
        audio: '/audio/1.mp3',
        comments: [
          { id: 1, user: '艺术史学者', text: '青绿山水的巅峰之作！', time: '2024-01-15', user_id: 1, username: '艺术史学者' },
          { id: 2, user: '国画爱好者', text: '每次欣赏都有新的感受', time: '2024-01-16', user_id: 2, username: '国画爱好者' }
        ],
        position: { x: 100, y: 100, width: 180, height: 220 },
        width: 1200,
        height: 800
      },
      {
        id: 2,
        title: '清明上河图',
        artist: '张择端',
        year: 1085,
        style: 'classical',
        description: '描绘北宋都城汴京城市生活的风俗画',
        story: '这幅长卷生动记录了北宋都城汴京的城市面貌...',
        likes: 356,
        audio: '/audio/1.mp3',
        comments: [
          { id: 1, user: '历史研究者', text: '宋代城市生活的真实写照', time: '2024-01-14', user_id: 3, username: '历史研究者' }
        ],
        position: { x: 350, y: 120, width: 200, height: 150 },
        width: 1600,
        height: 900
      },
      {
        id: 3,
        title: '富春山居图',
        artist: '黄公望',
        year: 1350,
        style: 'classical',
        description: '元代山水画的经典之作',
        story: '这幅画描绘了富春江两岸的初秋景色...',
        likes: 234,
        audio: '/audio/1.mp3',
        comments: [],
        position: { x: 600, y: 90, width: 190, height: 200 },
        width: 1100,
        height: 750
      },
      {
        id: 4,
        title: '蒙娜丽莎',
        artist: '列奥纳多·达·芬奇',
        year: 1503,
        style: 'classical',
        description: '文艺复兴时期的杰作',
        story: '《蒙娜丽莎》是达芬奇最著名的作品...',
        likes: 1567,
        audio: '/audio/1.mp3',
        comments: [
          { id: 1, user: '艺术爱好者', text: '永恒的经典！', time: '2024-01-14', user_id: 4, username: '艺术爱好者' },
          { id: 2, user: '历史迷', text: '每次看都有新的发现', time: '2024-01-15', user_id: 5, username: '历史迷' }
        ],
        position: { x: 850, y: 100, width: 160, height: 240 },
        width: 1000,
        height: 1200
      },
      {
        id: 5,
        title: '夜巡',
        artist: '伦勃朗·梵·莱茵',
        year: 1642,
        style: 'classical',
        description: '荷兰黄金时代的杰作',
        story: '《夜巡》是伦勃朗最著名的作品...',
        likes: 867,
        audio: '/audio/3.mp3',
        comments: [],
        position: { x: 1050, y: 80, width: 220, height: 180 },
        width: 1400,
        height: 900
      },
      {
        id: 6,
        title: '雅典学院',
        artist: '拉斐尔·桑西',
        year: 1511,
        style: 'classical',
        description: '文艺复兴盛期的壁画杰作',
        story: '这幅壁画描绘了古希腊哲学家...',
        likes: 923,
        audio: '/audio/3.mp3',
        comments: [
          { id: 1, user: '哲学爱好者', text: '人文主义的完美体现', time: '2024-01-13', user_id: 6, username: '哲学爱好者' }
        ],
        position: { x: 1300, y: 110, width: 200, height: 160 },
        width: 1800,
        height: 1000
      },
      {
        id: 7,
        title: '星月夜',
        artist: '文森特·梵高',
        year: 1889,
        style: 'modern',
        description: '后印象派的代表作',
        story: '《星空》是梵高在圣雷米疗养院期间创作的...',
        likes: 2042,
        audio: '/audio/3.mp3',
        comments: [
          { id: 1, user: '艺术学生', text: '色彩运用太独特了！', time: '2024-01-15', user_id: 7, username: '艺术学生' },
          { id: 2, user: '梵高迷', text: '能感受到艺术家的情感', time: '2024-01-16', user_id: 8, username: '梵高迷' }
        ],
        position: { x: 100, y: 350, width: 180, height: 150 },
        width: 900,
        height: 1200
      },
      {
        id: 8,
        title: '呐喊',
        artist: '爱德华·蒙克',
        year: 1893,
        style: 'modern',
        description: '表现主义的经典作品',
        story: '这幅画是蒙克《生命的饰带》系列中最著名的作品...',
        likes: 1789,
        audio: '/audio/1.mp3',
        comments: [
          { id: 1, user: '心理学学生', text: '完美表现了现代人的焦虑', time: '2024-01-14', user_id: 9, username: '心理学学生' }
        ],
        position: { x: 350, y: 320, width: 150, height: 200 },
        width: 800,
        height: 1300
      },
      {
        id: 9,
        title: '格尔尼卡',
        artist: '巴勃罗·毕加索',
        year: 1937,
        style: 'modern',
        description: '立体主义杰作',
        story: '这幅画是毕加索为抗议纳粹德国...',
        likes: 1567,
        audio: '/audio/1.mp3',
        comments: [],
        position: { x: 580, y: 350, width: 220, height: 120 },
        width: 1700,
        height: 800
      },
      {
        id: 10,
        title: '记忆的永恒',
        artist: '萨尔瓦多·达利',
        year: 1931,
        style: 'modern',
        description: '超现实主义代表作',
        story: '这幅画是达利最著名的作品...',
        likes: 1345,
        audio: '/audio/2.mp3',
        comments: [
          { id: 1, user: '超现实爱好者', text: '时间的另一种理解方式', time: '2024-01-13', user_id: 10, username: '超现实爱好者' }
        ],
        position: { x: 850, y: 380, width: 170, height: 140 },
        width: 1100,
        height: 900
      },
      {
        id: 11,
        title: '构图VIII',
        artist: '瓦西里·康定斯基',
        year: 1923,
        style: 'abstract',
        description: '抽象艺术的代表作',
        story: '康定斯基是抽象艺术的先驱...',
        likes: 978,
        audio: '/audio/2.mp3',
        comments: [],
        position: { x: 1070, y: 320, width: 160, height: 180 },
        width: 1200,
        height: 1000
      },
      {
        id: 12,
        title: '红黄蓝的构成',
        artist: '皮特·蒙德里安',
        year: 1930,
        style: 'abstract',
        description: '新造型主义的代表作',
        story: '蒙德里安通过这幅作品表达了他对宇宙和谐的理解...',
        likes: 876,
        audio: '/audio/2.mp3',
        comments: [],
        position: { x: 1270, y: 350, width: 140, height: 140 },
        width: 900,
        height: 900
      },
      {
        id: 13,
        title: '女人I',
        artist: '威廉·德·库宁',
        year: 1952,
        style: 'abstract',
        description: '抽象表现主义的代表作',
        story: '这幅画是德·库宁"女人"系列中的第一幅...',
        likes: 765,
        audio: '/audio/2.mp3',
        comments: [
          { id: 1, user: '现代艺术研究者', text: '抽象表现主义的力作', time: '2024-01-12', user_id: 11, username: '现代艺术研究者' }
        ],
        position: { x: 1450, y: 320, width: 180, height: 160 },
        width: 1300,
        height: 1100
      },
      {
        id: 14,
        title: '薰衣草之雾',
        artist: '杰克逊·波洛克',
        year: 1950,
        style: 'abstract',
        description: '滴画技法的代表作',
        story: '波洛克通过滴洒颜料的方式创作...',
        likes: 892,
        audio: '/audio/2.mp3',
        comments: [],
        position: { x: 1650, y: 350, width: 160, height: 150 },
        width: 1400,
        height: 950
      },
      {
        id: 15,
        title: '洛神赋图',
        artist: '顾恺之',
        year: 344,
        style: 'classical',
        description: '东晋人物画的经典之作',
        story: '这幅画取材于曹植的《洛神赋》...',
        likes: 567,
        audio: '/audio/3.mp3',
        comments: [
          { id: 1, user: '国画研究者', text: '人物画的早期典范', time: '2024-01-11', user_id: 12, username: '国画研究者' }
        ],
        position: { x: 100, y: 550, width: 170, height: 200 },
        width: 1000,
        height: 1400
      },
      {
        id: 16,
        title: '韩熙载夜宴图',
        artist: '顾闳中',
        year: 970,
        style: 'classical',
        description: '五代时期人物画的杰作',
        story: '这幅长卷描绘了南唐官员韩熙载家中夜宴的场景...',
        likes: 478,
        audio: '/audio/3.mp3',
        comments: [],
        position: { x: 330, y: 570, width: 190, height: 160 },
        width: 1500,
        height: 850
      },
      {
        id: 17,
        title: '维纳斯的诞生',
        artist: '桑德罗·波提切利',
        year: 1485,
        style: 'classical',
        description: '文艺复兴时期神话题材的杰作，优雅的线条与梦幻色彩',
        story: '描绘爱与美之神维纳斯从海中贝壳诞生的神话场景，象征爱与美的诞生',
        likes: 245,
        audio: '/audio/1.mp3',
        comments: [],
        position: { x: 1850, y: 100, width: 180, height: 240 },
        width: 1200,
        height: 1600
      },
      {
        id: 18,
        title: '戴珍珠耳环的少女',
        artist: '约翰内斯·维米尔',
        year: 1665,
        style: 'classical',
        description: '北方的蒙娜丽莎，神秘的回眸永恒经典',
        story: '维米尔最著名的肖像画，少女回眸瞬间的惊鸿一瞥，珍珠耳环散发柔和光芒',
        likes: 312,
        audio: '/audio/1.mp3',
        comments: [
          { id: 1, user: '光影大师', text: '珍珠的光泽处理得太绝了！', time: '2024-01-17', user_id: 13, username: '光影大师' }
        ],
        position: { x: 2050, y: 120, width: 160, height: 200 },
        width: 800,
        height: 1100
      },
      {
        id: 19,
        title: '向日葵',
        artist: '文森特·梵高',
        year: 1888,
        style: 'modern',
        description: '绚烂的黄色交响曲，充满生命力的温暖色彩',
        story: '梵高为迎接高更而创作的系列作品，表达对生命的热爱与希望',
        likes: 1890,
        audio: '/audio/2.mp3',
        comments: [
          { id: 1, user: '色彩爱好者', text: '这黄色太治愈了！', time: '2024-01-18', user_id: 14, username: '色彩爱好者' },
          { id: 2, user: '艺术疗愈师', text: '每次看都有阳光照进心里的感觉', time: '2024-01-19', user_id: 15, username: '艺术疗愈师' }
        ],
        position: { x: 1850, y: 380, width: 200, height: 180 },
        width: 1000,
        height: 1200
      },
      {
        id: 20,
        title: '睡莲系列',
        artist: '克劳德·莫奈',
        year: 1916,
        style: 'modern',
        description: '印象派的巅峰之作，光影与色彩的绝美融合',
        story: '莫奈晚年创作的系列作品，描绘自家花园中的睡莲池塘，展现不同时间光影的变化',
        likes: 1567,
        audio: '/audio/2.mp3',
        comments: [],
        position: { x: 2070, y: 350, width: 220, height: 160 },
        width: 2000,
        height: 1200
      },
      {
        id: 21,
        title: '创造亚当',
        artist: '米开朗基罗',
        year: 1512,
        style: 'classical',
        description: '上帝与亚当指尖触碰的永恒瞬间',
        story: '西斯廷教堂天顶画的核心部分，人类诞生的神圣时刻',
        likes: 1345,
        audio: '/audio/3.mp3',
        comments: [],
        position: { x: 2050, y: 580, width: 190, height: 190 },
        width: 1100,
        height: 1300
      },
      {
        id: 22,
        title: '自由引导人民',
        artist: '欧仁·德拉克罗瓦',
        year: 1830,
        style: 'classical',
        description: '浪漫主义的革命史诗，三色旗飘扬的激情',
        story: '描绘1830年法国七月革命，自由女神高举三色旗引领人民前进',
        likes: 1289,
        audio: '/audio/3.mp3',
        comments: [
          { id: 1, user: '革命浪漫者', text: '革命与艺术的完美结合！', time: '2024-01-16', user_id: 16, username: '革命浪漫者' }
        ],
        position: { x: 1850, y: 600, width: 240, height: 150 },
        width: 1800,
        height: 1100
      },
      {
        id: 23,
        title: '吻',
        artist: '古斯塔夫·克里姆特',
        year: 1908,
        style: 'modern',
        description: '金色辉煌的装饰艺术，爱情与美的奢华象征',
        story: '维也纳分离派代表作，大量使用金箔和马赛克镶嵌，奢华而神秘',
        likes: 1789,
        audio: '/audio/1.mp3',
        comments: [
          { id: 1, user: '金色收藏家', text: '这金色太华丽了！', time: '2024-01-20', user_id: 17, username: '金色收藏家' },
          { id: 2, user: '装饰艺术家', text: '图案设计太精美了', time: '2024-01-21', user_id: 18, username: '装饰艺术家' }
        ],
        position: { x: 1850, y: 850, width: 200, height: 220 },
        width: 1200,
        height: 1600
      },
      {
        id: 24,
        title: '舞蹈',
        artist: '亨利·马蒂斯',
        year: 1910,
        style: 'modern',
        description: '野兽派的色彩狂欢，原始而奔放的生命之舞',
        story: '五个舞者手拉手围成圈，以简约形式和强烈色彩表现舞蹈的原始韵律',
        likes: 1456,
        audio: '/audio/1.mp3',
        comments: [],
        position: { x: 2070, y: 830, width: 180, height: 200 },
        width: 1300,
        height: 1100
      },
      {
        id: 25,
        title: '大碗岛的星期天下午',
        artist: '乔治·修拉',
        year: 1886,
        style: 'modern',
        description: '点彩画法的科学杰作，光影斑驳的悠闲午后',
        story: '使用科学的分色技巧，成千上万的小点创造视觉混合效果',
        likes: 1234,
        audio: '/audio/2.mp3',
        comments: [
          { id: 1, user: '科学艺术迷', text: '近看是点，远看是光！', time: '2024-01-22', user_id: 19, username: '科学艺术迷' }
        ],
        position: { x: 1850, y: 1100, width: 220, height: 170 },
        width: 1600,
        height: 1000
      },
      {
        id: 26,
        title: '亚威农少女',
        artist: '巴勃罗·毕加索',
        year: 1907,
        style: 'modern',
        description: '立体主义的开山之作，打破传统的视觉革命',
        story: '标志现代艺术的开端，打破传统透视法则，多角度同时呈现',
        likes: 1567,
        audio: '/audio/2.mp3',
        comments: [],
        position: { x: 2090, y: 1080, width: 190, height: 190 },
        width: 1400,
        height: 1200
      },
      {
        id: 27,
        title: '神奈川冲浪里',
        artist: '葛饰北斋',
        year: 1831,
        style: 'modern',
        description: '浮世绘的巅峰之作，巨浪与富士山的震撼对比',
        story: '日本浮世绘代表作，蓝色巨浪与远处富士山的强烈对比，展现自然力量',
        likes: 1678,
        audio: '/audio/3.mp3',
        comments: [
          { id: 1, user: '日本艺术迷', text: '这波浪太有力量感了！', time: '2024-01-23', user_id: 20, username: '日本艺术迷' }
        ],
        position: { x: 1850, y: 1350, width: 170, height: 210 },
        width: 1100,
        height: 1400
      },
      {
        id: 28,
        title: '金鱼',
        artist: '亨利·马蒂斯',
        year: 1912,
        style: 'modern',
        description: '野兽派的色彩魔法，游动的光影诗篇',
        story: '以鲜明色彩和简约形式表现金鱼在鱼缸中的生动形态',
        likes: 987,
        audio: '/audio/3.mp3',
        comments: [],
        position: { x: 2040, y: 1330, width: 200, height: 180 },
        width: 1200,
        height: 1000
      },
      {
        id: 29,
        title: '白上白',
        artist: '卡济米尔·马列维奇',
        year: 1918,
        style: 'abstract',
        description: '至上主义的纯粹表达，白色方块的微妙变化',
        story: '马列维奇的极简抽象作品，探索白色方块的微妙层次与光影',
        likes: 876,
        audio: '/audio/1.mp3',
        comments: [],
        position: { x: 1850, y: 1600, width: 180, height: 180 },
        width: 900,
        height: 900
      },
      {
        id: 30,
        title: 'Number 5',
        artist: '杰克逊·波洛克',
        year: 1948,
        style: 'abstract',
        description: '滴洒艺术的动态韵律，色彩的交织舞动',
        story: '波洛克滴画技法的代表作之一，自由挥洒的颜料形成复杂网络',
        likes: 765,
        audio: '/audio/1.mp3',
        comments: [
          { id: 1, user: '抽象爱好者', text: '像宇宙大爆炸一样！', time: '2024-01-24', user_id: 21, username: '抽象爱好者' }
        ],
        position: { x: 2050, y: 1580, width: 200, height: 160 },
        width: 1500,
        height: 1000
      },
      {
        id: 31,
        title: '构成VI',
        artist: '瓦西里·康定斯基',
        year: 1913,
        style: 'abstract',
        description: '抽象音乐绘画的杰作，色彩如交响乐般流动',
        story: '康定斯基探索色彩与音乐关系的早期作品，视觉化的音乐交响',
        likes: 654,
        audio: '/audio/2.mp3',
        comments: [],
        position: { x: 1850, y: 1850, width: 190, height: 200 },
        width: 1300,
        height: 1100
      },
      {
        id: 32,
        title: '黑方块',
        artist: '卡济米尔·马列维奇',
        year: 1915,
        style: 'abstract',
        description: '至上主义的开创，艺术的零点革命',
        story: '挑战传统绘画概念，白色背景上的黑色方块象征艺术零度',
        likes: 543,
        audio: '/audio/2.mp3',
        comments: [
          { id: 1, user: '极简主义者', text: '大道至简！', time: '2024-01-25', user_id: 22, username: '极简主义者' }
        ],
        position: { x: 2060, y: 1830, width: 170, height: 170 },
        width: 800,
        height: 800
      },
      {
        id: 33,
        title: '谁害怕红黄蓝',
        artist: '巴尼特·纽曼',
        year: 1966,
        style: 'abstract',
        description: '色域绘画的代表，色彩的纯粹力量',
        story: '纽曼的色域绘画代表作，探索色彩与空间关系的极简作品',
        likes: 432,
        audio: '/audio/3.mp3',
        comments: [],
        position: { x: 1850, y: 2100, width: 210, height: 180 },
        width: 1400,
        height: 900
      },
      {
        id: 34,
        title: '胜利女神',
        artist: '弗朗茨·克莱因',
        year: 1956,
        style: 'abstract',
        description: '黑白抽象的力量，东方书法的西方演绎',
        story: '受东方书法启发，以黑白对比和大胆笔触表现动态与力量',
        likes: 321,
        audio: '/audio/3.mp3',
        comments: [],
        position: { x: 2080, y: 2080, width: 180, height: 190 },
        width: 1200,
        height: 1000
      },
      {
        id: 35,
        title: '日出·印象',
        artist: '克劳德·莫奈',
        year: 1872,
        style: 'modern',
        description: '印象派开山之作，晨雾中的港口光影',
        story: '这幅画描绘了法国勒阿弗尔港口的日出景象，晨雾笼罩着水面，太阳在薄雾中升起，船只的轮廓若隐若现。"印象派"这个名字就是由此画而来，当时评论家讽刺地称这些画家为"印象派"，没想到成了流派的名称。',
        likes: 1789,
        audio: '/audio/1.mp3',
        comments: [
          { id: 1, user: '光影捕手', text: '雾气和阳光的处理太绝了！', time: '2024-01-26', user_id: 23, username: '光影捕手' },
          { id: 2, user: '印象派粉丝', text: '印象派的起点，历史性的一刻', time: '2024-01-27', user_id: 24, username: '印象派粉丝' }
        ],
        position: { x: 1850, y: 2350, width: 220, height: 160 },
        width: 1500,
        height: 950
      },
      {
        id: 36,
        title: '过秦楼',
        artist: '顾恺之',
        year: 405,
        style: 'classical',
        description: '东晋人物画巅峰，仕女的优雅与诗意',
        story: '顾恺之的人物画代表作之一，描绘古代女子在楼上凭栏远眺的情景。画中人物神态生动，线条流畅如"春蚕吐丝"，展现了顾恺之"传神写照"的艺术理念。整幅画充满了诗意和浪漫情怀。',
        likes: 845,
        audio: '/audio/2.mp3',
        comments: [
          { id: 1, user: '国画研究者', text: '顾恺之的线条真是出神入化！', time: '2024-01-28', user_id: 25, username: '国画研究者' },
          { id: 2, user: '东方美学', text: '古代仕女的优雅气质表现得淋漓尽致', time: '2024-01-29', user_id: 26, username: '东方美学' }
        ],
        position: { x: 2090, y: 2330, width: 180, height: 190 },
        width: 1100,
        height: 1400
      },
      {
        id: 37,
        title: '春天的花园',
        artist: '克劳德·莫奈',
        year: 1886,
        style: 'modern',
        description: '吉维尼花园的春天，繁花似锦的色彩交响',
        story: '莫奈在吉维尼花园创作的系列作品之一，描绘春天花园的绚丽景象。画中各种花卉争奇斗艳，色彩斑斓，光影交错。这是莫奈晚年对自然美的深情礼赞，充满了生命的活力和喜悦。',
        likes: 1567,
        audio: '/audio/3.mp3',
        comments: [
          { id: 1, user: '园艺爱好者', text: '这花园太美了，想住进去！', time: '2024-01-30', user_id: 27, username: '园艺爱好者' },
          { id: 2, user: '色彩魔术师', text: '莫奈对色彩的控制真是天才', time: '2024-01-31', user_id: 28, username: '色彩魔术师' }
        ],
        position: { x: 1850, y: 2600, width: 200, height: 180 },
        width: 1300,
        height: 1100
      }
    ]
  },

  getters: {
    // ========== 艺术作品分类（保持原样） ==========
    modernArtworks: (state) => state.artworks.filter(a => a.style === 'modern'),
    classicalArtworks: (state) => state.artworks.filter(a => a.style === 'classical'),
    abstractArtworks: (state) => state.artworks.filter(a => a.style === 'abstract'),
    impressionismArtworks: (state) => state.artworks.filter(a => a.style === 'impressionism'),
    surrealismArtworks: (state) => state.artworks.filter(a => a.style === 'surrealism'),
    getUserGalleries: (state) => state.personalGalleries,
    totalArtworks: (state) => state.artworks.length,
    totalLikes: (state) => state.artworks.reduce((sum, art) => sum + art.likes, 0),
    chineseArtworks: (state) => state.artworks.filter(a =>
      a.artist.includes('王') ||
      a.artist.includes('张') ||
      a.artist.includes('黄') ||
      a.artist.includes('顾')
    ),

    // ========== 画廊社区 getters（保持原样） ==========
    onlineFriends: (state) => state.friends.filter(friend => friend.online),
    unreadMessages: (state) => state.messages.filter(msg => !msg.read),
    unreadNotifications: (state) => state.notifications.filter(notif => !notif.read),
    pendingFriendRequests: (state) => state.friendRequests.filter(req => !req.handled),
    friendGalleries: (state) => {
      const myFriendIds = state.friends.map(friend => friend.id)
      return state.communityGalleries.filter(gallery =>
        gallery.privacy !== 'private' &&
        myFriendIds.includes(gallery.authorId)
      )
    },

    // ========== 首页特定的 getter ==========
    museumArtworks: (state) => [
      {
        id: 1,
        title: '蒙娜丽莎',
        artist: '列奥纳多·达·芬奇',
        period: '文艺复兴',
        year: '1503年',
        description: '这幅肖像画以其神秘的微笑和精湛的晕涂技法闻名于世，是文艺复兴时期最具代表性的作品之一。',
        dimensions: '77×53cm',
        medium: '油画·木板',
        collection: '法国卢浮宫',
        image: '/images/artworks/mona-lisa.jpg',
        tags: ['神秘微笑的永恒魅力', '文艺复兴肖像画巅峰']
      },
      {
        id: 2,
        title: '向日葵',
        artist: '文森特·梵高',
        period: '后印象派',
        year: '1888年',
        description: '鲜艳的黄色和粗犷的笔触展现了生命的活力与热情。',
        dimensions: '92.1×73cm',
        medium: '油画·画布',
        collection: '荷兰梵高博物馆',
        image: '/images/artworks/sunflowers.jpg',
        tags: ['鲜艳色彩的激情表达', '后印象派代表之作']
      },
      {
        id: 3,
        title: '星月夜',
        artist: '文森特·梵高',
        period: '后印象派',
        year: '1889年',
        description: '梵高在精神病院期间创作的杰作，以漩涡状的笔触描绘了充满动感的夜空，展现了艺术家独特的视觉体验和内心情感的表达。',
        dimensions: '73.7×92.1cm',
        medium: '油画·画布',
        collection: '纽约现代艺术博物馆',
        image: '/images/artworks/the-starry-night.jpg',
        tags: ['漩涡笔触的星空幻想', '艺术家内心情感宣泄']
      },
      {
        id: 4,
        title: '睡莲',
        artist: '克劳德·莫奈',
        period: '印象派',
        year: '1916年',
        description: '莫奈晚年创作的系列作品，以吉维尼花园的睡莲池为主题，展现了光线在水面上的微妙变化和自然光影的瞬间印象。',
        dimensions: '200×200cm',
        medium: '油画·画布',
        collection: '巴黎橘园美术馆',
        image: '/images/artworks/water-lilies.jpg',
        tags: ['光影变化的瞬间捕捉', '印象派风景画典范']
      },
      {
        id: 5,
        title: '最后的晚餐',
        artist: '列奥纳多·达·芬奇',
        period: '文艺复兴',
        year: '1498年',
        description: '描绘耶稣与十二门徒共进最后晚餐的场景，以其精湛的透视法和人物表情刻画成为文艺复兴的巅峰之作。',
        dimensions: '460×880cm',
        medium: '壁画',
        collection: '意大利圣玛丽亚感恩教堂',
        image: '/images/artworks/the-last-supper.jpg',
        tags: ['戏剧性瞬间的完美刻画', '文艺复兴壁画杰作']
      }
    ]
  },

  mutations: {
    // ========== 用户相关 ==========
    SET_USER(state, user) {
      state.user = user
      state.isLoggedIn = !!user
      localStorage.setItem('user', JSON.stringify(user))
    },

    CLEAR_USER(state) {
      state.user = null
      state.isLoggedIn = false
      // 清除所有社区数据
      state.friends = []
      state.friendRequests = []
      state.sentRequests = []
      state.communityGalleries = []
      state.messages = []
      state.notifications = []

      localStorage.removeItem('user')
      localStorage.removeItem('friends')
      localStorage.removeItem('friendRequests')
      localStorage.removeItem('sentRequests')
      localStorage.removeItem('communityGalleries')
      localStorage.removeItem('messages')
      localStorage.removeItem('notifications')
    },

    // ========== 艺术作品相关 ==========
    LIKE_ARTWORK(state, artworkId) {
      const artwork = state.artworks.find(a => a.id === artworkId)
      if (artwork) {
        artwork.likes++
      }
    },

    ADD_COMMENT(state, { artworkId, comment }) {
      const artwork = state.artworks.find(a => a.id === artworkId)
      if (artwork) {
        artwork.comments.push({
          id: Date.now(),
          user: '当前用户',
          text: comment,
          time: new Date().toISOString().split('T')[0]
        })
      }
    },

    // ========== 画廊相关 ==========
      SET_MY_GALLERIES(state, galleries) {
    state.personalGalleries = galleries;
    localStorage.setItem('galleries', JSON.stringify(galleries));
  },
    ADD_GALLERY(state, gallery) {
      state.personalGalleries.push(gallery)
      localStorage.setItem('galleries', JSON.stringify(state.personalGalleries))
    },

    UPDATE_GALLERY(state, updatedGallery) {
      const index = state.personalGalleries.findIndex(g => g.id === updatedGallery.id)
      if (index !== -1) {
        state.personalGalleries[index] = updatedGallery
        localStorage.setItem('galleries', JSON.stringify(state.personalGalleries))
      }
    },

    DELETE_GALLERY(state, galleryId) {
      state.personalGalleries = state.personalGalleries.filter(g => g.id !== galleryId)
      localStorage.setItem('galleries', JSON.stringify(state.personalGalleries))
    },

    // ========== 社区相关 ==========
    SET_FRIENDS(state, friends) {
      state.friends = friends
      localStorage.setItem('friends', JSON.stringify(friends))
    },

    SET_FRIEND_REQUESTS(state, requests) {
      state.friendRequests = requests
      localStorage.setItem('friendRequests', JSON.stringify(requests))
    },

    SET_SENT_REQUESTS(state, requests) {
      state.sentRequests = requests
      localStorage.setItem('sentRequests', JSON.stringify(requests))
    },

    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications
      localStorage.setItem('notifications', JSON.stringify(notifications))
    },

    SET_COMMUNITY_GALLERIES(state, galleries) {
      state.communityGalleries = galleries
      localStorage.setItem('communityGalleries', JSON.stringify(galleries))
    },

    SET_MESSAGES(state, messages) {
      state.messages = messages
      localStorage.setItem('messages', JSON.stringify(messages))
    }
  },

  actions: {
    // ========== 用户登录/登出 ==========
    async login({ commit, dispatch }, userData) {
      commit('SET_USER', userData)
      // 初始化社区数据
      await dispatch('initializeCommunityData')
    },

    async logout({ commit }) {
      commit('CLEAR_USER')
    },

    // ========== 艺术作品操作 ==========
    async likeArtwork({ commit }, artworkId) {
      commit('LIKE_ARTWORK', artworkId)
    },

    async addComment({ commit }, { artworkId, comment }) {
      commit('ADD_COMMENT', { artworkId, comment })
    },

    // ========== 画廊操作 ==========
    async addGallery({ commit }, gallery) {
      commit('ADD_GALLERY', gallery)
    },

    async deleteGallery({ dispatch }, galleryId) {
      try {
        const response = await galleryAPI.deleteGallery(galleryId);
        // 删除成功后刷新列表
        await dispatch('fetchMyGalleries');
        return response;
      } catch (error) {
        console.error('删除画廊失败:', error);
        throw error;
      }
    },
    async updateGallery({ dispatch }, { galleryId, galleryData }) {
        try {
            const response = await galleryAPI.updateGallery(galleryId, galleryData);
            // 更新成功后刷新列表
            await dispatch('fetchMyGalleries');
            return response;
        } catch (error) {
            console.error('更新画廊失败:', error);
            throw error;
        }
    },
    // ========== 艺术作品数据同步 ==========
    async syncArtworksData({ state, commit }) {
      if (!state.isLoggedIn) {
        console.log('未登录，跳过数据同步')
        return
      }

      console.log('开始同步艺术作品数据...')

      try {
        const likesResponse = await artworkAPI.getMyLikes()
        console.log('点赞列表响应:', likesResponse)

        const likedArtworkIds = likesResponse.artwork_ids || []

        for (const artwork of state.artworks) {
          try {
            console.log(`同步作品 ${artwork.id} 数据...`)

            const stats = await artworkAPI.getStats(artwork.id)
            console.log(`作品 ${artwork.id} 统计:`, stats)

            if (stats) {
              artwork.likes = stats.likes_count || artwork.likes
              artwork.comments_count = stats.comments_count || (artwork.comments ? artwork.comments.length : 0)
              artwork.is_liked = stats.is_liked === 1 || likedArtworkIds.includes(artwork.id)

              console.log(`作品 ${artwork.id} 更新后:`, {
                likes: artwork.likes,
                comments_count: artwork.comments_count,
                is_liked: artwork.is_liked
              })
            }
          } catch (error) {
            console.error(`同步作品 ${artwork.id} 数据失败:`, error)
          }
        }

        console.log('艺术作品数据同步完成')
      } catch (error) {
        console.error('同步作品数据失败:', error)
      }
    },

    async getArtworkDetail({ state }, id) {
      try {
        if (state.isLoggedIn) {
          try {
            const response = await artworkAPI.getDetail(id)
            return response
          } catch (error) {
            console.error('获取后端数据失败，使用本地数据:', error)
          }
        }

        return state.artworks.find(art => art.id === parseInt(id))
      } catch (error) {
        console.error('获取作品详情失败:', error)
        return state.artworks.find(art => art.id === parseInt(id))
      }
    },

    // ========== 社区相关 actions（保持你原来的逻辑） ==========
    async fetchFriends({ commit }) {
      try {
        const response = await friendAPI.getFriends()
        commit('SET_FRIENDS', response.friends || [])
        return response.friends || []
      } catch (error) {
        console.error('获取好友列表失败:', error)
        const localFriends = JSON.parse(localStorage.getItem('friends')) || []
        commit('SET_FRIENDS', localFriends)
        return localFriends
      }
    },

    async fetchFriendRequests({ commit }) {
      try {
        const response = await friendAPI.getFriendRequests()
        commit('SET_FRIEND_REQUESTS', response.requests || [])
        return response.requests || []
      } catch (error) {
        console.error('获取好友请求失败:', error)
        const localRequests = JSON.parse(localStorage.getItem('friendRequests')) || []
        commit('SET_FRIEND_REQUESTS', localRequests)
        return localRequests
      }
    },

    async fetchSentRequests({ commit }) {
      try {
        const response = await friendAPI.getSentRequests()
        commit('SET_SENT_REQUESTS', response.requests || [])
        return response.requests || []
      } catch (error) {
        console.error('获取已发送请求失败:', error)
        const localSentRequests = JSON.parse(localStorage.getItem('sentRequests')) || []
        commit('SET_SENT_REQUESTS', localSentRequests)
        return localSentRequests
      }
    },

    async sendFriendRequest({ dispatch }, userId) {
      try {
        await friendAPI.sendFriendRequest(userId)
        await dispatch('fetchSentRequests')
      } catch (error) {
        console.error('发送好友请求失败:', error)
        throw error
      }
    },

    async acceptFriendRequest({ dispatch }, userId) {
      try {
        await friendAPI.acceptFriendRequest(userId)
        await dispatch('fetchFriendRequests')
        await dispatch('fetchFriends')
      } catch (error) {
        console.error('接受好友请求失败:', error)
        throw error
      }
    },

    async rejectFriendRequest({ dispatch }, userId) {
      try {
        await friendAPI.rejectFriendRequest(userId)
        await dispatch('fetchFriendRequests')
      } catch (error) {
        console.error('拒绝好友请求失败:', error)
        throw error
      }
    },

    async removeFriend({ dispatch }, userId) {
      try {
        await friendAPI.removeFriend(userId)
        await dispatch('fetchFriends')
      } catch (error) {
        console.error('删除好友失败:', error)
        throw error
      }
    },

    async searchUsers({ }, query) {
      try {
        const response = await friendAPI.searchUsers(query)
        return response.users || []
      } catch (error) {
        console.error('搜索用户失败:', error)
        return []
      }
    },

    async fetchNotifications({ commit }) {
      try {
        console.log('🔄 Store: 获取通知...')
        const response = await notificationAPI.getNotifications()

        if (response.success) {
          const notifications = (response.notifications || []).map(notification => ({
            ...notification,
            read: notification.is_read !== undefined ? notification.is_read : notification.read
          }))

          commit('SET_NOTIFICATIONS', notifications)
          console.log(`✅ Store: 获取通知成功，共 ${notifications.length} 条`)

          if (notifications.length > 0) {
            console.log('📋 通知示例:')
            notifications.slice(0, 3).forEach((notif, index) => {
              console.log(`  [${index + 1}] ID:${notif.id}, 类型:${notif.type}, 标题:"${notif.title}", read:${notif.read}`)
            })
          }

          return notifications
        } else {
          console.error('❌ Store: 获取通知失败:', response.error)
          const localNotifications = JSON.parse(localStorage.getItem('notifications')) || []
          commit('SET_NOTIFICATIONS', localNotifications)
          return localNotifications
        }
      } catch (error) {
        console.error('❌ Store: 获取通知异常:', error)
        const localNotifications = JSON.parse(localStorage.getItem('notifications')) || []
        commit('SET_NOTIFICATIONS', localNotifications)
        return localNotifications
      }
    },

    async markNotificationAsRead({ state, commit }, notificationId) {
      try {
        console.log(`📝 Store: 标记通知 ${notificationId} 为已读`)
        await notificationAPI.markAsRead(notificationId)

        const notifications = state.notifications.map(notification => {
          if (notification.id === notificationId) {
            return {
              ...notification,
              read: 1,
              is_read: 1
            }
          }
          return notification
        })

        commit('SET_NOTIFICATIONS', notifications)
        console.log(`✅ Store: 通知 ${notificationId} 已标记为已读`)
      } catch (error) {
        console.error('❌ Store: 标记通知为已读失败:', error)
      }
    },

    async markAllNotificationsAsRead({ state, commit }) {
      try {
        console.log('📝 Store: 标记所有通知为已读')
        await notificationAPI.markAllAsRead()

        const notifications = state.notifications.map(notification => ({
          ...notification,
          read: 1,
          is_read: 1
        }))

        commit('SET_NOTIFICATIONS', notifications)
        console.log(`✅ Store: 所有通知已标记为已读，共 ${notifications.length} 条`)
      } catch (error) {
        console.error('❌ Store: 标记所有通知为已读失败:', error)
      }
    },

   async fetchMyGalleries({ commit }) {
  try {
    const response = await galleryAPI.getMyGalleries()

    // 这里是完整的、未省略的 map 函数
    const galleries = (response.galleries || []).map(gallery => ({
      id: gallery.id,
      name: gallery.name,
      description: gallery.description,
      privacy: gallery.privacy,
      theme: gallery.theme || 'starry',
      layout: gallery.layout || 'grid',
      artworks: gallery.artworks || [],
      items: gallery.artworks || [], // 为了兼容您组件中的两种用法
      createdAt: gallery.created_at || gallery.createdAt || new Date().toISOString(),
      updated_at: gallery.updated_at,
      likes_count: gallery.likes_count || 0,
      comments_count: gallery.comments_count || 0,
      is_liked: gallery.is_liked || false,
      user_id: gallery.user_id,
      author: gallery.author || {
        id: gallery.user_id,
        name: gallery.username,
        avatar: gallery.author_avatar
      }
    }))

    // 这是核心的修复逻辑：调用正确的 mutation
    commit('SET_MY_GALLERIES', galleries)
    console.log('获取个人画廊完成，已存入state:', galleries.length, '个')
    return galleries
    
  } catch (error) {
    console.error('获取个人画廊失败:', error)
    const localGalleries = JSON.parse(localStorage.getItem('galleries')) || []
    commit('SET_MY_GALLERIES', localGalleries) // 即使失败也要保证数据结构正确
    return localGalleries
  }
},

  async createGallery({ dispatch }, galleryData) {
      try {
        const response = await galleryAPI.createGallery(galleryData)
        // 创建成功后，调用 fetchMyGalleries 刷新整个列表，保证数据同步
        await dispatch('fetchMyGalleries')
        return response
      } catch (error) {
        console.error('创建画廊失败:', error)
        throw error // 抛出错误让组件处理
      }
    },

  async fetchMyGalleries({ commit }) {
  try {
    // 1. 调用 API 获取数据
    const response = await galleryAPI.getMyGalleries()

    // 2. 使用 .map() 转换数据，确保前端组件所需的所有字段都存在且格式正确
    const galleries = (response.galleries || []).map(gallery => ({
      id: gallery.id,
      name: gallery.name,
      description: gallery.description,
      privacy: gallery.privacy,
      theme: gallery.theme || 'starry', // 提供默认主题
      layout: gallery.layout || 'grid',  // 提供默认布局
      artworks: gallery.artworks || [],  // 确保 artworks 数组存在
      items: gallery.artworks || [],     // 为了兼容您组件中可能存在的 items 用法
      createdAt: gallery.created_at || gallery.createdAt || new Date().toISOString(), // 兼容不同命名并提供备用
      updated_at: gallery.updated_at,
      likes_count: gallery.likes_count || 0,
      comments_count: gallery.comments_count || 0,
      is_liked: gallery.is_liked || false,
      user_id: gallery.user_id,
      author: gallery.author || { // 确保 author 对象存在
        id: gallery.user_id,
        name: gallery.username,
        avatar: gallery.author_avatar
      }
    }))

    // 3. 【核心修复】调用正确的 mutation 来覆盖 state，而不是追加
    commit('SET_MY_GALLERIES', galleries)

    console.log('✅ 获取个人画廊成功，已存入 state:', galleries.length, '个')
    return galleries
    
  } catch (error) {
    // 4. 错误处理：如果 API 失败，则从本地存储加载数据
    console.error('❌ 获取个人画廊失败，尝试从本地恢复:', error)
    
    const localGalleries = JSON.parse(localStorage.getItem('galleries')) || []
    
    // 即使失败，也要调用 SET_MY_GALLERIES 来保证 state 数据结构的正确性
    commit('SET_MY_GALLERIES', localGalleries) 
    
    return localGalleries
  }
},

    async fetchConversation({ state }, userId) {
      try {
        const response = await messageAPI.getConversation(userId)
        return response.messages || []
      } catch (error) {
        console.error('获取对话失败:', error)
        // 返回本地消息
        const localMessages = state.messages.filter(msg =>
          (msg.sender_id === userId && msg.receiver_id === state.user?.id) ||
          (msg.sender_id === state.user?.id && msg.receiver_id === userId)
        )
        return localMessages
      }
    },

    async sendMessage({ commit, state }, data) {
      try {
        const response = await messageAPI.sendMessage(data)
        
        // 添加到本地消息列表
        const messages = [...state.messages, response.data]
        commit('SET_MESSAGES', messages)
        
        return response.data
      } catch (error) {
        console.error('发送消息失败:', error)
        // 本地存储
        const localMessage = {
          id: Date.now(),
          ...data,
          created_at: new Date().toISOString(),
          read: false
        }
        
        const messages = [...state.messages, localMessage]
        commit('SET_MESSAGES', messages)
        
        return localMessage
      }
    },

    async initializeCommunityData({ dispatch }) {
      const isLoggedIn = JSON.parse(localStorage.getItem('user')) ? true : false
      if (!isLoggedIn) {
        console.log('未登录，跳过社区数据初始化')
        return
      }

      console.log('开始初始化社区数据...')

      try {
        await Promise.all([
          dispatch('fetchMyGalleries'),
          dispatch('fetchFriends'),
          dispatch('fetchFriendRequests'),
          dispatch('fetchSentRequests'),
          dispatch('fetchNotifications')
        ])
        console.log('社区数据初始化完成')
      } catch (error) {
        console.error('初始化社区数据失败:', error)
      }
    }
  }
})