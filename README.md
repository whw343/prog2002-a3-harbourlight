# Harbourlight A3

本地运行的慈善活动网站：Angular 22.2.3、TypeScript 6、HTML、CSS、Node.js/Express、MySQL 和 Open-Meteo 天气 API。数据库通过 Navicat 管理；根据用户最新要求，不提供自建网页管理端，不要求 cPanel。

## 当前成果

- 公众首页、组合筛选、活动详情、报名和确认导航。
- MySQL 活动/分类/机构/报名模型，12 条活动及 12 条初始报名。
- 数据库唯一约束、外键及触发器，直接使用 Navicat 编辑也保留关键校验。
- 对应活动日期的天气及不可用提示；13 张本地授权实景照片及 SVG 故障备用图，不依赖远程字体。
- 完整源码、锁文件、编译产物、测试、运行及数据库管理说明。

[API 运行说明](api/README.md) · [客户端运行说明](clientside/README.md) · [Navicat 管理](database-admin/README.zh-CN.md) · [架构](docs/ARCHITECTURE.md) · [验收记录](docs/VERIFICATION.md) · [演示操作](docs/DEMO-GUIDE.zh-CN.md)

## 本机预览

http://localhost:4201/

本机已配置隔离的 A3 MySQL（127.0.0.1:4338），Navicat 连接名 Harbourlight A3。私有配置放在忽略的 `.runtime/` 和 `api/.env`，不在交付包里。服务关闭后，可使用兼容 Node 运行 `tools/start-current-local.cjs`。其他电脑按各包 README 配置，不依赖本机路径。

## 三包与团队

两位成员获得同一小组作品，分别准备 clientside、api、adminside 三个包。adminside 是 SQL 和 Navicat 管理资料，不是网页应用。文件名前缀暂按 GitHub 账号 whw343 / daitongxiao 区分，不把账号自动视为学校指定的 username。

团队公开仓库：https://github.com/whw343/prog2002-a3-harbourlight 。Codex 提交如实标记为辅助实现，不伪造两人的个人贡献。课程需要的视频、互评、教师访问及最终提交由成员按实际要求完成，源码完成不代表这些事项已经完成。

[需求变更记录](docs/DECISIONS.md) 优先于早期分析。旧 PDF 的管理端/cPanel 条款与用户提供的最新要求不同，该差异已保留记录。
