/**
 * ARCHIVE NAVIGATION THEME CANDIDATES & LIVE SWITCHER (导航栏候补图案与即时切换系统)
 * 提供 4 套精雕细琢的高清矢量候补图案，并提供可视化一键切换面板：
 * - Theme 1: 🖋️【复古文青手账】(Vintage Archive & Stationery - 羽毛笔、王冠、藏书卷、魔杖、丝绒缎带、火漆信笺、黄铜罗盘)
 * - Theme 2: 🐾【像素萌宠信使】(Pixel Cozy Companions - 猫猫、小熊、垂耳兔、魔法雪鸮、小狐狸、水晶心、幸运骰)
 * - Theme 3: 🌱【微缩像素花房】(Pixel Botanical Garden - 常春藤、郁金香、龟背竹、魔法菇、红玫瑰、粉心多肉、四叶草)
 * - Theme 4: 🍵【抹茶甜点茶会】(Matcha & Sweet Treats - 抹茶杯、草莓蛋糕、瑞士卷、三色团子、甜甜圈、圣代心、华夫甜筒)
 * 《閲読器作品記録》 · keyanrenshi.xyz
 */
(() => {
  const inWorksDir = /\/works\/work-\d+\.html$/i.test(location.pathname);
  const root = inWorksDir ? '../' : './';

  const THEMES = {
    // ------------------------------------------------------------------------
    // 方案 A（当前默认）：【16-Bit 像素宝藏】(厚涂高光微缩 · 深度贴合每个板块功能)
    // ------------------------------------------------------------------------
    pixel_rpg: {
      name: '16-Bit 像素宝藏 (厚涂微缩)',
      tagline: '魔法帽 · 鎏金王冠 · 羽毛笔账本 · 典藏书卷 · 舞台麦克风 · 水晶心 · 探案镜',
      badgeClass: 'theme-pixel-rpg',
      icons: {
        // 馆主档案: 馆主羽毛笔账本与墨水瓶星芒
        profile: `<img src="${root}assets/nav-pixel/profile.png" alt="馆主档案" class="pixel-nav-img" referrerPolicy="no-referrer">`,
        // 私心神作: 纯金红宝石神作王冠
        masterworks: `<img src="${root}assets/nav-pixel/masterworks.png" alt="私心神作" class="pixel-nav-img" referrerPolicy="no-referrer">`,
        // 作品一览: 典藏缎带精装故事书卷
        works: `<img src="${root}assets/nav-pixel/works.png" alt="作品一览" class="pixel-nav-img" referrerPolicy="no-referrer">`,
        // 霍格沃茨特快: 霍格沃茨魔法巫师帽与星芒魔杖
        hp: `<img src="${root}assets/nav-pixel/hp.png" alt="霍格沃茨特快" class="pixel-nav-img" referrerPolicy="no-referrer">`,
        // 真人区: 偶像舞台麦克风与粉色蝴蝶结丝带
        celebrity: `<img src="${root}assets/nav-pixel/celebrity.png" alt="真人区" class="pixel-nav-img" referrerPolicy="no-referrer">`,
        // 我的收藏: 双翼闪烁水晶红宝石心
        favorites: `<img src="${root}assets/nav-pixel/favorites.png" alt="我的收藏" class="pixel-nav-img" referrerPolicy="no-referrer">`,
        // 搜索与随机: 黄铜复古探案放大镜与多面幸运骰
        search: `<img src="${root}assets/nav-pixel/search.png" alt="搜索与随机" class="pixel-nav-img" referrerPolicy="no-referrer">`
      }
    },

    // ------------------------------------------------------------------------
    // 候补 1：【复古文青手账】(手账、同人档案馆与复古纸质美学)
    // ------------------------------------------------------------------------
    stationery: {
      name: '复古文青手账',
      tagline: '羽毛笔 · 烫金王冠 · 火漆信笺 · 黄铜罗盘',
      badgeClass: 'theme-stationery',
      icons: {
        // 馆主档案: 🖋️ 墨水瓶与羽毛钢笔 (Ink Bottle & Feather Quill)
        profile: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none">
            <!-- Ink bottle -->
            <rect x="15" y="16" width="12" height="12" rx="3" fill="#2d221c"/>
            <rect x="17" y="18" width="8" height="8" rx="2" fill="#4d3b32"/>
            <rect x="19" y="14" width="4" height="3" fill="#2d221c"/>
            <rect x="19" y="19" width="4" height="4" fill="#8c6f5d"/>
            <rect x="20" y="20" width="2" height="2" fill="#d9bba9"/>
            <!-- Vintage Quill Feather -->
            <path d="M 5 28 L 10 23 L 23 7 C 25 4 27 5 26 8 C 24 14 18 20 12 24 Z" fill="#d9c4b1" stroke="#2d221c" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M 10 23 L 24 8" stroke="#8a6952" stroke-width="1.2" stroke-linecap="round"/>
            <!-- Golden Pen Nib -->
            <polygon points="5,28 7,24 10,25" fill="#f0c24b" stroke="#2d221c" stroke-width="1"/>
            <!-- Ink drop -->
            <circle cx="5" cy="28.5" r="1.5" fill="#2d221c"/>
          </svg>
        `,
        // 私心神作: 👑 烫金复古王冠 (Gilded Royal Crown with Ruby)
        masterworks: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none">
            <!-- Sparkles -->
            <rect x="3" y="6" width="2" height="5" fill="#f5d05d"/>
            <rect x="1.5" y="7.5" width="5" height="2" fill="#f5d05d"/>
            <rect x="26" y="5" width="2" height="4" fill="#f5d05d"/>
            <rect x="25" y="6" width="4" height="2" fill="#f5d05d"/>
            <!-- Crown Base Rim -->
            <rect x="5" y="22" width="22" height="5" rx="2" fill="#302319"/>
            <rect x="6" y="23" width="20" height="3" rx="1.5" fill="#d49a37"/>
            <circle cx="10" cy="24.5" r="1" fill="#ffffff"/>
            <circle cx="16" cy="24.5" r="1.2" fill="#d6314f"/>
            <circle cx="22" cy="24.5" r="1" fill="#ffffff"/>
            <!-- Crown Spikes -->
            <path d="M 5 22 L 6 12 L 11 18 L 16 9 L 21 18 L 26 12 L 27 22 Z" fill="#f3be48" stroke="#302319" stroke-width="1.5" stroke-linejoin="round"/>
            <!-- Jewels on Peaks -->
            <circle cx="6" cy="11" r="1.8" fill="#d6314f" stroke="#302319" stroke-width="1"/>
            <circle cx="16" cy="8" r="2.2" fill="#3782c9" stroke="#302319" stroke-width="1"/>
            <circle cx="26" cy="11" r="1.8" fill="#d6314f" stroke="#302319" stroke-width="1"/>
            <!-- Inner Arch Highlight -->
            <path d="M 11 19 L 16 12 L 21 19" stroke="#fceab1" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
        `,
        // 作品一览: 📖 精装硬壳烫金藏书 (Antique Leatherbound Book)
        works: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none">
            <!-- Book Spine & Pages Shadows -->
            <rect x="6" y="7" width="20" height="20" rx="3" fill="#2d221b"/>
            <!-- Leather Cover -->
            <rect x="7" y="8" width="18" height="18" rx="2" fill="#5c3426"/>
            <!-- Page Block (White parchment edge) -->
            <rect x="9" y="10" width="15" height="14" rx="1" fill="#f6eedb"/>
            <!-- Inner Bookmark Ribbon -->
            <path d="M 17 8 L 17 19 L 19 17 L 21 19 L 21 8 Z" fill="#c4334a"/>
            <!-- Book Spine Accent Line -->
            <rect x="7" y="8" width="3" height="18" fill="#42251a"/>
            <!-- Front Gold Embossed Emblem -->
            <rect x="11.5" y="12.5" width="4" height="4" fill="none" stroke="#d99f38" stroke-width="1"/>
            <circle cx="13.5" cy="14.5" r="1" fill="#f5d169"/>
          </svg>
        `,
        // 霍格沃茨特快: 🪄 星芒魔杖与信笺 (Magic Wand & Sparks)
        hp: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none">
            <!-- Big Golden Star Burst -->
            <polygon points="10,4 12,9 17,10 12,12 10,17 8,12 3,10 8,9" fill="#f7cf4d" stroke="#33241c" stroke-width="1"/>
            <circle cx="10" cy="10.5" r="1.5" fill="#ffffff"/>
            <!-- Magic Sparks -->
            <circle cx="18" cy="6" r="1.2" fill="#f7cf4d"/>
            <circle cx="5" cy="17" r="1" fill="#f7cf4d"/>
            <circle cx="16" cy="14" r="1" fill="#e88299"/>
            <!-- Wooden Magic Wand -->
            <path d="M 8 13 L 27 28" stroke="#33241c" stroke-width="3" stroke-linecap="round"/>
            <path d="M 8 13 L 27 28" stroke="#75472e" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Wand Tip Glow -->
            <circle cx="8" cy="13" r="1.5" fill="#ffffff"/>
            <!-- Wand Handle Rings -->
            <circle cx="23" cy="24.5" r="1.5" fill="#d9a243"/>
            <circle cx="26" cy="27" r="1.5" fill="#d9a243"/>
          </svg>
        `,
        // 真人区: 🎀 丝绒双蝴蝶结缎带 (Velvet Silk Ribbon Bow)
        celebrity: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none">
            <!-- Shadow -->
            <ellipse cx="16" cy="14" rx="12" ry="7" fill="#2d221c" opacity="0.15"/>
            <!-- Left Bow Wing -->
            <path d="M 16 14 C 11 8 4 9 4 14 C 4 19 11 19 16 15 Z" fill="#d64969" stroke="#2d221c" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M 7 13 C 9 11 12 12 14 14" stroke="#f7a8b9" stroke-width="1" stroke-linecap="round"/>
            <!-- Right Bow Wing -->
            <path d="M 16 14 C 21 8 28 9 28 14 C 28 19 21 19 16 15 Z" fill="#d64969" stroke="#2d221c" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M 25 13 C 23 11 20 12 18 14" stroke="#f7a8b9" stroke-width="1" stroke-linecap="round"/>
            <!-- Tails Hanging Down -->
            <path d="M 14 16 L 9 26 L 13 25 L 15 17 Z" fill="#b02c49" stroke="#2d221c" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M 18 16 L 23 26 L 19 25 L 17 17 Z" fill="#b02c49" stroke="#2d221c" stroke-width="1.2" stroke-linejoin="round"/>
            <!-- Center Knot with Pearl -->
            <circle cx="16" cy="14.5" r="3.5" fill="#e86180" stroke="#2d221c" stroke-width="1.4"/>
            <circle cx="15.2" cy="13.8" r="1.2" fill="#ffffff"/>
          </svg>
        `,
        // 我的收藏: 💌 蜜蜡火漆封印信笺 (Wax Seal Love Letter ♡)
        favorites: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none">
            <!-- Envelope Body -->
            <rect x="4" y="9" width="24" height="16" rx="2" fill="#2d221c"/>
            <rect x="5" y="10" width="22" height="14" rx="1.5" fill="#faf2e3"/>
            <!-- Flap Lines -->
            <path d="M 5 10 L 16 18 L 27 10" stroke="#d4c2a5" stroke-width="1.4" stroke-linejoin="round"/>
            <path d="M 5 24 L 12 17" stroke="#e0d1b8" stroke-width="1.2"/>
            <path d="M 27 24 L 20 17" stroke="#e0d1b8" stroke-width="1.2"/>
            <!-- Red Wax Seal with Heart -->
            <circle cx="16" cy="18" r="4.8" fill="#be2542" stroke="#2d221c" stroke-width="1.2"/>
            <circle cx="16" cy="18" r="3.8" fill="#d93655"/>
            <!-- Embossed Wax Heart inside Seal -->
            <path d="M 16 16.5 C 15 15.2 13.5 15.8 13.8 17 C 14.2 18 16 19.5 16 19.5 C 16 19.5 17.8 18 18.2 17 C 18.5 15.8 17 15.2 16 16.5 Z" fill="#ffffff"/>
          </svg>
        `,
        // 搜索与随机: 🧭 黄铜复古罗盘 (Brass Antique Pocket Compass)
        search: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none">
            <!-- Top Ring -->
            <circle cx="16" cy="4.5" r="2.5" fill="none" stroke="#2d221c" stroke-width="1.5"/>
            <rect x="15" y="6" width="2" height="2" fill="#2d221c"/>
            <!-- Outer Compass Casing -->
            <circle cx="16" cy="18" r="11" fill="#2d221c"/>
            <circle cx="16" cy="18" r="9.5" fill="#dfa547"/>
            <circle cx="16" cy="18" r="8" fill="#fef8eb"/>
            <!-- Degree Ticks -->
            <rect x="15.5" y="10.5" width="1" height="2" fill="#8c6c3e"/>
            <rect x="15.5" y="23.5" width="1" height="2" fill="#8c6c3e"/>
            <rect x="8.5" y="17.5" width="2" height="1" fill="#8c6c3e"/>
            <rect x="21.5" y="17.5" width="2" height="1" fill="#8c6c3e"/>
            <!-- Needle (Red North, Blue/Dark South) -->
            <polygon points="16,11 18,17.5 14,17.5" fill="#d93644" stroke="#2d221c" stroke-width="0.8"/>
            <polygon points="16,25 18,18.5 14,18.5" fill="#456187" stroke="#2d221c" stroke-width="0.8"/>
            <!-- Center Pivot Pin -->
            <circle cx="16" cy="18" r="1.5" fill="#f7cf4d" stroke="#2d221c" stroke-width="0.8"/>
          </svg>
        `
      }
    },

    // ------------------------------------------------------------------------
    // 候补 2：【像素萌宠信使】(贴合参考图2中Twitch像素猫咪风格，治愈温润)
    // ------------------------------------------------------------------------
    animals: {
      name: '像素萌宠信使',
      tagline: '猫猫 · 小熊 · 垂耳兔 · 魔法雪鸮 · 幸运骰',
      badgeClass: 'theme-animals',
      icons: {
        // 馆主档案: 🐱 奶白软萌折耳猫 (Cream Folded-Ear Kitten)
        profile: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Cat Head Outline -->
            <rect x="6" y="9" width="20" height="18" rx="4" fill="#2d2621"/>
            <rect x="8" y="7" width="5" height="5" fill="#2d2621"/>
            <rect x="19" y="7" width="5" height="5" fill="#2d2621"/>
            <!-- Face Cream Fur -->
            <rect x="8" y="11" width="16" height="14" fill="#fff9ef"/>
            <rect x="9" y="8" width="3" height="4" fill="#fff9ef"/>
            <rect x="20" y="8" width="3" height="4" fill="#fff9ef"/>
            <rect x="10" y="9" width="1" height="2" fill="#f5b5c5"/>
            <rect x="21" y="9" width="1" height="2" fill="#f5b5c5"/>
            <!-- Eyes & Cheeks -->
            <rect x="10" y="15" width="2" height="3" fill="#2d2621"/>
            <rect x="20" y="15" width="2" height="3" fill="#2d2621"/>
            <rect x="8" y="18" width="3" height="2" fill="#fca8b9"/>
            <rect x="21" y="18" width="3" height="2" fill="#fca8b9"/>
            <!-- Mouth & Nose -->
            <rect x="15" y="17" width="2" height="1" fill="#f58097"/>
            <rect x="14" y="19" width="4" height="1" fill="#2d2621"/>
            <!-- Beret or Leaf -->
            <rect x="13" y="6" width="6" height="3" fill="#69a349"/>
          </svg>
        `,
        // 私心神作: 🐻 焦糖小熊与小金星 (Caramel Teddy Bear & Star)
        masterworks: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Star -->
            <rect x="25" y="3" width="2" height="5" fill="#fad955"/>
            <rect x="23.5" y="4.5" width="5" height="2" fill="#fad955"/>
            <!-- Bear Head Outline -->
            <rect x="6" y="10" width="20" height="17" rx="5" fill="#2d2621"/>
            <rect x="5" y="7" width="6" height="6" fill="#2d2621"/>
            <rect x="21" y="7" width="6" height="6" fill="#2d2621"/>
            <!-- Bear Fur Caramel -->
            <rect x="8" y="12" width="16" height="13" fill="#c78652"/>
            <rect x="7" y="9" width="3" height="3" fill="#c78652"/>
            <rect x="22" y="9" width="3" height="3" fill="#c78652"/>
            <rect x="8" y="10" width="1" height="1" fill="#fed6a0"/>
            <rect x="23" y="10" width="1" height="1" fill="#fed6a0"/>
            <!-- Snout Muzzle -->
            <rect x="12" y="16" width="8" height="6" fill="#fce4c8"/>
            <rect x="14.5" y="17" width="3" height="2" fill="#2d2621"/>
            <rect x="15.5" y="19.5" width="1" height="2" fill="#2d2621"/>
            <!-- Eyes -->
            <rect x="10" y="15" width="2" height="2" fill="#2d2621"/>
            <rect x="20" y="15" width="2" height="2" fill="#2d2621"/>
            <rect x="9" y="18" width="2" height="1" fill="#e89e92"/>
            <rect x="21" y="18" width="2" height="1" fill="#e89e92"/>
          </svg>
        `,
        // 作品一览: 🐰 软萌小兔与红浆果 (Fluffy Bunny with Berry)
        works: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Bunny Ears Outline -->
            <rect x="8" y="4" width="5" height="12" fill="#2d2621"/>
            <rect x="19" y="4" width="5" height="12" fill="#2d2621"/>
            <rect x="9" y="5" width="3" height="9" fill="#ffffff"/>
            <rect x="20" y="5" width="3" height="9" fill="#ffffff"/>
            <rect x="10" y="7" width="1" height="6" fill="#fca8b9"/>
            <rect x="21" y="7" width="1" height="6" fill="#fca8b9"/>
            <!-- Head Outline -->
            <rect x="6" y="12" width="20" height="16" rx="4" fill="#2d2621"/>
            <rect x="8" y="14" width="16" height="12" fill="#ffffff"/>
            <!-- Eyes & Cheeks -->
            <rect x="10" y="17" width="2" height="3" fill="#2d2621"/>
            <rect x="20" y="17" width="2" height="3" fill="#2d2621"/>
            <rect x="8" y="20" width="3" height="2" fill="#fca8b9"/>
            <rect x="21" y="20" width="3" height="2" fill="#fca8b9"/>
            <!-- Little pink nose -->
            <rect x="15" y="19" width="2" height="2" fill="#e85b7c"/>
            <!-- Strawberry Hairpin on ear -->
            <rect x="12" y="7" width="3" height="3" fill="#e8385a"/>
            <rect x="13" y="6" width="1" height="1" fill="#588e34"/>
          </svg>
        `,
        // 霍格沃茨特快: 🦉 魔法送信雪鸮 (Hogwarts Mail Owl)
        hp: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Owl Outline -->
            <rect x="6" y="7" width="20" height="20" rx="6" fill="#2d2621"/>
            <!-- Feathers Body (Snow White + subtle cream) -->
            <rect x="8" y="9" width="16" height="16" fill="#ffffff"/>
            <rect x="9" y="23" width="14" height="2" fill="#dfd6cb"/>
            <!-- Big Golden Owl Eyes -->
            <rect x="9" y="11" width="5" height="5" fill="#f7cf4d"/>
            <rect x="18" y="11" width="5" height="5" fill="#f7cf4d"/>
            <rect x="11" y="12.5" width="2" height="3" fill="#2d2621"/>
            <rect x="19" y="12.5" width="2" height="3" fill="#2d2621"/>
            <!-- Yellow Beak -->
            <polygon points="15,16 17,16 16,19" fill="#e89832"/>
            <!-- Tiny Letter in Beak -->
            <rect x="13" y="19" width="6" height="4" fill="#faf2e3"/>
            <rect x="15" y="20" width="2" height="2" fill="#c7324d"/>
            <!-- Magic Sparkles -->
            <rect x="2" y="4" width="2" height="4" fill="#fad955"/>
            <rect x="26" y="5" width="2" height="4" fill="#fad955"/>
          </svg>
        `,
        // 真人区: 🦊 俏皮小红狐 (Whimsical Little Red Fox)
        celebrity: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Fox Ears -->
            <rect x="5" y="6" width="6" height="8" fill="#2d2621"/>
            <rect x="21" y="6" width="6" height="8" fill="#2d2621"/>
            <rect x="6" y="7" width="3" height="4" fill="#ffffff"/>
            <rect x="23" y="7" width="3" height="4" fill="#ffffff"/>
            <!-- Head Body -->
            <rect x="6" y="11" width="20" height="16" rx="4" fill="#2d2621"/>
            <rect x="8" y="13" width="16" height="12" fill="#d96c3f"/>
            <!-- White Cheek Tufts -->
            <rect x="8" y="19" width="5" height="5" fill="#ffffff"/>
            <rect x="19" y="19" width="5" height="5" fill="#ffffff"/>
            <rect x="13" y="20" width="6" height="4" fill="#ffffff"/>
            <!-- Fox Eyes -->
            <rect x="10" y="16" width="3" height="2" fill="#2d2621"/>
            <rect x="19" y="16" width="3" height="2" fill="#2d2621"/>
            <!-- Black Nose -->
            <rect x="15" y="21" width="2" height="2" fill="#2d2621"/>
          </svg>
        `,
        // 我的收藏: 💖 像素红宝石双层爱心 (Pixel Gem Heart ♡)
        favorites: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Sparkles -->
            <rect x="4" y="5" width="2" height="5" fill="#fca8b9"/>
            <rect x="2.5" y="6.5" width="5" height="2" fill="#fca8b9"/>
            <rect x="25" y="18" width="2" height="4" fill="#fad955"/>
            <!-- Outer Heart Outline -->
            <rect x="7" y="9" width="7" height="6" fill="#2d2621"/>
            <rect x="18" y="9" width="7" height="6" fill="#2d2621"/>
            <rect x="5" y="12" width="22" height="8" fill="#2d2621"/>
            <rect x="7" y="18" width="18" height="5" fill="#2d2621"/>
            <rect x="10" y="22" width="12" height="4" fill="#2d2621"/>
            <rect x="13" y="25" width="6" height="3" fill="#2d2621"/>
            <rect x="15" y="27" width="2" height="2" fill="#2d2621"/>
            <!-- Heart Body Radiant Ruby Pink -->
            <rect x="8" y="11" width="5" height="5" fill="#e83863"/>
            <rect x="19" y="11" width="5" height="5" fill="#e83863"/>
            <rect x="7" y="14" width="18" height="6" fill="#e83863"/>
            <rect x="9" y="19" width="14" height="4" fill="#c7244d"/>
            <rect x="12" y="23" width="8" height="3" fill="#a6173a"/>
            <!-- Gem Facet Highlight -->
            <rect x="9" y="12" width="3" height="3" fill="#ffffff"/>
            <rect x="10" y="15" width="2" height="2" fill="#ffffff"/>
            <rect x="19" y="12" width="2" height="2" fill="#fca8b9"/>
          </svg>
        `,
        // 搜索与随机: 🎲 像素复古幸运魔骰 (Pixel Magic Dice)
        search: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Sparkles -->
            <rect x="25" y="4" width="2" height="5" fill="#fad955"/>
            <!-- Isometric/2.5D Pixel Dice Outline -->
            <rect x="6" y="8" width="20" height="20" rx="3" fill="#2d2621"/>
            <!-- Front Face -->
            <rect x="8" y="10" width="16" height="16" rx="2" fill="#faf2e3"/>
            <!-- Pip Dots (Rolling a lucky 5 or 3 with golden center) -->
            <rect x="10" y="12" width="3" height="3" rx="1" fill="#e8385a"/>
            <rect x="19" y="12" width="3" height="3" rx="1" fill="#2d2621"/>
            <rect x="14.5" y="16.5" width="3" height="3" rx="1" fill="#d99f38"/>
            <rect x="10" y="21" width="3" height="3" rx="1" fill="#2d2621"/>
            <rect x="19" y="21" width="3" height="3" rx="1" fill="#e8385a"/>
          </svg>
        `
      }
    },

    // ------------------------------------------------------------------------
    // 候补 3：【微缩像素植物】(原版植物系的精致矢量重构，淡雅自然)
    // ------------------------------------------------------------------------
    plants: {
      name: '微缩像素花房',
      tagline: '常春藤 · 郁金香 · 龟背竹 · 魔法菇 · 多肉',
      badgeClass: 'theme-plants',
      icons: {
        profile: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Pot -->
            <rect x="9" y="18" width="14" height="11" fill="#2d2621"/>
            <rect x="10" y="19" width="12" height="9" fill="#c77b4d"/>
            <rect x="8" y="17" width="16" height="3" fill="#8c4b28"/>
            <!-- English Ivy Vines -->
            <rect x="14" y="6" width="4" height="12" fill="#588e34"/>
            <rect x="10" y="9" width="5" height="4" fill="#6ea34e"/>
            <rect x="18" y="10" width="6" height="5" fill="#6ea34e"/>
            <rect x="7" y="13" width="5" height="5" fill="#88bd5e"/>
            <rect x="19" y="15" width="6" height="5" fill="#88bd5e"/>
          </svg>
        `,
        masterworks: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Sparkles -->
            <rect x="24" y="5" width="2" height="5" fill="#fad955"/>
            <!-- Pot -->
            <rect x="9" y="19" width="14" height="10" fill="#2d2621"/>
            <rect x="10" y="20" width="12" height="8" fill="#e8a86e"/>
            <!-- Tulip Stem -->
            <rect x="15" y="12" width="2" height="8" fill="#588e34"/>
            <rect x="12" y="15" width="3" height="4" fill="#6ea34e"/>
            <!-- Tulip Blossom (Royal Ruby) -->
            <rect x="12" y="6" width="8" height="7" fill="#2d2621"/>
            <rect x="13" y="7" width="6" height="6" fill="#d93655"/>
            <rect x="15" y="6" width="2" height="2" fill="#fca8b9"/>
          </svg>
        `,
        works: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Pot -->
            <rect x="9" y="18" width="14" height="11" fill="#2d2621"/>
            <rect x="10" y="19" width="12" height="9" fill="#dfd6cb"/>
            <!-- Monstera Leaf Large -->
            <rect x="10" y="5" width="12" height="13" fill="#2d2621"/>
            <rect x="11" y="6" width="10" height="11" fill="#4d8234"/>
            <rect x="13" y="8" width="2" height="2" fill="#faf2e3"/>
            <rect x="17" y="9" width="2" height="2" fill="#faf2e3"/>
            <rect x="14" y="12" width="2" height="2" fill="#faf2e3"/>
          </svg>
        `,
        hp: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Magic Toadstool Mushroom -->
            <rect x="7" y="7" width="18" height="11" rx="4" fill="#2d2621"/>
            <rect x="8" y="8" width="16" height="9" fill="#cf3445"/>
            <rect x="10" y="10" width="3" height="3" fill="#ffffff"/>
            <rect x="19" y="10" width="3" height="3" fill="#ffffff"/>
            <rect x="15" y="13" width="2" height="2" fill="#ffffff"/>
            <!-- Stem -->
            <rect x="12" y="17" width="8" height="10" fill="#2d2621"/>
            <rect x="13" y="18" width="6" height="9" fill="#faf2e3"/>
            <rect x="25" y="4" width="2" height="5" fill="#fad955"/>
          </svg>
        `,
        celebrity: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Rose Blossom -->
            <rect x="10" y="6" width="12" height="11" fill="#2d2621"/>
            <rect x="11" y="7" width="10" height="9" fill="#be2542"/>
            <rect x="13" y="8" width="5" height="3" fill="#ea5876"/>
            <!-- Stem & Leaves -->
            <rect x="15" y="16" width="2" height="5" fill="#588e34"/>
            <rect x="11" y="17" width="4" height="2" fill="#6ea34e"/>
            <!-- Pot -->
            <rect x="9" y="20" width="14" height="9" fill="#2d2621"/>
            <rect x="10" y="21" width="12" height="7" fill="#8c6f5d"/>
          </svg>
        `,
        favorites: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Pink Heart Succulent in Glass Pot -->
            <rect x="9" y="18" width="14" height="10" fill="#2d2621"/>
            <rect x="10" y="19" width="12" height="8" fill="#d8e8ea"/>
            <!-- Succulent Heart Petals -->
            <rect x="10" y="8" width="12" height="10" fill="#2d2621"/>
            <rect x="11" y="9" width="10" height="8" fill="#ea7a98"/>
            <rect x="13" y="10" width="6" height="4" fill="#fca8b9"/>
            <!-- Floating Heart -->
            <rect x="14" y="3" width="4" height="3" fill="#e83863"/>
          </svg>
        `,
        search: `
          <svg class="pixel-nav-svg" viewBox="0 0 32 32" fill="none" shape-rendering="crispEdges">
            <!-- Lucky 4-Leaf Clover in Pot -->
            <rect x="11" y="5" width="10" height="10" fill="#2d2621"/>
            <rect x="12" y="6" width="8" height="8" fill="#6ea34e"/>
            <rect x="14" y="4" width="4" height="4" fill="#6ea34e"/>
            <rect x="15" y="13" width="2" height="7" fill="#588e34"/>
            <rect x="9" y="19" width="14" height="10" fill="#2d2621"/>
            <rect x="10" y="20" width="12" height="8" fill="#dfa547"/>
            <rect x="24" y="4" width="2" height="4" fill="#fad955"/>
          </svg>
        `
      }
    },

    // ------------------------------------------------------------------------
    // 候补 4：【抹茶甜点茶会】(保留上次的抹茶甜点款，作为备选)
    // ------------------------------------------------------------------------
    dessert: {
      name: '抹茶甜点茶会',
      tagline: '拉花杯 · 草莓蛋糕 · 瑞士卷 · 团子串 · 甜甜圈',
      badgeClass: 'theme-dessert',
      icons: window.PIXEL_NAV_BADGES || {}
    }
  };

  const STORAGE_KEY = 'archive_nav_theme_choice';

  function getCurrentThemeKey() {
    return localStorage.getItem(STORAGE_KEY) || 'pixel_rpg'; // 默认采用【16-Bit 像素宝藏 (厚涂微缩)】
  }

  function applyTheme(themeKey) {
    if (!THEMES[themeKey]) themeKey = 'pixel_rpg';
    localStorage.setItem(STORAGE_KEY, themeKey);

    const theme = THEMES[themeKey];
    const icons = theme.icons;

    document.querySelectorAll('[data-nav-key]').forEach(item => {
      const key = item.dataset.navKey;
      const svg = icons[key];
      const iconEl = item.querySelector('.archive-nav__icon');
      if (iconEl && svg) {
        iconEl.innerHTML = svg;
      }
    });

    // 更新切换器面板高亮
    document.querySelectorAll('.theme-switcher-opt').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.themeKey === themeKey);
    });
  }

  // 构建右上角或悬浮优雅的「候补方案切换器」
  function initThemeSwitcher() {
    if (document.getElementById('navThemeSwitcherBtn')) return;

    // 悬浮切换触发按钮
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'navThemeSwitcherBtn';
    btn.className = 'nav-theme-switcher-btn';
    btn.setAttribute('aria-label', '切换导航栏图案候补');
    btn.innerHTML = `<span class="theme-btn-icon">✦</span><span class="theme-btn-text">图标风格</span>`;
    document.body.appendChild(btn);

    // 切换弹窗面板
    const panel = document.createElement('div');
    panel.id = 'navThemeSwitcherPanel';
    panel.className = 'nav-theme-switcher-panel';
    panel.innerHTML = `
      <div class="theme-panel-header">
        <div>
          <h4 class="theme-panel-title">导航栏图标风格方案</h4>
          <p class="theme-panel-hint">点击任意方案立即全站预览，满意后自动保存</p>
        </div>
        <button type="button" class="theme-panel-close" id="navThemePanelClose">✕</button>
      </div>
      <div class="theme-panel-list">
        ${Object.entries(THEMES).map(([key, t]) => {
          const previewSvgs = [
            t.icons.profile,
            t.icons.masterworks,
            t.icons.works,
            t.icons.hp,
            t.icons.celebrity,
            t.icons.favorites,
            t.icons.search
          ].filter(Boolean).slice(0, 7).join('');

          return `
            <button type="button" class="theme-switcher-opt ${key === getCurrentThemeKey() ? 'is-active' : ''}" data-theme-key="${key}">
              <div class="theme-opt-top">
                <span class="theme-opt-name">${t.name}</span>
                <span class="theme-opt-badge">${key === getCurrentThemeKey() ? '当前生效' : '点击试用'}</span>
              </div>
              <div class="theme-opt-preview">
                ${previewSvgs}
              </div>
              <p class="theme-opt-desc">${t.tagline}</p>
            </button>
          `;
        }).join('')}
      </div>
    `;
    document.body.appendChild(panel);

    // 绑定交互
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('is-open');
    });

    panel.querySelector('#navThemePanelClose').addEventListener('click', () => {
      panel.classList.remove('is-open');
    });

    panel.querySelectorAll('.theme-switcher-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const key = opt.dataset.themeKey;
        applyTheme(key);
      });
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        panel.classList.remove('is-open');
      }
    });
  }

  // 初始化生效
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getCurrentThemeKey());
    initThemeSwitcher();
    // 延迟再次刷新，兼容动态 DOM
    setTimeout(() => applyTheme(getCurrentThemeKey()), 100);
  });

  window.setNavTheme = applyTheme;
  window.NAV_THEMES = THEMES;
})();
