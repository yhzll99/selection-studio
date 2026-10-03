# 选品研习社 · Selection Studio

开源的服饰与宠物选品研究工作台，将需求线索、候选商品、成本测算、验证任务和经验 Wiki 串在一起。

React + TypeScript + vinext + Cloudflare D1。MIT 许可证。生产部署依赖可信登录网关，开源代码不包含站点账号、凭据或用户数据。

## 第一次使用

1. 点击右上角「查看示例」，浏览服饰与宠物的完整研究路径。示例全部虚构且只读。
2. 点击「返回我的工作台」→「记录新线索」。记录实际遇到的问题、原始来源及日期。
3. 保存线索后打开详情，点击「建立候选商品」，补充供应商、商品属性与成本。
4. 点击「建立验证任务」，先定义测试方法与通过标准，再记录实际结果。
5. 验证完成后点击「整理为 Wiki」，保留结论、证据和适用边界。

## 功能说明

- 按品类、状态、关键词筛选；按更新、创建时间或标题排序。
- 候选商品支持 2–4 项对比。未知成本必须留空，不能用 0 代替。
- 单笔贡献利润 = 到手售价 − 采购 − 包装 − 物流 − 平台费用 − 获客 − 售后；不含固定成本和税费，不等于净利润。平台费按售价比例估算。
- 标记事实时必须填写来源和采集日期；完成验证必须填写结果；推进或放弃商品必须填写依据。
- 记录按账号隔离；同一账号可跨设备使用。负责人为记录字段，不代表团队权限或共享。
- 保存采用版本校验；冲突或服务失败保留表单内容。删除进入回收站，可恢复。
- 数据与备份：JSON 保留全部有效记录与关联，CSV 适合分析。回收站与操作日志不包含在备份内。
- JSON 导入上限 5000 条、20 MB，分批追加。已有编号会跳过（包含回收站），不会覆盖已有记录。中断可重试。
- 最近操作展示 200 次；浏览器支持 WebMCP 时提供查询与准备表单工具，准备表单不会自动保存。

## 范围

本工具支持手动录入和证据整理。未连接电商平台，不提供实时销量、自动抓取、AI 爆款预测、供应商下单、支付或库存管理。它不是多人共享工作区；不提供组织角色管理、附件存储或合规认证承诺。

## 本地开发

需要 Node.js 22.13+ 和 npm。

```sh
git clone https://github.com/yhzll99/selection-studio.git
cd selection-studio
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_illegal_mantis.sql
npm run dev
```

打开终端提示的本地地址（默认 http://localhost:5173）。上述 SQL 仅对全新本地数据库执行一次；不要对已有数据库重复执行。修改数据库模型后使用 `npm run db:generate` 生成新的迁移。

本地预览统一使用模拟身份，仅用于开发。不要将开发服务器开放到公网。

## 生产部署

默认运行环境为 Sites：平台接管登录身份、D1 数据库与迁移。仓库中的 `.openai/hosting.json` 只保留逻辑数据库绑定。请创建自己的 Site 并写入平台返回的项目 ID，不能复用原作者的站点编号。

自行部署到其他 Cloudflare Workers 环境时，必须先配置 D1、迁移和可信身份网关。服务端读取 `oai-authenticated-user-id`；网关必须移除用户自行发送的同名头，并在验证身份后注入真实用户 ID，且阻止绕过网关直接访问 Worker。否则客户端可伪造身份。详见 [SECURITY.md](SECURITY.md)。本仓库未实现独立 OAuth 登录。

## 验证

```sh
npm test
node node_modules/typescript/bin/tsc --noEmit
npm run start
TEST_BASE=http://127.0.0.1:8787 node --experimental-strip-types tests/api.test.mjs
```

API 测试仅对本地构建 Worker 运行，使用专用测试身份，不要针对真实生产用户运行。UI 测试 `tests/ui-smoke.cjs` 使用 Playwright 和本机 Chrome；通过 `PLAYWRIGHT_MODULE`、`CHROME_PATH` 指定环境路径。覆盖创建、刷新持久化、商品成本、验证、Wiki、示例比较、移动端和未保存内容保护。

源码：React / TypeScript / vinext，数据库：Cloudflare D1（SQLite）。所有正式业务数据由服务端保存，不使用浏览器 localStorage 充当数据库。

## 贡献与许可

欢迎提交 Issue 和 Pull Request，操作步骤见 [CONTRIBUTING.md](CONTRIBUTING.md)。项目新增代码采用 [MIT](LICENSE)；第三方代码保留原有许可，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
