// server-check.js - 自动检测服务器状态
function detectLocalServer() {
    return new Promise((resolve) => {
        // 尝试常见端口
        const ports = [8000, 8080, 3000, 5000];
        const promises = [];
        
        ports.forEach(port => {
            promises.push(
                fetch(`http://localhost:${port}`)
                    .then(() => port)
                    .catch(() => null)
            );
        });
        
        Promise.all(promises).then(results => {
            const activePort = results.find(port => port !== null);
            resolve(activePort || 8000); // 默认返回8000
        });
    });
}

// 获取本机IP地址
function getLocalIP() {
    return new Promise((resolve) => {
        // 尝试通过WebRTC获取内网IP
        const pc = new RTCPeerConnection({iceServers: []});
        pc.createDataChannel('');
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(() => resolve(''));
        
        pc.onicecandidate = (ice) => {
            if (ice && ice.candidate && ice.candidate.candidate) {
                const candidate = ice.candidate.candidate;
                const regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                const matches = candidate.match(regex);
                if (matches && matches[1]) {
                    const ip = matches[1];
                    if (ip.startsWith('192.168.') || 
                        ip.startsWith('10.') || 
                        ip.startsWith('172.')) {
                        resolve(ip);
                        pc.close();
                    }
                }
            }
        };
        
        setTimeout(() => resolve(''), 1000);
    });
}

// 启动本地服务器（如果可能）
function startLocalServer() {
    if (typeof window.startPythonServer === 'function') {
        window.startPythonServer();
        return true;
    }
    return false;
}

window.detectLocalServer = detectLocalServer;
window.getLocalIP = getLocalIP;
window.startLocalServer = startLocalServer;