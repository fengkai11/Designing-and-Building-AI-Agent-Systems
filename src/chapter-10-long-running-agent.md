# 第 10 章：Long-running Agent：长任务、调度与恢复

> 长期任务系统并不是孤立模块，下图展示了它与 Runtime、Memory、RAG 的关系，建议先整体理解。

![图 8-10-1 Memory、RAG 与 Long-running Agent 关系图](figures/fig-08-10-01-memory-rag-longrunning.png)

*图 8-10-1 Memory、RAG 与 Long-running Agent 关系图*


前面几章中，我们已经把 Agent 的核心能力拆开：Agent Loop 负责执行循环，工具系统负责行动能力，上下文工程负责当前工作记忆，Planning 负责步骤安排，Memory 负责长期经验，RAG 负责外部知识。

这些能力组合起来，已经可以完成不少任务。但如果 Agent 只能在一次对话中运行几步，然后立即返回结果，它仍然很难承担真实工作。

真实工作往往不是几分钟内完成的。

外贸获客 Agent 需要每天搜索新客户，持续去重，生成待审批开发信，根据回复安排跟进。教育 Agent 需要按天、按周追踪学生学习情况，定期生成报告，提醒老师干预。代码 Agent 可能需要等待测试完成、等待用户 review、根据 CI 结果继续修复。运营 Agent 可能要长期监控数据变化，一旦异常才通知人。

这些任务都有一个共同特征：它们跨越时间。

跨越时间之后，Agent 系统会面对一组新问题：任务执行到哪一步？中间结果保存在哪里？模型调用失败怎么办？工具超时怎么办？用户中途修改目标怎么办？等待人工审批时如何暂停？下次恢复时如何知道之前发生了什么？每天自动运行如何避免重复？如何取消任务？如何追踪成本和失败原因？

这就是 Long-running Agent 要解决的问题。

本章的目标，是让你理解长任务 Agent 的系统结构。它不是让模型“多思考一会儿”，而是要引入任务状态、队列、调度器、checkpoint、resume、cancel、retry、通知、审计日志和人工确认节点。

---

## 10.1 为什么长任务是 Agent 产品化的分水岭

很多 Agent Demo 是同步执行的。用户发一个请求，Agent 循环几步，返回结果。

这种模式适合简单任务，例如：

> 总结这篇文章。

> 根据这段产品资料写一封开发信。

> 读取这几个文件并解释项目结构。

但是，一旦任务变长，同步模式就会暴露问题。

假设用户说：

> 帮我找 50 家墨西哥五金工具分销商，排除零售店，整理邮箱，生成开发信草稿，明天提醒我审核。

这个任务可能需要搜索几十次，读取大量网页，进行去重和评分，还要等待用户第二天审核。它不适合在一次模型调用中完成，也不适合让用户一直开着页面等待。

再看代码任务：

> 帮我重构认证模块，保持现有测试通过。

Agent 可能需要多次读取文件、修改代码、运行测试。测试可能耗时几分钟，用户可能中途离开。任务必须能暂停、恢复和回放。

长任务是 Agent 产品化的分水岭，因为它要求系统具备持续性。

短任务可以靠上下文维持状态；长任务必须靠持久化状态。

短任务失败可以让用户重试；长任务失败必须能从 checkpoint 恢复。

短任务可以不记录完整轨迹；长任务必须可审计，否则用户不知道 Agent 做了什么。

短任务可以只在对话窗口里交互；长任务需要任务列表、进度、通知、审批队列和历史记录。

所以，一个能跑 Demo 的 Agent 和一个能长期工作的 Agent，架构上差距很大。

---

## 10.2 长任务的基本单元：Task

Long-running Agent 的第一步，是把用户请求变成可管理的 Task。

一个 Task 不只是用户一句话，而是一组结构化状态。

例如：

```json
{
  "task_id": "task_001",
  "title": "开发阿联酋钢卷尺客户",
  "goal": "寻找 30 家阿联酋五金工具分销商，生成客户评分和开发信草稿。",
  "status": "running",
  "created_at": "2026-05-06T09:00:00Z",
  "updated_at": "2026-05-06T09:10:00Z",
  "owner_id": "user_001",
  "current_step": "lead_scoring",
  "progress": {
    "searched_queries": 12,
    "candidate_leads": 54,
    "qualified_leads": 18,
    "drafts_created": 0
  },
  "constraints": {
    "target_country": "UAE",
    "exclude_retail": true,
    "max_leads": 30
  }
}
```

Task 至少应该包含：

任务 ID；

任务目标；

当前状态；

创建时间和更新时间；

所属用户或项目；

当前步骤；

进度信息；

约束条件；

中间结果；

错误信息；

审批状态；

执行轨迹引用。

很多初学者会把长任务状态放在对话历史里，这是不够的。对话历史是给模型看的，Task State 是给系统管理的。系统必须能在不调用模型的情况下知道任务状态。

例如，任务是否正在等待用户审批，不应该靠模型读聊天记录猜，而应该有明确字段：

```json
{
  "status": "waiting_for_approval",
  "waiting_on": "email_drafts_review",
  "approval_ids": ["apv_001", "apv_002"]
}
```

这就是工程化和 Demo 的区别。

---

## 10.3 任务状态机

长任务需要状态机。

状态机定义任务可能处于哪些状态，以及状态之间如何转换。没有状态机，系统就会变得模糊：任务到底是在运行、失败、暂停、等待审批，还是已经完成？

一个基础状态机可以包括：

```text
created
  ↓
queued
  ↓
running
  ↓     ↘
waiting_for_approval  failed
  ↓             ↓
running       retrying
  ↓             ↓
completed     running

其他状态：paused、cancelled、expired
```

每个状态有明确含义。

created：任务已创建，但尚未进入队列。

queued：任务等待执行。

running：任务正在执行。

waiting_for_approval：任务暂停，等待人工确认。

paused：用户主动暂停。

failed：任务失败，需要处理。

retrying：系统正在重试。

completed：任务完成。

cancelled：任务被取消。

expired：任务超时或长期无人处理。

状态转换要有规则。例如，只有 running 状态可以进入 waiting_for_approval；completed 任务不能重新进入 running，除非创建新任务或执行 follow-up；cancelled 任务不能继续调用工具。

状态机的价值是可控。

以外贸 Agent 为例，生成开发信草稿后，任务进入 waiting_for_approval。此时 Agent 不应继续发送邮件，也不应假设用户已经同意。只有审批通过后，任务才能继续。

以代码 Agent 为例，生成修改计划后，任务进入 waiting_for_approval。用户确认前，Agent 不应写文件。确认后进入 running，开始修改。

这说明状态机不仅管理进度，也管理权限。

---

## 10.4 Job Queue：把任务放进队列

长任务不能总是同步执行。需要 Job Queue。

Task 是业务层概念，表示用户目标；Job 是执行层概念，表示某个可运行工作单元。

一个 Task 可能拆成多个 Job。例如外贸客户开发 Task 可以拆成：

- 搜索客户 Job；
- 读取网页 Job；
- 客户去重 Job；
- 商机评分 Job；
- 生成开发信 Job；
- 等待审批 Job；
- 跟进提醒 Job。

Job Queue 的作用是：

异步执行任务；

控制并发；

失败重试；

限制速率；

支持延迟执行；

记录执行结果。

例如搜索客户时，不能无限并发访问网站。队列可以限制每分钟请求数，避免被封或造成不必要压力。

一个 Job 可以表示为：

```json
{
  "job_id": "job_001",
  "task_id": "task_001",
  "job_type": "search_leads",
  "status": "queued",
  "priority": 5,
  "run_at": "2026-05-06T09:00:00Z",
  "attempts": 0,
  "max_attempts": 3,
  "payload": {
    "query": "UAE hardware distributor measuring tools"
  }
}
```

当 Worker 取出 Job 后，执行对应逻辑。成功后写入结果，失败后根据策略重试或标记失败。

这里要注意，长任务 Agent 不应该让模型一次性控制所有执行。更合理的方式是：系统把任务拆成可管理 Job，模型在需要判断和生成的节点参与。

例如，“客户去重”可能主要是规则和数据库逻辑；“判断客户类型”可以调用模型；“生成开发信”可以调用模型；“等待审批”由系统控制。

这也是工作流与 Agent 组合的体现。

---

## 10.5 Scheduler：定时与周期任务

长任务不仅可能耗时，还可能周期性发生。

用户可能说：

> 每天上午 9 点帮我搜索 20 个新的目标客户。

或者：

> 每周五生成学生学习报告。

或者：

> 每隔 3 天检查没有回复的客户，并生成跟进建议。

这需要 Scheduler。

Scheduler 负责根据时间创建 Job 或 Task。它可以支持一次性定时、周期性任务、延迟任务和条件触发任务。

外贸 Agent 中常见调度包括：

每日线索搜索；

邮件发送后 3 天未回复提醒；

客户回复后生成下一步建议；

每周汇总客户开发进展；

每月复盘高质量线索来源。

教育 Agent 中常见调度包括：

每日练习任务；

错题间隔复习；

每周学习报告；

考试前专项复习计划；

长期薄弱点提醒。

代码 Agent 中调度少一些，但也可能有：

定期检查 CI 失败；

等待用户 review 超时提醒；

依赖更新扫描。

Scheduler 的关键不是简单定时，而是和任务状态结合。例如邮件发送后 3 天跟进，前提是客户没有回复。如果客户已经回复，就不应该继续按原计划跟进。

所以调度任务执行前要检查条件。

伪代码：

```python
def run_follow_up_job(lead_id: str):
    lead = lead_repository.get(lead_id)

    if lead.reply_status == "replied":
        return "skip: lead already replied"

    if lead.status != "contacted":
        return "skip: lead not contacted"

    create_task(
        title=f"为 {lead.company_name} 生成跟进建议",
        goal="根据历史开发信和客户状态生成 follow-up email draft",
    )
```

这就是条件调度。

---

## 10.6 Checkpoint：失败后能恢复

长任务一定会失败。

模型可能输出格式错误，工具可能超时，网页可能打不开，API 可能限流，数据库可能连接失败，用户可能中途修改目标，测试可能失败。系统必须假设失败会发生。

Checkpoint 的作用是保存任务关键阶段的状态，使任务可以从某个安全点恢复，而不是从头开始。

例如外贸客户搜索任务：

第一阶段，生成搜索关键词；

第二阶段，搜索候选客户；

第三阶段，读取客户网站；

第四阶段，客户去重；

第五阶段，评分；

第六阶段，生成开发信。

每完成一个阶段，都可以保存 checkpoint。

```json
{
  "checkpoint_id": "ckpt_003",
  "task_id": "task_001",
  "step": "lead_dedup_completed",
  "created_at": "2026-05-06T09:30:00Z",
  "state_snapshot": {
    "candidate_leads": 54,
    "deduped_leads": 31,
    "excluded_leads": 23
  }
}
```

如果评分阶段失败，系统可以从去重后的客户列表继续，而不必重新搜索。

代码 Agent 中，checkpoint 更重要。修改文件前应记录 git diff 或创建临时分支。这样如果修改失败，可以 rollback。

例如：

```text
Checkpoint A：读取项目后，尚未修改。
Checkpoint B：生成修改计划，等待确认。
Checkpoint C：修改 auth.py 后。
Checkpoint D：测试通过后。
```

如果测试失败且修复越来越乱，用户可以回滚到 Checkpoint B。

Checkpoint 不只是技术细节，它是用户信任的一部分。用户敢让 Agent 做更多事，是因为知道可以恢复。

---

## 10.7 Resume：恢复执行不是简单重跑

有了 checkpoint，还要能 resume。

Resume 不是把原任务从头再跑一遍，而是根据当前状态继续执行。

假设外贸 Agent 已经完成客户搜索和去重，但在生成开发信时失败。恢复时，系统应该知道：

- 搜索不需要重做；
- 去重结果可复用；
- 评分结果是否已完成；
- 哪些客户已生成草稿；
- 哪个客户失败；
- 失败原因是什么。

因此，任务状态要足够结构化。

如果中间结果只是模型输出的一段文本，恢复会很困难。系统无法可靠知道哪些客户处理过。更好的方式是每个客户都有状态字段：

```json
{
  "lead_id": "lead_001",
  "profile_status": "completed",
  "score_status": "completed",
  "email_draft_status": "failed",
  "last_error": "missing product knowledge: MOQ"
}
```

恢复时只处理 `email_draft_status=failed` 或 `pending` 的客户。

代码 Agent 也一样。恢复时要检查当前文件状态、上次 diff、测试结果和用户确认状态，而不是盲目继续。

Resume 的关键是幂等性。一个步骤重复执行不应该造成重复副作用。

例如，生成邮件草稿可以重复，但发送邮件不能重复。发送邮件前必须检查是否已经发送过。

```python
def send_email_once(lead_id: str, draft_id: str):
    outreach = outreach_repo.find_by_draft_id(draft_id)
    if outreach and outreach.status == "sent":
        return "skip: already sent"

    send_email(draft_id)
    outreach_repo.mark_sent(draft_id)
```

这就是幂等设计。

---

## 10.8 Retry：不是所有失败都应该重试

失败后是否重试，要看失败类型。

有些失败适合自动重试。例如网络超时、临时 API 限流、网页加载失败、模型服务短暂不可用。

有些失败不应该重试。例如参数错误、权限不足、用户输入缺失、工具 schema 不匹配、知识库没有必要资料。

有些失败需要换策略。例如搜索结果质量差，不是简单重试同一个 query，而是改关键词。

因此，Retry 策略不能只是“失败就再跑三次”。

可以把失败分成：

transient：临时错误，可重试；

permanent：永久错误，不重试；

strategy_error：策略错误，需要重新规划；

human_required：需要人工补充信息或确认。

例如：

```json
{
  "error_type": "human_required",
  "message": "知识库缺少该产品的 MOQ 信息，无法生成可靠开发信。",
  "suggested_action": "请补充 MOQ 或允许邮件中不写 MOQ。"
}
```

这种错误不应该自动重试。重试 10 次也没有用。

再比如：

```json
{
  "error_type": "strategy_error",
  "message": "连续 5 个搜索结果均为零售店，当前关键词质量较低。",
  "suggested_action": "改用 wholesale、distributor、building materials supplier 等关键词。"
}
```

这时应该触发 replanning。

Retry 还要考虑成本。模型调用和搜索 API 都可能付费。长任务中必须设置最大重试次数、最大成本、最大执行时间。

---

## 10.9 Cancellation：用户必须能中断 Agent

长任务 Agent 必须支持取消。

用户可能发现任务目标错了，想停止；也可能看到 Agent 正在朝错误方向执行，想中断；也可能任务已经没有价值。

如果系统不支持取消，用户会失去控制感。

取消不是简单设置一个标志。系统还要处理正在运行的 Job、未完成工具调用、已生成但未审批的结果、已安排的未来调度。

一个取消流程可以是：

用户点击取消；

Task 状态变为 cancelling；

Worker 在安全点检查取消标志；

停止后续模型调用和工具调用；

保留已完成结果；

取消未执行 Job；

保留审计日志；

状态变为 cancelled。

对于有副作用的工具，取消要特别小心。如果邮件已经发送，无法撤回。系统只能记录状态，而不能假装取消成功。因此，高风险动作之前应有审批和最终确认。

代码 Agent 中，如果正在修改文件，取消时可能需要询问用户是否保留当前 diff，或回滚到上一个 checkpoint。

取消能力体现了一个基本原则：

> Agent 是为用户工作，不是替用户接管系统。

---

## 10.10 Human-in-the-loop 与长任务暂停

第 11 章会专门讨论 Human-in-the-loop，这里先讲它和长任务的关系。

长任务中，人工确认不是异常，而是正常状态。

外贸 Agent 生成开发信后，应暂停等待审批。

代码 Agent 生成修改计划后，应暂停等待确认。

教育 Agent 生成学生干预建议后，可能需要老师确认。

企业流程 Agent 遇到合同、付款、删除数据等高风险动作时，必须等待人工审批。

这意味着任务状态机必须支持 waiting_for_approval。

审批对象也要结构化。例如：

```json
{
  "approval_id": "apv_001",
  "task_id": "task_001",
  "approval_type": "email_draft",
  "status": "pending",
  "risk_level": "medium",
  "title": "发送给 ABC Building Materials 的开发信草稿",
  "content": "...",
  "options": ["approve", "edit", "reject"],
  "created_at": "2026-05-06T10:00:00Z"
}
```

用户可以批准、修改、拒绝。不同选择触发不同状态转换。

批准后，任务继续。

修改后，系统使用修改版本继续。

拒绝后，该分支结束或重新生成。

等待审批期间，任务不能丢失上下文。系统不能依赖聊天窗口还开着，而要把审批对象、中间状态和下一步动作保存下来。

---

## 10.11 通知系统

长任务需要通知。

如果 Agent 完成任务、失败、等待审批、需要补充信息，用户应该知道。

通知可以有多种形式：

站内消息；

邮件；

聊天消息；

移动端推送；

任务列表红点；

日常摘要。

通知不是越多越好。太多通知会打扰用户。需要按重要性分级。

例如：

低优先级：每日搜索完成，生成 20 条候选线索。可以进入日报。

中优先级：有 5 封开发信等待审批。可以站内提醒。

高优先级：客户回复询价。应该即时通知。

紧急：Agent 执行高风险操作前需要确认。必须明确提醒。

通知内容也要可操作。不要只写：

> 任务需要处理。

更好的通知是：

> 阿联酋客户开发任务已生成 12 封开发信草稿，其中 4 家评分超过 80。请审核后决定是否发送。

通知应该直接链接到审批队列或任务详情。

---

## 10.12 Audit Log：长任务必须可回放

长任务如果没有审计日志，失败后很难排查。

Audit Log 记录任务执行过程中发生了什么：

任务创建；

状态变化；

模型调用；

工具调用；

工具结果；

错误；

重试；

审批；

用户修改；

通知；

任务完成。

例如：

```json
{
  "event_id": "evt_001",
  "task_id": "task_001",
  "timestamp": "2026-05-06T09:15:00Z",
  "event_type": "tool_call",
  "actor": "agent",
  "data": {
    "tool_name": "search_web",
    "arguments": {
      "query": "UAE hardware distributor measuring tools"
    },
    "result_count": 10,
    "duration_ms": 1200
  }
}
```

审计日志的价值包括：

让用户知道 Agent 做了什么；

帮助开发者定位失败原因；

支持评估和优化；

满足合规和责任追踪；

为未来记忆和经验总结提供素材。

审计日志和普通日志不同。普通日志面向开发者，审计日志面向任务和用户。它应该可读、可追溯、可关联。

第 13 章会专门讨论 Observability，这里先把它作为长任务基础设施的一部分。

---

## 10.13 最小长任务系统实现

下面用 Python 伪代码实现一个最小长任务框架。它不依赖复杂队列，只用内存结构帮助理解。

先定义 Task 和 Job。

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Literal
import uuid

TaskStatus = Literal[
    "created", "queued", "running", "waiting_for_approval",
    "paused", "failed", "completed", "cancelled"
]

JobStatus = Literal["queued", "running", "failed", "completed", "cancelled"]

@dataclass
class Task:
    title: str
    goal: str
    owner_id: str
    status: TaskStatus = "created"
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    current_step: str | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    state: dict[str, Any] = field(default_factory=dict)

@dataclass
class Job:
    task_id: str
    job_type: str
    payload: dict[str, Any]
    status: JobStatus = "queued"
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    attempts: int = 0
    max_attempts: int = 3
    run_at: datetime = field(default_factory=datetime.utcnow)
    last_error: str | None = None
```

实现简单仓库。

```python
class TaskRepository:
    def __init__(self):
        self.tasks: dict[str, Task] = {}

    def save(self, task: Task):
        task.updated_at = datetime.utcnow()
        self.tasks[task.id] = task

    def get(self, task_id: str) -> Task:
        return self.tasks[task_id]

class JobQueue:
    def __init__(self):
        self.jobs: list[Job] = []

    def enqueue(self, job: Job):
        self.jobs.append(job)

    def next_job(self) -> Job | None:
        now = datetime.utcnow()
        for job in self.jobs:
            if job.status == "queued" and job.run_at <= now:
                return job
        return None
```

实现 Worker。

```python
class Worker:
    def __init__(self, task_repo: TaskRepository, job_queue: JobQueue):
        self.task_repo = task_repo
        self.job_queue = job_queue

    def run_once(self):
        job = self.job_queue.next_job()
        if not job:
            return

        task = self.task_repo.get(job.task_id)

        if task.status == "cancelled":
            job.status = "cancelled"
            return

        job.status = "running"
        job.attempts += 1
        task.status = "running"
        task.current_step = job.job_type
        self.task_repo.save(task)

        try:
            self.handle_job(task, job)
            job.status = "completed"
        except Exception as exc:
            job.last_error = str(exc)
            if job.attempts < job.max_attempts:
                job.status = "queued"
            else:
                job.status = "failed"
                task.status = "failed"
                task.state["last_error"] = str(exc)
                self.task_repo.save(task)

    def handle_job(self, task: Task, job: Job):
        if job.job_type == "search_leads":
            self.search_leads(task, job.payload)
        elif job.job_type == "score_leads":
            self.score_leads(task)
        elif job.job_type == "create_email_drafts":
            self.create_email_drafts(task)
        else:
            raise ValueError(f"unknown job type: {job.job_type}")

    def search_leads(self, task: Task, payload: dict[str, Any]):
        # 真实系统中这里会调用搜索工具和网页读取工具
        task.state["candidate_leads"] = [
            {"name": "ABC Building Materials", "country": "UAE"},
            {"name": "XYZ Hardware Trading", "country": "UAE"},
        ]
        self.task_repo.save(task)

        self.job_queue.enqueue(Job(
            task_id=task.id,
            job_type="score_leads",
            payload={},
        ))

    def score_leads(self, task: Task):
        leads = task.state.get("candidate_leads", [])
        for lead in leads:
            lead["score"] = 80
        task.state["scored_leads"] = leads
        self.task_repo.save(task)

        self.job_queue.enqueue(Job(
            task_id=task.id,
            job_type="create_email_drafts",
            payload={},
        ))

    def create_email_drafts(self, task: Task):
        leads = task.state.get("scored_leads", [])
        drafts = []
        for lead in leads:
            drafts.append({
                "lead": lead["name"],
                "draft": f"Email draft for {lead['name']}"
            })

        task.state["email_drafts"] = drafts
        task.status = "waiting_for_approval"
        task.current_step = "email_drafts_review"
        self.task_repo.save(task)
```

创建任务并运行。

```python
task_repo = TaskRepository()
job_queue = JobQueue()
worker = Worker(task_repo, job_queue)

task = Task(
    title="开发阿联酋钢卷尺客户",
    goal="寻找阿联酋五金分销商，评分并生成开发信草稿。",
    owner_id="user_001",
    status="queued",
)
task_repo.save(task)

job_queue.enqueue(Job(
    task_id=task.id,
    job_type="search_leads",
    payload={"query": "UAE hardware distributor measuring tools"},
))

while True:
    worker.run_once()
    current = task_repo.get(task.id)
    if current.status in ["waiting_for_approval", "failed", "completed", "cancelled"]:
        break

print(current.status)
print(current.state)
```

这个实现非常简化，但它包含长任务系统的基本思想：Task、Job、Queue、Worker、状态转换、阶段推进、等待审批。

---

## 10.14 外贸获客 Agent 的长任务流程

现在把这些机制放到外贸获客 Agent 中，设计一个真实流程。

用户创建任务：

> 每天帮我搜索 20 个阿联酋五金工具分销商，排除零售店，生成高优先级客户列表和开发信草稿，等待我审批。

系统创建一个 recurring task template：

```json
{
  "template_id": "tpl_001",
  "schedule": "daily 09:00",
  "goal": "搜索阿联酋五金工具分销商",
  "constraints": {
    "country": "UAE",
    "exclude_retail": true,
    "max_new_leads_per_day": 20,
    "require_approval_before_email": true
  }
}
```

每天 9 点 Scheduler 创建 Task。

Task 执行阶段：

1. 读取历史客户，避免重复；
2. 根据经验记忆生成搜索关键词；
3. 搜索网页；
4. 提取候选公司；
5. 去重；
6. 判断客户类型；
7. 评分；
8. 生成客户画像；
9. 生成开发信草稿；
10. 创建审批项；
11. 通知用户。

任务状态可能是：

```text
queued → running → waiting_for_approval
```

用户审批后：

- 如果批准，邮件进入发送队列；
- 如果修改，保存修改版本；
- 如果拒绝，记录原因，用于改进；
- 发送后创建 3 天后跟进 Job；
- 如果客户回复，取消原 follow-up，生成回复分析任务。

这个流程里，Agent 不是无限自主运行。它在搜索、判断、生成等环节使用智能能力；在发送邮件前必须等待人；在长期调度中由系统控制。

这就是长任务 Agent 的正确形态：自主执行 + 状态管理 + 人工审批 + 持续调度。

---

## 10.15 教育 Agent 的长任务流程

教育 Agent 的长任务更像学习监督系统。

老师为学生创建学习计划：

> 接下来两周，每天安排 20 分钟一次函数应用题训练，根据错题调整练习，周五给我报告。

系统创建计划后，每天生成练习任务。

学生完成后，Agent 批改并分析错因。错因进入学生画像，但高影响结论可以等待老师确认。

如果连续多次出现同类错误，系统创建提醒：

> 该学生连续 4 次在“实际问题中变量关系建立”上出错，建议老师进行一次针对性讲解。

周五 Scheduler 触发报告任务。Agent 从一周数据中生成报告：

- 完成情况；
- 正确率变化；
- 高频错因；
- 已改善知识点；
- 下周建议；
- 需要老师干预的问题。

老师确认后，系统调整下一周计划。

这里的长任务机制包括：每日调度、错题状态、学生画像更新、老师审批、周报生成、计划调整。Agent 的价值不是单题讲解，而是持续监督闭环。

---

## 10.16 代码 Agent 的长任务流程

代码 Agent 的长任务通常围绕 repo 修改。

用户说：

> 帮我给项目增加邮箱验证码登录，先给计划，我确认后再改。

系统创建 Task。

第一阶段，Agent 读取项目结构、README、路由、用户模型、测试文件。生成修改计划。Task 进入 waiting_for_approval。

用户批准后，系统创建 checkpoint，然后 Agent 修改代码。

修改后运行测试。如果测试失败，Agent 读取错误日志，尝试修复。每次修复都记录 diff 和测试结果。如果连续失败超过阈值，任务进入 failed 或 waiting_for_human。

测试通过后，生成最终 diff 和说明，等待用户 review。

用户可以选择接受、要求调整或回滚。

代码 Agent 的长任务特别强调：

修改前 checkpoint；

高风险 shell 命令审批；

测试失败重试上限；

diff 可见；

可 rollback；

完整 trace。

这也是为什么代码 Agent 不是简单“让模型写代码”，而是一个围绕 repo、工具、状态、测试和确认构建的系统。

---

## 10.17 长任务的成本控制

长任务容易失控。它可能调用很多次模型、搜索很多网页、运行很多工具。如果没有成本控制，系统可能变得昂贵且不可预测。

成本控制包括：

最大模型调用次数；

最大 token 消耗；

最大工具调用次数；

最大执行时长；

最大搜索页数；

最大重试次数；

最大并发；

每个任务预算。

例如外贸搜索任务可以设置：

```json
{
  "max_search_queries": 20,
  "max_pages_per_query": 10,
  "max_model_calls": 100,
  "max_runtime_minutes": 60,
  "max_new_leads": 30
}
```

当接近预算时，Agent 应该总结当前结果，而不是继续无限探索。

例如：

> 本次任务已达到搜索预算上限。已找到 18 个合格客户，其中 7 个高优先级。是否继续扩大搜索？

这比悄悄烧成本更好。

---

## 10.18 长任务产品界面

Long-running Agent 需要产品界面支持。一个简单聊天框不足以承载长任务。

至少需要以下界面：

任务列表：显示所有任务状态、进度、创建时间、下一步。

任务详情：显示目标、约束、中间结果、执行轨迹。

审批队列：集中处理待确认事项。

通知中心：显示完成、失败、需要处理的提醒。

调度设置：管理周期任务。

历史记录：查看已完成任务和结果。

错误与恢复：显示失败原因，允许重试、修改参数或取消。

例如外贸 Agent 的任务卡片可以显示：

```text
阿联酋客户开发任务
状态：等待审批
进度：已找到 24 个候选客户，12 个合格，8 封开发信待审核
下一步：审核开发信草稿
```

用户点击后进入审批列表，而不是在聊天记录里翻找。

产品界面决定 Agent 是否可用。没有界面，长任务系统即使后端强，也会让用户不知所措。

---

## 10.19 常见失败模式

长任务 Agent 常见失败模式包括：

第一，没有持久化状态。任务中断后无法恢复。

第二，状态过于文本化。系统无法可靠判断执行到哪一步。

第三，没有审批暂停。Agent 在高风险动作上继续自动执行。

第四，没有幂等设计。恢复或重试导致重复发送、重复写入、重复扣费。

第五，没有取消能力。用户无法中断错误任务。

第六，没有重试分类。所有失败都机械重试，浪费成本。

第七，没有 checkpoint。失败后只能从头开始。

第八，没有通知。任务完成或失败用户不知道。

第九，没有审计日志。出了问题无法回放。

第十，没有预算控制。长任务无限调用模型和工具。

这些问题说明，Long-running Agent 的难点不在于让模型“多执行几步”，而在于把执行过程工程化、状态化、可恢复化。

---

## 练习题

### 练习 1：设计任务状态机

为一个外贸客户开发 Agent 设计任务状态机。至少包含：

- created；
- queued；
- running；
- waiting_for_approval；
- failed；
- completed；
- cancelled。

请说明每个状态的含义，以及哪些状态可以相互转换。

### 练习 2：拆分 Task 和 Job

用户任务是：

> 每天帮我找 20 个沙特钢卷尺潜在客户，生成开发信草稿。

请拆成多个 Job，并说明每个 Job 的输入、输出和失败处理方式。

### 练习 3：设计 Checkpoint

为代码开发 Agent 设计 checkpoint 策略。请说明：

1. 修改前保存什么？
2. 每次测试前保存什么？
3. 测试失败后如何恢复？
4. 用户要求回滚时如何处理？

### 练习 4：设计 Retry 策略

请把下面错误分类为 transient、permanent、strategy_error、human_required。

1. 搜索 API 超时；
2. 用户没有提供产品 MOQ；
3. 连续搜索结果都是零售店；
4. 工具参数格式错误；
5. 邮件发送接口返回临时限流；
6. Agent 需要确认是否可以承诺某项认证。

### 练习 5：设计长任务界面

为一个教育 Agent 设计长任务产品界面。至少包含：

- 任务列表；
- 学生计划；
- 待老师确认事项；
- 每周报告；
- 错误恢复或调整入口。

---

## 检查清单

```text
[ ] 我理解长任务是 Agent 产品化的重要分水岭。
[ ] 我能区分 Task 和 Job。
[ ] 我知道为什么长任务需要状态机。
[ ] 我理解 Job Queue 和 Scheduler 的作用。
[ ] 我知道 checkpoint 为什么重要。
[ ] 我理解 resume 不是简单重跑，而是基于状态继续执行。
[ ] 我知道 retry 需要按失败类型分类。
[ ] 我理解用户必须能够取消长任务。
[ ] 我知道人工审批会让任务进入 waiting_for_approval 状态。
[ ] 我能设计外贸、教育或代码 Agent 的长任务流程。
[ ] 我理解审计日志、通知和产品界面对长任务 Agent 的重要性。
[ ] 我知道长任务必须有成本和预算控制。
```

---

## 本章总结

Long-running Agent 解决的是 Agent 如何跨越时间持续工作的能力。它让 Agent 从一次性对话工具，变成可以执行长期任务、等待人工确认、失败后恢复、周期运行和持续跟进的系统。

本章强调，长任务不是让模型一次性思考更久，而是引入一套系统基础设施：Task、Job、状态机、队列、调度器、checkpoint、resume、retry、cancel、approval、notification、audit log 和成本控制。

在真实场景中，外贸获客、教育监督、代码修改、运营监控都需要长任务能力。它们的共同点是：任务不会在一次回复中结束，系统必须保存状态、管理进度、支持暂停和恢复。

Long-running Agent 也进一步说明了本书的核心观点：Agent 不是一个 prompt，而是一套系统工程。模型提供理解和判断，工具提供行动能力，状态机和队列提供执行控制，审批和通知提供人机协同，审计日志和 checkpoint 提供可靠性。

到这里，第三篇“记忆、知识库与长期任务”已经完成。第 8 章让 Agent 记住经历，第 9 章让 Agent 使用外部知识，第 10 章让 Agent 跨越时间持续工作。下一篇我们将进入可控、安全、可评估的 Agent，重点讨论 Human-in-the-loop、Evaluation 和 Observability。