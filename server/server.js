// -----------------------------------------------------------------------------
//  UE5 VaRest课程 - 配套Node.js服务器
//  作者: [您的名字/ID]
//
//  功能:
//  - 提供一个 /news GET接口，返回新闻列表
//  - 提供一个 /feedback POST接口，接收玩家反馈并验证API-Key
//
//  运行步骤:
//  1. npm init -y
//  2. npm install express cors
//  3. node server.js
// -----------------------------------------------------------------------------

// 导入所需的库
const express = require('express'); // Express框架，用于快速搭建Web服务器
const cors = require('cors');     // CORS库，用于解决跨域请求问题

// 创建Express应用实例
const app = express();
const PORT = 3000; // 定义服务器监听的端口号

// --- 中间件 (Middleware) ---
// 中间件是在请求到达路由处理器之前执行的函数

// 1. 使用CORS中间件
// 允许来自任何源的请求。在开发环境中，UE客户端和此服务器不在同一“域”，
// 所以需要它来允许通信。
app.use(cors());

// 2. 使用Express内置的JSON解析中间件
// 这个中间件会自动解析请求体中的JSON数据，并将其放入 req.body 中。
app.use(express.json());


// --- 模拟数据库中的数据 ---
const newsData = {
    news: [
        {
            "title": "欢迎来到我们的世界！",
            "content": "服务器已成功启动，准备好迎接来自UE5的探险家们。",
            "date": "2025-07-23"
        },
        {
            "title": "本周末活动预告：双倍经验！",
            "content": "所有玩家将在本周末获得双倍经验值，快来升级吧！",
            "date": "2025-07-22"
        },
        {
            "title": "版本更新 v1.1",
            "content": "修复了若干bug，并增加了一个新的神秘区域等待探索。",
            "date": "2025-07-20"
        }
    ]
};

const data = 
{
  "metadata": 
  {
    "creationDate": "2023-10-15T14:30:00Z",
    "lastModified": "2023-10-20T09:15:33Z",
    "version": "1.5.2",
    "isActive": true,
    "tags": ["test", "complex", "json", "sample"],
    "securityLevel": 8
  },
  
  "personalInfo": 
  {
    "name": "Alex Johnson",
    "age": 35,
    "isEmployed": true,
    "contact": {
      "email": "alex.j@example.com",
      "phones": [
        {
          "type": "mobile",
          "number": "+1-555-123-4567",
          "isPrimary": true
        },
        {
          "type": "work",
          "number": "+1-555-987-6543",
          "extension": 102
        }
      ]
    }
  }
};
// --- API 路由 (Routes) ---

// 路由1: GET /news
// 当收到对 http://localhost:3000/news 的GET请求时，执行此函数
app.get('/news', (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /news -> 请求已收到`);

    // 使用 res.json() 将我们的新闻数据数组作为JSON格式响应发送回客户端
    res.status(200).json(newsData);
});


// 路由2: POST /feedback
// 当收到对 http://localhost:3000/feedback 的POST请求时，执行此函数
app.post('/feedback', (req, res) => {
    console.log(`[${new Date().toISOString()}] POST /feedback -> 请求已收到`);

    // --- 1. 验证Header中的API-Key ---
    const EXPECTED_API_KEY = 'ue5-is-awesome-123'; // 这是我们和客户端约定好的“暗号”
    const receivedApiKey = req.headers['api-key']; // 获取请求头中的'api-key'字段

    console.log("收到的API-Key:", receivedApiKey);

    if (receivedApiKey !== EXPECTED_API_KEY) {
        console.log("-> 验证失败: API-Key无效或缺失。");
        // 如果密钥不匹配或不存在，返回401 Unauthorized错误
        return res.status(401).json({ error: 'Invalid or missing API-Key' });
    }

    console.log("-> API-Key验证通过。");

    // --- 2. 解析请求体(Body)中的JSON数据 ---
    const { metadata, personalInfo } = req.body; // 从解析后的JSON中提取数据

    // 简单验证一下数据是否存在
    if (!metadata) {
        console.log("-> 数据无效: metadata字段缺失。");
        // 如果缺少必要数据，返回400 Bad Request错误
        return res.status(400).json({ error: 'metadata field is missing in the request body' });
    }

    // 在服务器控制台打印收到的反馈，模拟将其存入数据库
    console.log("-> 成功收到并处理反馈:");
    console.log(`   - 反馈metadata内容: ${JSON.stringify(metadata)}`);
    console.log(`   - 客户信息: ${JSON.stringify(personalInfo)}`);

    // --- 3. 发送成功响应 ---
    // 返回200 OK状态码，并附带一个JSON消息，告诉客户端操作成功
    res.status(200).json({
        status: 'success',
        message: 'Feedback received successfully!',
        receivedData: req.body // 将收到的数据再发回去，方便客户端调试
    });
});


// --- 启动服务器 ---
// 让服务器开始在指定的端口上监听传入的请求
app.listen(PORT, () => {
    console.log('----------------------------------------------------');
    console.log(`UE5 VaRest Course Server is running on http://localhost:${PORT}`);
    console.log('----------------------------------------------------');
    console.log('准备接收请求...');
    console.log(`- GET http://localhost:${PORT}/news`);
    console.log(`- POST http://localhost:${PORT}/feedback (需要Header: 'api-key': 'ue5-is-awesome-123')`);
});
