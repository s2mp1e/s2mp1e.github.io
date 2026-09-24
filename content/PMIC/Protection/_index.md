---
title: "保护功能测试知识库"
tags:
  - pmic
  - protection
  - index
created: 2026-07-17
---

# 保护功能测试 / Protection Test

> PMIC 的保护功能是可靠性验证的重中之重，需要在各种异常条件下正确触发并安全恢复。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO\|保护功能测试详述]] | OVP, UVLO, OCP, SCP, OTP, PG 等详细测试方法 |

---

## PMIC 常见保护功能

| 缩写 | 全称 | 描述 | 失效后果 |
|------|------|------|---------|
| **OVP** | Over Voltage Protection | 输出电压过高时保护 | 烧毁负载 |
| **UVP** | Under Voltage Protection | 输出电压过低时保护 | 负载工作异常 |
| **UVLO** | Under Voltage Lockout | 输入电压过低时禁止工作 | 芯片无法启动 |
| **OCP** | Over Current Protection | 输出电流过载时限制 | 烧毁芯片/电感 |
| **SCP** | Short Circuit Protection | 输出短路时保护 | 烧毁芯片/PCB |
| **OTP** | Over Temperature Protection | 芯片温度过高时关断 | 热损坏 |
| **RCP** | Reverse Current Protection | 反向电流保护 | 损坏输入源 |
| **PG** | Power Good | 输出电压正常指示 | 系统时序控制 |
| **Active Discharge** | 主动放电 | 关断时快速释放 VOUT | 确保下次启动正常 |

---

## 测试通用原则

1. **触发条件验证** — 确认保护在正确阈值触发
2. **响应时间** — 从异常到保护生效的延迟
3. **恢复行为** — 自动恢复 / Latch / Hiccup
4. **迟滞** — 避免保护阈值附近振荡
5. **全温范围** — 保护阈值随温度漂移的验证

---

## 相关模块

- [[30.areas/PMIC/Buck/Buck_测试项目总览|Buck 测试项目总览]] — Buck 的保护测试项
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
