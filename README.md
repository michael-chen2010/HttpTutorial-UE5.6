# HttpTutorial-UE5

> 《UE5网络编程：用VaRest连接你的游戏与世界》课程配套工程

本项目是B站课程 **《UE5网络编程：用VaRest连接你的游戏与世界》** 的官方配套教学工程。该项目在 **100%纯蓝图** 环境中，展示了如何使用强大的 **VaRest** 插件，构建一个专业、可复用、松耦合的HTTP通信系统。

---

## 最终成果 (Project Goal)

本项目实现了一个动态的“在线公告牌”功能，用于演示核心的HTTP通信流程：

*   **GET请求**: 游戏启动时，自动从服务器获取一个包含多个公告的JSON数组，并动态地在UI上创建并展示公告列表（包含标题、内容、日期）。
*   **POST请求**: 用户可以在UI上输入反馈信息，点击提交。程序会将反馈内容封装成JSON，并附加一个自定义的`API-Key`作为Header，通过POST请求发送到服务器。
*   **UI反馈**: 无论是请求成功还是失败，UI都会给出明确的提示，如“正在连接服务器...”、“反馈已发送！”或“网络错误”。

*(建议替换为你的项目截图)*

---

## 核心技术点 (Key Features)

*   **纯蓝图实现**: 全程无需编写一行C++代码，展示了蓝图在处理网络通信方面的强大能力。
*   **可复用的HTTP管理器 (`BP_HttpManager`)**: 设计并实现了一个全局的HTTP管理器Actor，负责处理项目中所有的HTTP请求，易于维护和扩展。
*   **事件驱动的松耦合架构**: 使用 **事件分发器 (Event Dispatchers)** 将HTTP管理器与UI逻辑完全解耦。UI只负责“订阅”它关心的事件（如`OnNewsReceived`），而管理器只负责“发布”结果，两者互不依赖。
*   **复杂的JSON数据处理**: 深入演示了如何使用VaRest节点来构造和解析复杂的JSON数据，包括：
    *   基础类型 (String, Number, Bool)
    *   嵌套对象 (JSON in JSON)
    *   **JSON数组 (Array)** 的遍历与解析
*   **自定义HTTP Header**: 演示了如何在请求中添加自定义Header（如`API-Key`），用于API验证或传递元数据。
*   **完整的错误处理流程**: 对`OnRequestComplete` (成功) 和 `OnRequestFail` (失败) 两种回调都进行了处理，确保了系统的健壮性。

---

## 架构设计 (Architecture)

本项目的核心是 `BP_HttpManager` Actor，它体现了一种在纯蓝图项目中管理全局系统的常用模式。

### 为什么使用Actor作为管理器？

*   **纯蓝图友好**: 无需C++即可创建和管理。
*   **全局唯一且持久**: 将其放置在持久关卡(Persistent Level)中，可以确保它在整个游戏生命周期中只有一个实例，并随游戏启动自动加载。
*   **功能完备**: Actor可以拥有自己的函数、事件和变量，足以胜任管理器的角色。

### 如何访问管理器？

本项目采用 `Get Actor Of Class` 节点来获取场景中唯一的 `BP_HttpManager` 实例。

**最佳实践**: 为了性能，我们不会在每次需要时都去调用 `Get Actor Of Class`。而是在蓝图（如UI Widget）的 `Event BeginPlay` 事件中获取一次，并将其**提升为变量(Promote to Variable)**进行缓存，后续直接使用这个变量即可。

### 如何实现通信解耦？

`BP_HttpManager` 内部定义了多个事件分发器，例如：
*   `OnNewsReceived (公告已接收)`
*   `OnNewsRequestFailed (公告请求失败)`
*   `OnFeedbackSuccess (反馈发送成功)`

任何其他蓝图（如UI）在获取到 `BP_HttpManager` 的引用后，只需**绑定(Bind)**这些事件。当管理器完成网络请求后，它会**调用(Call)**相应的事件分发器来广播结果。这种方式避免了管理器需要知道具体是哪个UI在监听它，实现了高度的解耦。

---

## 如何运行 (How to Run)

### 项目结构
本仓库包含两个主要部分：
*   `server/`: 一个简单的 **Node.js** Express服务器，为UE工程提供API接口。
*   `VarestTest/`: **Unreal Engine 5** 的项目工程文件。

### 步骤一：配置并运行本地服务器 (Node.js)

**UE工程依赖此服务器运行，请务必先启动服务器！**

1.  **安装 Node.js**: 如果你的电脑没有安装Node.js，请从 [官方网站](https://nodejs.org/) 下载并安装 (推荐LTS版本)。安装后会自动包含 `npm` 包管理器。

2.  **打开终端 (Terminal/CMD)**，并进入 `server` 目录：
    ```bash
    cd path/to/your/project/server
    ```

3.  **安装依赖**: 在 `server` 目录下，运行以下命令来安装所需的库 (express, cors, body-parser)：
    ```bash
    npm install
    ```

4.  **启动服务器**: 安装完成后，运行以下命令启动服务器：
    ```bash
    node server.js
    ```

5.  如果看到终端输出 `Server listening on port 3000`，则表示服务器已成功启动。请保持此终端窗口开启。

### 步骤二：运行Unreal Engine工程

1.  **环境要求**:
    *   Unreal Engine 5.6 (或兼容版本)
    *   确保本地服务器已按步骤一成功运行。

2.  **依赖插件**:
    *   [**VaRest Plugin**](https://www.fab.com/listings/5b751595-fe3e-4e85-b217-9b5496ab6d3f): 请确保已在引擎中安装并启用了此插件。

3.  **运行项目**:
    *   进入 `VarestTest` 目录，使用Unreal Engine打开 `VarestTest.uproject` 文件。
    *   打开主关卡 `Content/ThirdPerson/Maps/Lvl_ThirdPerson`。
    *   点击 **运行 (Play)** 即可看到效果。

### 核心蓝图文件

*   `Content/Blueprints/BP_HttpManager`: 核心HTTP通信管理器，所有GET/POST逻辑都在这里实现。
*   `Content/Blueprints/BP_Test`: 玩家角色蓝图，负责创建UI并触发HTTP请求。
*   `Content/Blueprints/UI/UI_BulletinBoard`: 公告板的主UI控件。
*   `Content/Blueprints/ListView/UI_AnnouncementEntry`: 用于ListView中单条公告的条目UI。
*   `Content/Blueprints/ListView/BP_AnnouncementData`: 用于ListView的数据资产对象。

---

## 代码实现亮点 (Code Highlights)

### GET请求：获取在线公告

位于 `BP_HttpManager` 的 `RequestNews` 函数中：
1.  使用 `Call URL` 节点发起一个GET请求。
2.  在 `OnRequestComplete` 回调中，获取响应内容(JSON字符串)。
3.  使用 `Get Array Field` 从根JSON对象中提取出名为 "newsItems" 的数组。
4.  使用 `For Each Loop` 遍历该JSON数组。
5.  在循环内部，从每个数组成员（本身也是一个JSON对象）中提取 "title" 和 "content" 字段。
6.  将解析出的数据填充到 `S_NewsItem` 结构体中，并添加到一个结构体数组变量里。
7.  循环结束后，调用 `OnNewsReceived` 事件分发器，将整个结构体数组广播出去。

### POST请求：提交玩家反馈

位于 `BP_HttpManager` 的 `SendFeedback` 函数中：
1.  使用 `Construct VaRest Request` 开始手动构建一个请求对象。
2.  调用 `Set Header` 节点，添加 `API-Key`。
3.  调用 `Set Verb` 节点，将请求方法设置为 `POST`。
4.  使用 `Construct VaRest JSON Object` 创建一个新的JSON对象作为请求体(Body)。
5.  使用 `Set String Field` 和 `Set Number Field` 向JSON对象中填充 "feedback" 和 "timestamp" 数据。
6.  调用 `Set Request Object` 将构造好的JSON对象设置到请求中。
7.  最后，调用 `Process URL` 执行这个手动构造的请求。

---

## 许可证 (License)

本项目采用 [MIT License](LICENSE)。
