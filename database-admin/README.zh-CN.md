# Navicat 数据库管理资料

根据用户提供的最新要求，Navicat 替代本项目原计划的网页管理端。本目录不是 Angular 管理应用。此前 PDF 与最新要求不同，变更依据见 `../docs/DECISIONS.md`。

## 使用方式

1. 启动或取得可连接的 MySQL 服务。Navicat 是连接和管理工具，不能替代 MySQL 服务。
2. 在 Navicat 创建 MySQL 连接，填写实际主机、端口、用户名和密码。开发与学校数据库分开配置，不公开或打包连接凭据。
3. 在指定的新空数据库运行最终 SQL。当前候选 SQL 在 `../api/database/charityevents-a3.sql`，尚待完整导入和约束验收，不能视为最终已验证版本。
4. 查看 organisations、categories、events、registrations 四张表及外键关系。
5. 在 events 表查看所有活动，包括过去和暂停活动；按需要新增或修改活动，选择真实存在的 category_id 和 organisation_id。
6. 以 event_id 筛选 registrations 查看报名；用 `inspection.sql` 中的查询核对顺序、票数和关联关系。
7. 只在隔离测试数据库验证删除：无报名活动可删除；已有报名的活动应由外键阻止删除，不关闭外键检查绕过保护。
8. 完成修改后刷新网站和 API，确认变化实际显示。新增报名仍从公众报名页经 API 保存，Navicat 用于核查保存结果。
9. 导出最终数据库时包含表结构和数据，保存为一个 SQL 文件；在另一个空测试数据库导入，验证可复现后再交付。

## 后续实施必须验证

- 直接在 Navicat 编辑数据会绕过 Node 的输入验证。日期先后、非负金额、正整数票数、邮箱规范化等须在数据库侧适当地约束，并在实际 MySQL 版本上测试。
- 任何 CREATE/ALTER/DELETE 测试均在独立测试库进行，不对 A2 或学校现有数据执行破坏性验证。
- 当前按本地 MySQL 和 Navicat 管理配置，不需要 cPanel，也不要求配置学校远程数据库访问。
- 原定第三个压缩包保留 adminside 命名时，包内必须标明其内容是 SQL 与 Navicat 管理说明，不能宣称实现了网页管理端。

当前尚未连接或操作用户的 Navicat，也没有完成本目录所述验收。
