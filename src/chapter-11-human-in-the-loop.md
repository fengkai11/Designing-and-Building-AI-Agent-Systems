# 第 11 章：Human-in-the-loop：人机协同与审批系统

> Human-in-the-loop 最适合放在闭环里理解。先看这张图，再阅读审批、人工干预和反馈机制，会更清晰。

![图 11-13-1 人机协同、评估与可观测闭环图](figures/fig-11-13-01-human-eval-observability-loop.png)

*图 11-13-1 人机协同、评估与可观测闭环图*


前面几章，我们已经把 Agent 从一次性问答逐步推进到了更接近真实系统的形态：它可以通过 Agent Loop 持续执行，可以通过工具系统访问外部能力，可以通过上下文工程保持工作记忆，可以通过 Planning 制定步骤，可以通过 Memory 和 RAG 使用长期信息与外部知识，也可以通过调度、状态和恢复机制支持长时间任务。

到这里，一个很自然的问题会出现：既然 Agent 已经能理解目标、调用工具、保存状态、持续运行，那么是不是应该让它尽可能自主？

很多人第一次做 Agent 产品时，都会有这个冲动。我们希望它像真人员工一样，拿到目标后自己完成全部工作：自己找客户、自己写邮件、自己发送；自己读代码、自己修改、自己提交；自己分析学生情况、自己安排学习任务、自己通知家长。越自动，似乎越智能；越少人工参与，似乎越先进。

但真实工程经验恰恰相反。一个可用的 Agent 系统，不是把人从系统里彻底移除，而是要重新设计人和 AI 的分工。Agent 负责信息密集、重复、初步判断和低风险执行；人负责目标设定、边界确认、风险决策、价值判断和最终责任。

Human-in-the-loop，通常翻译为“人在环”或“人机协同”，不是 Agent 能力不足时的临时补丁，而是真实 Agent 系统的基础结构。尤其当 Agent 接入邮件、文件系统、代码仓库、数据库、CRM、浏览器、支付、生产系统等真实工具时，人机协同和审批机制决定了系统能不能安全上线。

本章要解决的问题是：如何设计一个既能释放 Agent 自动化能力，又能让人类在关键节点保持控制权的审批系统。

---

## 11.1 人机协同不是降低智能，而是提高可用性

很多人把“人工确认”理解成智能不足的表现：如果 Agent 真的足够强，为什么还需要人确认？

这个理解是错误的。

在人类组织中，审批并不意味着执行者不聪明。一个采购员可以很专业，但超过一定金额仍然需要主管审批；一个工程师可以很优秀，但代码合并前仍然需要 code review；一个销售可以很有经验，但重大报价仍然需要经理确认。审批不是否定执行者，而是把风险、责任和权力放在合适的位置。

Agent 系统也是如此。

比如外贸客户开发 Agent 找到 100 个潜在客户，并为其中 30 个客户生成开发信。生成开发信这个动作可以自动完成，但发送邮件不应该默认自动完成。原因不是模型不会写邮件，而是邮件发送涉及品牌形象、客户关系、合规风险和机会成本。一封错误开发信发出去，可能导致客户反感；重复发送，可能被标记为垃圾邮件；写错产品信息，可能损害信任。

再比如代码开发 Agent 修改了一个后端接口。它可以自动运行测试，但不应该直接合并到主分支。因为测试覆盖可能不完整，业务影响可能超出模型理解，某些改动虽然语法正确却破坏产品逻辑。人类 review 仍然必要。

教育 Agent 也是一样。它可以根据学生错题推荐练习，但如果要向家长发送“学生能力评价报告”，就应该经过老师确认。因为评价会影响家长判断和学生心理，不能完全交给模型自动生成。

所以，人机协同的意义不是“AI 不行，所以让人补救”，而是“AI 能做很多事，但系统必须把不同风险级别的决策放在不同控制层”。

一个成熟 Agent 系统应该回答三个问题：

第一，哪些事情 Agent 可以自动做？

第二，哪些事情 Agent 可以准备，但必须由人确认后执行？

第三，哪些事情 Agent 永远不应该做？

这三个问题构成了审批系统的起点。

---

## 11.2 从风险级别设计自主性边界

设计人机协同时，不能简单地说“重要操作都要确认”。这句话太笼统，无法指导工程实现。更可行的方法，是按照风险级别对 Agent 行为进行分层。

可以把 Agent 动作分成四类。

第一类是低风险动作，可以自动执行。例如读取公开网页、总结文章、计算数值、生成草稿、对已有数据做分类、在本地临时状态中记录中间结果。这些动作即使出错，也不会直接造成外部损失。它们适合自动化。

第二类是中风险动作，可以自动执行但需要可追踪。例如写入内部草稿、更新任务状态、给候选客户打分、标记某条线索为低优先级。这些动作会影响后续流程，但通常可以修改和回滚。因此需要日志、版本和审计，但不一定每一步都人工确认。

第三类是高风险动作，必须人工确认。例如发送邮件、修改生产数据库、提交代码、删除文件、向客户报价、向用户推送正式评价、更新 CRM 中的重要字段。这些动作一旦执行，可能对外部世界产生影响，或对组织流程造成真实后果。

第四类是禁止动作，即使用户要求也不应该开放给 Agent 自动执行。例如绕过权限、读取无授权数据、执行危险系统命令、向未知地址发送敏感信息、自动生成虚假身份、绕过平台规则进行批量骚扰。这类动作应在工具层直接禁止，而不是交给模型判断。

以外贸 Agent 为例，可以这样分层：

```text
低风险：搜索公开公司信息、读取官网、生成客户摘要。
中风险：给客户评分、标记客户类型、保存候选客户。
高风险：发送开发信、导出完整客户邮箱列表、修改客户跟进状态。
禁止动作：伪造客户身份、绕过退订、对同一客户高频轰炸式发送邮件。
```

以代码 Agent 为例：

```text
低风险：读取文件、搜索代码、运行静态分析。
中风险：修改本地工作区文件、生成 patch、运行测试。
高风险：删除文件、执行 shell 命令、提交 git commit、推送远程分支。
禁止动作：执行 rm -rf /、上传密钥、关闭安全检查、修改系统级配置。
```

以教育 Agent 为例：

```text
低风险：批改练习、解释错题、生成复习建议。
中风险：更新学生错因标签、推荐练习计划。
高风险：向家长发送正式学习报告、调整课程安排、标记学生长期能力缺陷。
禁止动作：生成羞辱性评价、未经授权公开学生隐私、替代老师做重大教育结论。
```

这个分层看起来简单，但它会直接影响系统架构。工具系统需要知道每个工具的风险级别；Agent Runtime 需要在高风险动作前暂停；前端需要展示待审批事项；状态机需要支持“等待人工确认”；日志系统需要保存审批记录；权限系统需要知道谁有权批准。

因此，自主性不是一个 prompt 里的形容词，而是一个可以工程化配置的系统属性。

---

## 11.3 审批系统的核心对象：Action Proposal

要让人参与 Agent 流程，首先要定义“人到底审批什么”。

很多系统设计得很粗糙：Agent 执行到某一步时，把一段自然语言展示给用户，问“是否继续”。用户看到的是一大段模型解释，不知道具体要批准哪个动作，也不知道批准后的后果。这种审批没有工程意义。

更好的方式，是让 Agent 在高风险动作前生成一个结构化的 Action Proposal，也就是“动作提案”。

一个动作提案至少应该包含以下字段：

```python
class ActionProposal:
    id: str
    task_id: str
    proposed_by: str
    action_type: str
    risk_level: str
    summary: str
    reason: str
    inputs: dict
    expected_effect: str
    reversible: bool
    rollback_plan: str | None
    created_at: datetime
    status: str
```

这些字段不是形式主义，而是为了让审批变得可理解、可审计、可追责。

例如，外贸 Agent 准备发送一封开发信时，动作提案可以是：

```json
{
  "action_type": "send_email",
  "risk_level": "high",
  "summary": "向 Riyadh Tools Trading 发送钢卷尺开发信",
  "reason": "该公司官网显示其经营五金工具批发，目标市场与产品匹配度较高，邮箱来源为官网 contact 页面。",
  "inputs": {
    "to": "sales@example.com",
    "subject": "Steel Measuring Tape Supplier from China",
    "body_preview": "Dear ...",
    "lead_id": "lead_1024"
  },
  "expected_effect": "邮件将被发送给客户，并在触达历史中记录首次开发。",
  "reversible": false,
  "rollback_plan": null
}
```

用户看到这个提案时，不只是看到“是否发送邮件”，而是知道发给谁、为什么发、内容是什么、后果是什么、是否可撤回。

代码 Agent 的动作提案可能是：

```json
{
  "action_type": "apply_patch",
  "risk_level": "high",
  "summary": "修改 auth.py 和 routes.py，增加邮箱验证码登录逻辑",
  "reason": "根据用户需求，需要新增验证码生成、验证和 session 写入流程。",
  "inputs": {
    "files": ["app/auth.py", "app/routes.py", "templates/login.html"],
    "diff_preview": "..."
  },
  "expected_effect": "本地工作区文件将被修改，但不会自动提交 git。",
  "reversible": true,
  "rollback_plan": "使用 checkpoint cp_20260506_001 恢复修改前状态。"
}
```

教育 Agent 的动作提案可能是：

```json
{
  "action_type": "send_parent_report",
  "risk_level": "high",
  "summary": "向家长发送本周数学学习报告",
  "reason": "学生连续三次在几何证明题中出现逻辑链缺失，建议家长配合监督每日复盘。",
  "inputs": {
    "student_id": "stu_15",
    "report_preview": "..."
  },
  "expected_effect": "报告将通过微信或邮件发送给家长。",
  "reversible": false
}
```

结构化提案有两个重要好处。

第一，它把模型的意图转化为系统可处理对象。审批队列、前端展示、权限判断、日志记录、统计分析都可以围绕 Action Proposal 实现。

第二，它迫使 Agent 在执行前说明理由和影响。很多时候，模型如果说不清为什么要做某个动作，系统就不应该让它执行。

---

## 11.4 审批队列：让高风险动作进入等待区

有了动作提案，还需要一个审批队列。审批队列的作用，是把 Agent 的执行流和人的决策流连接起来。

没有审批队列的系统，通常会出现两个问题。

一种情况是 Agent 卡住后只能等待当前用户在对话里回复。如果用户离开页面，任务就无法继续。另一种情况是 Agent 为了避免卡住，直接跳过确认或自动执行高风险动作，导致风险不可控。

审批队列把这个问题系统化：Agent 在高风险动作前暂停，把动作提案写入队列；人类可以在前端集中查看待审批事项；批准后任务继续，拒绝后任务进入调整流程，修改后可以重新提交。

一个简单审批状态机可以这样设计：

```text
proposed -> pending_review -> approved -> executed
                         -> rejected -> revised -> pending_review
                         -> expired
                         -> cancelled
```

每个状态都有明确含义。

`proposed` 表示 Agent 已生成动作提案，但系统尚未正式提交审批。

`pending_review` 表示该提案正在等待人类处理。

`approved` 表示人类已经批准，可以执行。

`executed` 表示动作已经执行完成。

`rejected` 表示人类拒绝该动作。

`revised` 表示 Agent 根据反馈修改提案。

`expired` 表示提案超过有效期，比如一封开发信草稿过了 7 天还未审批，可能已经不适合发送。

`cancelled` 表示任务被用户取消。

这个状态机可以扩展。例如有些企业场景需要多级审批：普通销售批准邮件，经理批准报价，法务批准合同。此时审批对象可以增加 `required_roles` 字段。

```python
class ApprovalPolicy:
    action_type: str
    risk_level: str
    required_roles: list[str]
    timeout_hours: int
    allow_delegate: bool
```

外贸 Agent 中，可以设置：

```text
生成邮件草稿：无需审批，只保存草稿。
发送首次开发信：业务员审批。
发送报价单：业务员 + 主管审批。
承诺交期或价格：必须主管审批。
```

代码 Agent 中，可以设置：

```text
读取文件：无需审批。
修改本地文件：用户确认。
运行测试：可自动执行。
执行 shell 命令：根据命令风险决定是否审批。
提交 git commit：必须用户确认。
推送远程仓库：必须用户确认，且默认禁用。
```

审批队列的本质，是把 Agent 的“想做什么”转化为人类可管理的“待处理工作项”。这对产品化非常重要。

用户不应该被迫一直盯着 Agent 的思考过程，而应该在关键节点收到清晰、结构化、可操作的审批请求。

---

## 11.5 人类反馈不只有批准和拒绝

很多审批系统只提供两个按钮：同意、拒绝。

这对 Agent 来说太粗糙。

真实协作中，人类经常不是简单批准或拒绝，而是给出修改意见。例如：

“这封邮件可以发，但语气再简洁一点。”

“这个客户先不要联系，原因是它看起来像零售店。”

“代码修改方向对，但不要引入新的依赖。”

“学习报告里不要写‘能力弱’，改成‘需要加强’。”

这些反馈对 Agent 很有价值。如果系统只记录 rejected，Agent 不知道怎么改；如果只把反馈作为一段聊天历史放进上下文，又很难结构化利用。

因此，审批系统应该支持多种反馈类型。

```text
approve：批准执行。
reject：拒绝，不再继续。
revise：要求修改后重新提交。
defer：暂缓处理。
override：人工直接修改内容后执行。
escalate：转交更高权限人员。
```

对于 `revise`，还应该记录修改意见：

```json
{
  "decision": "revise",
  "comment": "邮件内容太长，删掉公司历史介绍，重点突出 5m/7.5m/10m steel tape measure 和可提供 OEM 包装。",
  "fields_to_change": ["email_body"]
}
```

这样 Agent 可以根据反馈生成新版本。

更进一步，系统可以把人类反馈沉淀为偏好记忆。例如用户多次要求“开发信要短，不要夸张营销”，系统就可以记录：

```text
用户偏好：外贸开发信使用简洁直接风格，不使用夸张承诺，不写过长公司介绍。
```

但这里也要小心。不是所有反馈都应该进入长期记忆。有些反馈是针对单个客户的，有些是临时策略，有些是长期偏好。系统需要区分。

例如：

“这个客户先不要发”是单个客户状态。

“今天先别发邮件”是临时任务约束。

“以后开发信都尽量简洁”是长期偏好。

好的审批系统不只是拦截风险，还能成为 Agent 学习用户偏好的入口。

---

## 11.6 任务暂停、恢复与人工接管

审批不仅影响某个动作，还会影响整个任务执行流。

当 Agent 提交高风险动作后，它应该暂停当前任务，而不是继续假设动作已经执行。暂停状态需要被明确记录。

一个任务状态可以这样表示：

```python
class TaskState:
    task_id: str
    status: str
    current_step: str
    waiting_for: str | None
    pending_approval_id: str | None
    context_snapshot_id: str
    last_event_at: datetime
```

当外贸 Agent 生成开发信并等待审批时，任务状态可能是：

```json
{
  "status": "waiting_for_approval",
  "current_step": "outreach_email_review",
  "waiting_for": "user",
  "pending_approval_id": "approval_2048"
}
```

用户批准后，系统需要恢复任务。恢复时不能简单重新运行整个 Agent，而应该从 checkpoint 继续。否则可能重复搜索、重复生成客户、重复创建草稿。

因此，审批系统通常要和 checkpoint 机制结合。

在暂停前，系统保存：

当前任务状态；

已经完成的步骤；

关键上下文；

待执行动作；

中间产物；

工具调用历史。

批准后，Executor 读取待执行动作并执行，然后把结果写回任务状态，再继续后续步骤。

除了审批，系统还应该支持人工接管。

人工接管指的是用户不只是批准或拒绝某个动作，而是直接改变任务方向。例如：

“不要继续找沙特客户了，改成阿联酋。”

“停止这批客户开发，先整理已经找到的客户。”

“这次不要写邮件，只输出客户分析表。”

“代码修改先暂停，我要手动改一部分。”

这要求 Agent Runtime 支持外部控制事件。控制事件可以进入事件总线，改变任务状态。

```text
USER_INTERRUPT
USER_UPDATE_GOAL
USER_CANCEL_TASK
USER_TAKE_OVER
USER_RESUME_TASK
```

一个好的 Agent 系统，不应该把用户看成只能在结尾给评分的人。用户应该能在任务运行过程中随时改变方向、插入约束、暂停执行、接管任务、恢复任务。

这就是人机协同的真实含义：人不是系统外的旁观者，而是运行时控制平面的一部分。

---

## 11.7 Review UI：审批不是弹一个确认框

从产品角度看，审批系统最终要落到界面上。很多系统把审批做成一个简单弹窗：

“Agent 想发送邮件，是否确认？”

这种设计远远不够。

一个可用的 Review UI 至少要展示五类信息。

第一，动作摘要。用户一眼要知道 Agent 想做什么。例如“向 12 个高优先级客户发送首次开发信”。

第二，理由和依据。Agent 为什么建议这样做？依据来自哪里？是官网、历史记录、用户规则还是模型判断？

第三，具体内容。邮件正文、代码 diff、报价内容、学习报告等必须可查看。

第四，影响范围。执行后会影响哪些客户、文件、数据库记录或用户？是否可撤回？

第五，操作按钮。批准、拒绝、修改、暂缓、转交、批量处理。

以外贸邮件审批为例，一个 Review UI 可以包括：

```text
客户名称：Riyadh Tools Trading
客户类型：五金批发商
匹配度：82/100
邮箱来源：官网 Contact 页面
推荐理由：主营 hand tools / construction supplies，目标市场匹配
邮件主题：Steel Measuring Tape Supplier from China
邮件正文：可编辑预览
风险提示：首次触达，未确认采购负责人姓名
操作：批准发送 / 修改草稿 / 暂不联系 / 标记为无效客户
```

代码 Agent 的 Review UI 则应该展示：

```text
修改目标：增加邮箱验证码登录
涉及文件：5 个
新增依赖：无
测试结果：12 passed, 1 failed
Diff 预览：按文件展示
风险提示：登录流程影响 session 管理
操作：应用修改 / 要求修复失败测试 / 拒绝 / 下载 patch
```

教育 Agent 的 Review UI 可以展示：

```text
学生：张三
报告类型：周学习报告
关键发现：几何证明逻辑链缺失出现 4 次
证据：错题记录列表
建议：每日 10 分钟证明步骤复述训练
报告正文：可编辑
操作：发送家长 / 修改措辞 / 仅保存不发送
```

审批界面的设计决定了用户是否敢用 Agent。一个黑箱系统会让用户焦虑；一个清晰展示依据、内容和影响的系统，会让用户建立信任。

所以 Review UI 不是前端细节，而是 Agent 可用性的核心组件。

---

## 11.8 审批记录与审计日志

所有审批行为都应该被记录。

这不是为了增加复杂度，而是为了回答未来一定会出现的问题：谁批准了这个动作？当时 Agent 给出的理由是什么？用户修改了哪些内容？执行结果如何？如果出现问题，责任链在哪里？

审批日志至少应包括：

```python
class ApprovalDecision:
    approval_id: str
    reviewer_id: str
    decision: str
    comment: str | None
    modified_fields: dict | None
    decided_at: datetime
    execution_result_id: str | None
```

如果用户在发送邮件前修改了正文，系统要记录修改后的版本，而不能只记录“用户批准”。否则后续分析时无法区分是 Agent 原文造成的问题，还是人工修改后的内容造成的问题。

在企业环境中，审批日志还有合规价值。比如客户报价、合同条款、正式通知、数据导出，都需要保留审批链。

审计日志应该和普通运行日志区分。普通日志可以用于调试，可能会被压缩或清理；审计日志是业务事实，应更稳定、更可追踪，并具备不可随意篡改的特性。

例如外贸 Agent 中，可以记录：

```text
2026-05-06 10:15 Agent 生成邮件草稿 v1。
2026-05-06 10:18 用户修改邮件正文，删除价格承诺。
2026-05-06 10:20 用户批准发送。
2026-05-06 10:21 系统发送成功，邮件 ID 为 msg_789。
```

代码 Agent 中，可以记录：

```text
Agent 提出修改 auth.py 和 routes.py。
用户要求不要引入新依赖。
Agent 重新生成 patch。
测试通过。
用户批准应用 patch。
```

这些记录将来可以用于复盘、评估和改进。比如你可以统计：哪些类型的提案经常被拒绝？哪些工具动作最容易被修改？用户最常要求 Agent 改什么？这些数据会直接帮助优化 prompt、工具、策略和默认规则。

---

## 11.9 审批策略可以配置，而不是写死在代码里

早期原型可以把审批规则写死，例如“发送邮件必须确认”。但随着系统复杂度上升，审批策略最好配置化。

原因很简单：不同用户、不同团队、不同任务的风险偏好不同。

一个个人开发者可能允许代码 Agent 自动修改本地文件；一个企业团队可能要求所有代码变更都必须进入 pull request。一个外贸新手可能希望每封开发信都审批；一个成熟业务员可能允许低风险客户自动发送模板化邮件，但报价必须审批。一个教育机构可能允许 AI 自动生成学生练习，但不允许自动给家长发评价。

审批策略可以表示为规则：

```yaml
policies:
  - action_type: send_email
    condition: "email.category == 'first_outreach'"
    risk_level: high
    require_approval: true
    required_roles: ["owner"]

  - action_type: update_lead_score
    risk_level: medium
    require_approval: false
    audit: true

  - action_type: execute_shell
    condition: "command in safe_commands"
    risk_level: medium
    require_approval: false

  - action_type: execute_shell
    condition: "command not in safe_commands"
    risk_level: high
    require_approval: true
```

配置化之后，Agent Runtime 在执行工具前可以调用 Policy Engine：

```python
decision = policy_engine.evaluate(action, user_context, task_context)

if decision.block:
    raise PermissionDenied(decision.reason)

if decision.require_approval:
    approval_id = approval_queue.submit(action)
    task.pause(waiting_for=approval_id)
else:
    executor.execute(action)
```

这里要注意，策略引擎应该尽量确定性，不应该完全依赖模型判断。模型可以辅助生成动作理由和风险说明，但最终是否需要审批，应该由系统规则决定。

例如，模型可以说“我认为这封邮件风险较低”，但系统规则仍然规定 `send_email` 是高风险动作，必须审批。不要把安全边界交给模型自由解释。

---

## 11.10 人机协同如何反过来训练 Agent

审批系统不仅是安全机制，也是学习机制。

每一次人工反馈，都是一条高价值训练信号。用户批准，说明 Agent 的动作大体符合预期；用户拒绝，说明它的判断有问题；用户修改，说明它的方向对但细节需要调整；用户反复修改同类内容，说明系统应该更新默认策略。

例如外贸 Agent 中，如果用户经常拒绝“零售店”类型客户，系统应该强化客户类型识别规则。它可以把这类反馈转化为筛选策略：

```text
如果官网主要是面向个人消费者的购物车页面，且无批发、分销、B2B、import、wholesale 等信号，则降低评分。
```

如果用户经常把开发信改短，系统可以更新写作偏好：

```text
开发信控制在 120-180 个英文单词内，首段直接说明产品和供应能力，不写长篇公司介绍。
```

代码 Agent 中，如果用户多次要求“先给计划，不要直接改代码”，系统可以把这一点写入用户偏好或项目规则。

教育 Agent 中，如果老师总是修改报告措辞，系统可以沉淀机构统一表达规范。

不过，把审批反馈转化为记忆时，要经过筛选。不能把所有反馈都写成长久记忆。一个实用方法是把反馈分成四类：

任务级反馈：只影响当前任务。

对象级反馈：影响某个客户、某个学生、某个项目。

用户级反馈：影响该用户未来任务。

系统级反馈：影响所有用户或某类场景。

例如“这个客户不要联系”是对象级反馈；“这次先不发邮件”是任务级反馈；“以后邮件简洁一点”是用户级反馈；“所有对外报价必须主管确认”是系统级规则。

这说明审批系统和 Memory 系统天然相关。审批记录是原始数据，记忆系统负责把其中稳定、有价值的信息提炼出来。

---

## 11.11 一个最小审批系统实现

下面用一个简化实现说明审批系统如何嵌入 Agent Runtime。这个实现不追求完整生产级功能，而是帮助理解核心结构。

首先定义动作提案：

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
import uuid

@dataclass
class ActionProposal:
    task_id: str
    action_type: str
    risk_level: str
    summary: str
    reason: str
    inputs: dict[str, Any]
    expected_effect: str
    reversible: bool = False
    rollback_plan: str | None = None
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending_review"
    created_at: datetime = field(default_factory=datetime.utcnow)
```

然后定义审批队列：

```python
class ApprovalQueue:
    def __init__(self):
        self._items: dict[str, ActionProposal] = {}
        self._decisions: list[dict[str, Any]] = []

    def submit(self, proposal: ActionProposal) -> str:
        self._items[proposal.id] = proposal
        return proposal.id

    def list_pending(self):
        return [p for p in self._items.values() if p.status == "pending_review"]

    def decide(self, approval_id: str, reviewer_id: str, decision: str, comment: str | None = None):
        proposal = self._items[approval_id]
        if proposal.status != "pending_review":
            raise ValueError("proposal is not pending")

        if decision not in {"approve", "reject", "revise"}:
            raise ValueError("invalid decision")

        proposal.status = {
            "approve": "approved",
            "reject": "rejected",
            "revise": "revision_requested",
        }[decision]

        self._decisions.append({
            "approval_id": approval_id,
            "reviewer_id": reviewer_id,
            "decision": decision,
            "comment": comment,
            "decided_at": datetime.utcnow().isoformat(),
        })

        return proposal
```

接着在 Agent 执行工具前加入策略判断：

```python
class PolicyEngine:
    HIGH_RISK_ACTIONS = {"send_email", "apply_patch", "delete_file", "update_crm"}

    def require_approval(self, action_type: str) -> bool:
        return action_type in self.HIGH_RISK_ACTIONS
```

Executor 可以这样处理：

```python
class AgentExecutor:
    def __init__(self, approval_queue: ApprovalQueue, policy_engine: PolicyEngine):
        self.approval_queue = approval_queue
        self.policy_engine = policy_engine

    def propose_or_execute(self, task_id: str, action_type: str, inputs: dict, execute_fn):
        if self.policy_engine.require_approval(action_type):
            proposal = ActionProposal(
                task_id=task_id,
                action_type=action_type,
                risk_level="high",
                summary=f"准备执行 {action_type}",
                reason="该动作属于高风险动作，需要人工确认。",
                inputs=inputs,
                expected_effect="批准后系统将执行该动作。",
                reversible=False,
            )
            approval_id = self.approval_queue.submit(proposal)
            return {"status": "waiting_for_approval", "approval_id": approval_id}

        result = execute_fn(**inputs)
        return {"status": "executed", "result": result}
```

这个简化版本展示了最小闭环：Agent 想执行动作，系统判断风险，高风险动作进入审批队列，任务暂停等待人工确认。

生产系统还需要增加很多内容：权限角色、审批超时、通知、多级审批、版本管理、审计日志、前端 Review UI、执行后回写状态、失败重试、幂等性控制等。但核心思想不变：Agent 不直接执行高风险动作，而是提交结构化提案。

---

## 11.12 常见设计错误

设计人机协同时，有几个错误非常常见。

第一个错误，是把审批做成模型提示词，而不是系统规则。

例如在 prompt 中写：“在发送邮件前请询问用户”。这当然有帮助，但不可靠。模型可能忘记，可能误判，可能被上下文诱导。正确做法是在工具执行层强制拦截 `send_email`。

第二个错误，是让用户审批一大段模型思考，而不是审批具体动作。

用户不需要阅读 Agent 的全部推理过程，只需要知道它想执行什么、为什么、影响是什么、内容是什么。审批对象应是结构化动作提案，而不是混乱的聊天记录。

第三个错误，是只允许批准和拒绝。

真实协作需要修改、暂缓、转交、人工覆盖。否则用户会被迫在“不满意但也不是完全错”的情况下拒绝，Agent 学不到有效反馈。

第四个错误，是没有保存审批记录。

没有记录，就无法复盘责任，也无法改进系统。审批日志是 Agent 产品的核心资产。

第五个错误，是所有动作都审批。

过度审批会让 Agent 失去效率。如果每一次搜索、每一次摘要、每一次保存中间结果都要求确认，用户很快会放弃使用。审批应该聚焦高风险动作。

第六个错误，是审批界面信息不足。

如果用户看不到依据、内容、影响范围和风险提示，就不敢批准。Review UI 必须服务于决策，而不是只做形式确认。

第七个错误，是人工反馈无法进入系统改进。

如果用户每次都修改同样问题，而 Agent 永远不学习，这个系统会越来越令人疲惫。审批反馈应被用于更新偏好、规则和评估集。

---

## 练习题

### 练习 1：为外贸 Agent 设计审批边界

假设你正在设计一个外贸客户开发 Agent，它具有搜索客户、保存线索、生成开发信、发送邮件、更新跟进状态、生成报价建议等能力。

请把下面动作分为“自动执行”“需要审批”“禁止执行”三类，并说明理由：

1. 搜索公开客户网站；
2. 保存客户名称和官网；
3. 给客户打商机评分；
4. 生成开发信草稿；
5. 自动发送首次开发信；
6. 自动给客户报价；
7. 修改客户跟进状态为“已成交”；
8. 对同一邮箱一天发送 5 封跟进邮件；
9. 导出全部客户邮箱；
10. 根据客户回复生成下一步建议。

### 练习 2：设计 Action Proposal

选择一个你熟悉的高风险动作，例如发送邮件、提交代码、删除文件、发送学习报告、更新数据库。请设计它的 Action Proposal，至少包含：

```text
动作类型、风险级别、动作摘要、执行理由、输入参数、预期影响、是否可回滚、回滚方案、审批角色。
```

### 练习 3：设计审批状态机

画出一个审批状态机，要求支持：

```text
提交审批、批准、拒绝、要求修改、修改后重新提交、超时、取消。
```

请说明每个状态如何影响任务执行。

### 练习 4：设计 Review UI

为代码开发 Agent 设计一个 Review UI。用户在批准代码修改前，至少需要看到哪些信息？请列出界面模块，并说明每个模块的作用。

### 练习 5：从审批反馈中提炼记忆

假设用户连续三次修改外贸开发信，意见分别是：

```text
第一次：不要写太长。
第二次：不要一上来介绍公司历史。
第三次：直接写产品、规格和可 OEM。
```

请判断这些反馈是否应该转化为长期记忆。如果应该，请写出一条合适的记忆内容。

---

## 检查清单

读完本章后，你应该能够检查自己是否理解以下问题：

```text
[ ] 我理解 Human-in-the-loop 不是 Agent 能力不足的补丁，而是真实系统的基础结构。
[ ] 我能按照风险级别划分 Agent 动作。
[ ] 我知道哪些动作可以自动执行，哪些必须审批，哪些应该禁止。
[ ] 我理解 Action Proposal 的作用和基本字段。
[ ] 我知道审批队列如何让任务暂停和恢复。
[ ] 我理解人类反馈不只有批准和拒绝，还包括修改、暂缓、接管和转交。
[ ] 我能说明 Review UI 应该展示哪些信息。
[ ] 我知道审批日志为什么重要。
[ ] 我理解审批策略应该配置化，而不是完全写死。
[ ] 我知道审批反馈可以如何进入记忆和系统改进。
```

---

## 本章总结

Agent 的能力越强，越需要清晰的人机协同机制。真实系统中的问题不是“要不要人参与”，而是“人应该在什么位置参与，以什么形式参与，参与后如何影响任务状态和系统学习”。

本章介绍了 Human-in-the-loop 的核心思想：自主性必须根据风险分层设计。低风险动作可以自动执行，中风险动作需要可追踪，高风险动作必须人工审批，禁止动作应在工具层直接阻断。审批不是一个简单确认框，而是一套围绕 Action Proposal、Approval Queue、Review UI、任务暂停恢复、审批日志和策略引擎构建的系统。

人机协同还具有学习价值。用户的批准、拒绝和修改，都是 Agent 改进的重要信号。把这些反馈结构化保存，并合理转化为任务记忆、对象记忆、用户偏好或系统规则，Agent 才能越用越符合真实工作方式。

一个好的 Agent，不是完全替代人，而是让人从低价值重复劳动中释放出来，同时在关键决策点保持控制权。后续章节会继续讨论如何评估 Agent 是否真的有用，以及如何通过可观测性追踪 Agent 的行为。审批系统解决的是“能不能安全执行”，评估系统要解决的是“执行得好不好”。