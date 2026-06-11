# 向野兴趣探索测评

基于统一 v2 题库的分龄兴趣与成长方向探索工具，支持 L1 小学、L2 初中、L3 高中、L4 大学及以上。

## 隐私边界

- 不要求注册，不收集姓名、学校等身份信息。
- 答案和结果只保存在当前页面内存中，不写入浏览器持久化存储或数据库。
- 不建立个人档案、样本库或常模库。
- AI 解读由用户主动选择，只发送匿名汇总分数；不发送逐题答案。
- 未配置 AI 密钥或 AI 调用失败时，自动使用本地模板报告。

## 本地运行

需要 Node.js 20.9 或更高版本。

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`DEEPSEEK_API_KEY` 是可选配置。留空时所有报告均使用本地模板。

## 上线前验证

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

## Vercel 部署

1. 导入 GitHub 仓库 `240744587-del/interest-test`。
2. 将 Root Directory 设置为 `app`。
3. Framework Preset 选择 Next.js，其余构建命令使用默认值。
4. 如需 AI 解读，在环境变量中配置 `DEEPSEEK_API_KEY`；不配置也可正常上线。
5. 部署后分别检查首页、四个教育阶段入口、完整答题、低证据报告和 `/api/report`。

正式公开面向未成年人前，仍需对未成年人使用流程、第三方 AI 数据处理和隐私文本完成专项合规评估。
