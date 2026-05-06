# 附录 C：Tool Schema 示例

工具 schema 是 Agent 工具系统的核心。好的 schema 不只是告诉模型“有什么函数”，还要告诉系统如何校验参数、控制权限、处理错误和记录审计。

## 一、工具 schema 的基本字段

```json
{
  "name": "tool_name",
  "description": "工具用途，必须具体，避免和其他工具混淆",
  "risk_level": "low | medium | high | forbidden",
  "requires_approval": false,
  "timeout_seconds": 10,
  "input_schema": {},
  "output_schema": {},
  "side_effect": "none | read | write | external_action",
  "idempotent": true,
  "dry_run_supported": true
}
```

## 二、计算器工具

```json
{
  "name": "calculator",
  "description": "执行确定性的数学表达式计算。只用于数值计算，不用于查询事实。",
  "risk_level": "low",
  "requires_approval": false,
  "timeout_seconds": 3,
  "side_effect": "none",
  "idempotent": true,
  "dry_run_supported": false,
  "input_schema": {
    "type": "object",
    "properties": {
      "expression": {
        "type": "string",
        "description": "要计算的数学表达式，例如 12 * 3 + 5"
      }
    },
    "required": ["expression"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "result": {"type": "number"},
      "error": {"type": ["string", "null"]}
    }
  }
}
```

## 三、文件读取工具

```json
{
  "name": "read_text_file",
  "description": "读取工作区内允许路径的文本文件。不能读取系统目录、密钥文件或工作区外文件。",
  "risk_level": "low",
  "requires_approval": false,
  "timeout_seconds": 5,
  "side_effect": "read",
  "idempotent": true,
  "dry_run_supported": false,
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {"type": "string"},
      "max_chars": {"type": "integer", "default": 12000}
    },
    "required": ["path"]
  }
}
```

## 四、草稿文件写入工具

```json
{
  "name": "write_draft_file",
  "description": "把内容写入 drafts 目录下的新文件。不会覆盖已有文件。适合保存报告草稿、邮件草稿和计划草稿。",
  "risk_level": "medium",
  "requires_approval": false,
  "timeout_seconds": 5,
  "side_effect": "write",
  "idempotent": false,
  "dry_run_supported": true,
  "input_schema": {
    "type": "object",
    "properties": {
      "filename": {"type": "string"},
      "content": {"type": "string"},
      "dry_run": {"type": "boolean", "default": true}
    },
    "required": ["filename", "content"]
  }
}
```

## 五、搜索工具

```json
{
  "name": "web_search",
  "description": "搜索公开网页信息。用于获取可能变化的事实、公司信息、公开资料和最新信息。搜索结果不是最终事实，必须经过筛选和引用。",
  "risk_level": "low",
  "requires_approval": false,
  "timeout_seconds": 15,
  "side_effect": "read",
  "idempotent": false,
  "dry_run_supported": false,
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {"type": "string"},
      "country": {"type": "string"},
      "max_results": {"type": "integer", "default": 10}
    },
    "required": ["query"]
  }
}
```

## 六、邮件草稿工具

```json
{
  "name": "create_email_draft",
  "description": "创建邮件草稿，但不发送。用于需要人工审核的外贸开发信、跟进邮件和客户回复。",
  "risk_level": "medium",
  "requires_approval": false,
  "timeout_seconds": 10,
  "side_effect": "write",
  "idempotent": false,
  "dry_run_supported": true,
  "input_schema": {
    "type": "object",
    "properties": {
      "to": {"type": "string"},
      "subject": {"type": "string"},
      "body": {"type": "string"},
      "lead_id": {"type": "string"},
      "dry_run": {"type": "boolean", "default": true}
    },
    "required": ["to", "subject", "body"]
  }
}
```

## 七、邮件发送工具

```json
{
  "name": "send_approved_email",
  "description": "只发送已经由人类审批通过的邮件草稿。禁止模型直接生成内容并调用本工具发送。",
  "risk_level": "high",
  "requires_approval": true,
  "timeout_seconds": 10,
  "side_effect": "external_action",
  "idempotent": false,
  "dry_run_supported": true,
  "input_schema": {
    "type": "object",
    "properties": {
      "draft_id": {"type": "string"},
      "approval_id": {"type": "string"},
      "dry_run": {"type": "boolean", "default": true}
    },
    "required": ["draft_id", "approval_id"]
  }
}
```

## 八、Shell 工具

```json
{
  "name": "run_shell_command",
  "description": "在受限工作区执行允许列表中的 shell 命令。禁止网络下载、删除、权限修改、后台进程和访问工作区外路径。",
  "risk_level": "high",
  "requires_approval": true,
  "timeout_seconds": 30,
  "side_effect": "external_action",
  "idempotent": false,
  "dry_run_supported": true,
  "input_schema": {
    "type": "object",
    "properties": {
      "command": {"type": "string"},
      "cwd": {"type": "string"},
      "dry_run": {"type": "boolean", "default": true}
    },
    "required": ["command"]
  }
}
```

## 九、禁止工具示例

不建议提供以下裸工具：

```text
send_email(to, subject, body)
rm(path)
execute_any_shell(command)
update_database(sql)
charge_payment(amount, account)
post_to_social_media(content)
```

这些工具应该被拆成更安全的组合：生成草稿、dry-run、审批、执行、审计。

## 十、工具设计检查清单

```text
[ ] 工具名称是否清晰，不会和其他工具混淆？
[ ] 描述是否说明了何时该用、何时不该用？
[ ] 参数是否有类型、必填字段和边界？
[ ] 返回值是否结构化？
[ ] 是否声明风险等级？
[ ] 是否支持 timeout？
[ ] 是否支持 dry-run？
[ ] 是否需要人工审批？
[ ] 是否记录审计日志？
[ ] 是否有重复执行保护？
```
