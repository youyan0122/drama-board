// 使用公开的跨域影视接口
const apiServer = "https://cj.lziapi.com/api.php/provide/vod/?ac=detail&wd=";
// 视频解析接口（无广告）
const jxApi = "https://jx.lfeifei.cn/?url=";
// 备用解析接口: https://api.pangujiexi.com/player.php?url=

// 回车键触发查询
function handleKeyDown(event) {
    if (event.key === 'Enter') {
        searchShow();
    }
}

async function searchShow() {
    const keywordInput = document.getElementById('keyword');
    const searchBtn = document.getElementById('searchBtn');
    const keyword = keywordInput.value.trim();
    
    if (!keyword) return alert('请输入电视剧名称！');

    // 设置加载状态
    searchBtn.disabled = true;
    searchBtn.innerText = '查询中...';

    try {
        // 1. 向开源资源站请求电视剧的最新数据
        const response = await fetch(apiServer + encodeURIComponent(keyword));
        const data = await response.json();

        if (!data.list || data.list.length === 0) {
            alert('未找到该电视剧，请换个关键词试试');
            return;
        }

        // 2. 提取最新的一条影视数据
        const show = data.list[0];
        
        // 3. 渲染到网页上
        document.getElementById('showTitle').innerText = show.vod_name;
        document.getElementById('showStatus').innerText = show.vod_remarks || '已完结';
        
        // 4. 解析剧集列表
        const epContainer = document.getElementById('epList');
        epContainer.innerHTML = ''; // 清空旧列表
        
        const episodes = show.vod_play_url.split('#');
        episodes.forEach((ep, index) => {
            const epInfo = ep.split('$');
            if (epInfo.length >= 2) {
                const btn = document.createElement('div');
                btn.className = 'ep-btn';
                btn.innerText = epInfo[0]; // 第X集
                btn.dataset.url = epInfo[1];
                btn.onclick = function() {
                    playVideo(epInfo[1], btn);
                };
                epContainer.appendChild(btn);
            }
        });

        // 显示看板
        document.getElementById('infoCard').style.display = 'block';
        
        // 每次搜索时隐藏播放器，直至用户点击某集开始播放
        document.getElementById('videoBox').style.display = 'none';
        document.getElementById('player').src = '';
        document.getElementById('directLink').style.display = 'none';

    } catch (error) {
        alert('数据加载失败，请检查网络');
        console.error(error);
    } finally {
        // 还原按钮状态
        searchBtn.disabled = false;
        searchBtn.innerText = '查询追剧';
    }
}

function playVideo(videoUrl, activeBtn) {
    const videoBox = document.getElementById('videoBox');
    const player = document.getElementById('player');
    const directLink = document.getElementById('directLink');

    // 拼接解析接口进行播放
    const playUrl = jxApi + encodeURIComponent(videoUrl);
    player.src = playUrl;
    videoBox.style.display = 'block';

    // 设置手机端直接播放链接
    directLink.href = playUrl;
    directLink.style.display = 'flex';

    // 高亮选中剧集
    const allBtns = document.querySelectorAll('.ep-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // 手机端自动平滑滚动到播放器位置
    setTimeout(() => {
        videoBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}
