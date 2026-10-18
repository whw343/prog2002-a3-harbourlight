# Navicat 数据库管理资料

根据用户提供的最新要求，Navicat 替代本项目原计划的网页管理端。本目录不是 Angular 管理应用。此前 PDF 与最新要求不同，变更依据见项目的最新决策记录。第三个 adminside 压缩包包含本目录、最终 SQL 和技术说明。

## 使用方式

1. 启动或取得可连接的 MySQL 服务。Navicat 是连接和管理工具，不能替代 MySQL 服务。
2. 在 Navicat 创建 MySQL 连接，填写实际主机、端口、用户名和密码，不公开或打包连接凭据。
3. 在指定的新空数据库运行 `charityevents-a3.sql`（打包时放入本目录；源码主文件在 `../api/database/charityevents-a3.sql`）。使用“运行 SQL 文件”导入完整脚本，支持其中的 DELIMITER 和触发器。
4. 查看 organisations、categories、events、registrations 四张表及外键关系。
5. 在 events 表查看所有活动，包括过去和暂停活动；按需要新增或修改活动，选择真实存在的 category_id 和 organisation_id。
6. 以 event_id 筛选 registrations 查看报名；用 `inspection.sql` 中的查询核对顺序、票数和关联关系。
7. 只在隔离测试数据库验证删除：无报名活动可删除；已有报名的活动应由外键阻止删除，不关闭外键检查绕过保护。
8. 完成修改后刷新网站和 API，确认变化实际显示。新增报名仍从公众报名页经 API 保存，Navicat 用于核查保存结果。
9. 导出最终数据库时包含表结构和数据，保存为一个 SQL 文件；在另一个空测试数据库导入，验证可复现后再交付。

## 数据约束与运行说明

- 直接在 Navicat 编辑会绕过 Node 校验。SQL 中的触发器、外键和唯一键在数据库侧保护日期先后、非负金额、票数和邮箱唯一性，已在隔离 MySQL 5.7.26 中测试。不依赖该版本不会执行的 CHECK 子句。
- start_at_utc、end_at_utc 使用 UTC；start_local_date 由触发器按悉尼时区规则更新。报名时间由数据库生成 UTC，修改报名不会重写首次报名时间。
- 新增活动时填写有效的 organisation_id、category_id、名称、时间、地点、用途和说明等字段。经纬度用于活动日天气。票价不是实际支付功能，筹款金额不因报名自动增加。
- 可用状态由 is_suspended 和结束时间确定。过去活动保留管理可见，但不接受公众报名；暂停活动不通过公众列表或详情展示。
- 任何 CREATE/ALTER/DELETE 测试均在独立测试库进行，不对 A2 或学校现有数据执行破坏性验证。
- 当前按本地 MySQL 和 Navicat 管理配置，不需要 cPanel，也不要求配置学校远程数据库访问。
- 原定第三个压缩包保留 adminside 命名时，包内必须标明其内容是 SQL 与 Navicat 管理说明，不能宣称实现了网页管理端。

2026-10-18，用户已在本机 Navicat Premium Lite 18 成功连接 A3 数据库，并提供打开 events 表、显示 12 条记录的截图。直接 SQL 的新增、修改、删除保护和报名约束由自动化集成测试另行验证。这不代表所有 Navicat 菜单都做过自动化操作。

在另一台电脑使用时自行配置 MySQL 连接。Navicat 不包含在本源码包中，不打包注册码、账号或本机连接配置。安装到 D 盘的 Navicat 程序与网站源码包独立。
