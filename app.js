const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
// const {HttpsProxyAgent} = require('https-proxy-agent');
const axios = require("axios");

// HTTP Proxy
// const httpProxyUrl = 'http://127.0.0.1:7890';
// const socks5Agent = new HttpsProxyAgent(httpProxyUrl);

// Create Express app
const app = express();
const socketProxy = createProxyMiddleware({
    target: 'https://sydney.bing.com',
    pathFilter: '/sydney/ChatHub',
    ws: true,
    changeOrigin: true,
    // agent: socks5Agent,
    headers: {
        origin: 'https://www.bing.com',
        Referer: 'https://www.bing.com/search?q=Bing+AI&showconv=1&FORM=hpcodx',
        'x-forwarded-for': generateRandomIP(),
    }
});
const createConversationProxy = createProxyMiddleware({
    target: 'https://edgeservices.bing.com',
    pathRewrite: {
        '^/': '/edgesvc/', // rewrite path
    },
    changeOrigin: true,
    // pathFilter: '/turing/conversation/create',
    // agent: socks5Agent,
    headers: {
        origin: 'https://www.bing.com',
        Referer: 'https://www.bing.com/search?q=Bing+AI&showconv=1&FORM=hpcodx',
        'x-forwarded-for': generateRandomIP(),
    }
})
const imageProxy = createProxyMiddleware({
    target: 'https://www.bing.com',
    changeOrigin: true,
    // pathFilter: '/turing/conversation/create',
    // agent: socks5Agent,
    headers: {
        origin: 'https://www.bing.com',
        Referer: 'https://www.bing.com/search?q=Bing+AI&showconv=1&FORM=hpcodx',
        'x-forwarded-for': generateRandomIP(),
    }
})
// Proxy WebSocket requests
app.use('/sydney/ChatHub', socketProxy);
app.use('/turing/conversation/create', createConversationProxy)
// app.use('/images/create', imageProxy)
app.use('/edgesvc/turing/captcha/create', async (req, res) => {
    let result = await axios.get("https://edgeservices.bing.com/edgesvc/turing/captcha/create", {
        responseType: 'arraybuffer',
        headers: {
            Cookie: req.headers.cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.82',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
        // httpsAgent: socks5Agent,
    })
    const headers = result.headers;
    Object.keys(headers).forEach((headerName) => {
        res.set(headerName, headers[headerName]);
    });
    res.send(result.data);
})
app.use('/edgesvc/turing/captcha/verify', async (req, res) => {
    let result = await axios.get("https://edgeservices.bing.com/edgesvc/turing/captcha/verify", {
        params: req.query,
        headers: {
            Cookie: req.headers.cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.82',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
        // httpsAgent: socks5Agent,
    })
    const headers = result.headers;
    Object.keys(headers).forEach((headerName) => {
        res.set(headerName, headers[headerName]);
    });
    res.send(result.data);
})
app.post('/images/create', async (req, res) => {
    console.log("images")
    axios.request({
        url: "https://www.bing.com/images/create",
        data: req.body,
        method: 'POST',
        params: req.query,
        headers: {
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'content-type': 'application/x-www-form-urlencoded',
            referrer: 'https://www.bing.com/images/create/',
            origin: 'https://www.bing.com',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.50',
            Cookie: req.headers.cookie,
            Dnt: '1',
            'sec-ch-ua': '"Microsoft Edge";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
            'sec-ch-ua-arch': '"x86"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-full-version': '"113.0.5672.126"',
            'sec-ch-ua-full-version-list': '"Google Chrome";v="113.0.5672.126", "Chromium";v="113.0.5672.126", "Not-A.Brand";v="24.0.0.0"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '',
            'sec-ch-ua-platform': '"macOS"',
            'sec-ch-ua-platform-version': '"13.1.0"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'Referrer-Policy': 'origin-when-cross-origin',
            'x-edge-shopping-flag': '1'
        },
        // httpsAgent: socks5Agent,
        maxRedirects: 0,
        validateStatus: (status) => {
            return status === 302 || (status >= 200 && status < 300); // 自定义响应状态码的验证函数
        },
    }).then(result => {
        if (result.status === 302) {
            const headers = result.headers;
            Object.keys(headers).forEach((headerName) => {
                res.set(headerName, headers[headerName]);
            });
            res.redirect(headers.get('location'))
        } else {
            res.status(500)
        }
    })

})
// Start the server
const port = 3000;  // Replace with your desired port number
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function generateRandomIP () {
    const baseIP = '20.136.128'
    const subnetSize = 254 // 2^8 - 2
    const randomIPSuffix = Math.floor(Math.random() * subnetSize) + 1
    let ip = baseIP + randomIPSuffix
    return ip
}