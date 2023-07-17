const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
// const {HttpsProxyAgent} = require('https-proxy-agent');

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
app.use('/images/create', imageProxy)

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