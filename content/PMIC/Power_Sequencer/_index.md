---
title: "Power Sequencer 知识库"
tags:
  - pmic
  - sequencer
  - power-seq
  - index
created: 2026-07-17
---

# Power Sequencer 电源时序控制

> Power Sequencer 控制 PMIC 各输出轨的上下电时序，确保系统 (SoC/FPGA/Analog) 在正确的电压顺序下工作，避免闩锁损坏。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Power_Sequencer/Sequencer_原理与测试\|Sequencer 原理与测试]] | 时序控制原理、上下电序列、ATE 测试 |

---

## 为什么需要 Power Sequencing？

```
错误时序:
Core:       ──────┐  ┌────────
                   │  │
IO:         ───────────┐  ┌────
                       │  │
                   ↑ ESD/闩锁风险

正确时序:
Core:       ──────┐  ┌────────
                   │  │
IO:               └──┘  ┌──────
                        │
                   ✓ 安全
```

常见 SoC 要求: Core → IO → Memory 或 其他特定顺序。

---

## Sequencer 类型

| 类型 | 实现方式 | 特点 |
|------|---------|------|
| **Hardware Sequencer** | 固定逻辑/延迟链 | 简单、不可编程 |
| **Register-Programmable** | I2C 配置延迟 | 灵活 | 
| **OTP-Programmable** | 烧录固定时序 | 量产固定 |
| **GPIO-Controlled** | EN 引脚级联 | 系统级灵活 |

---

## 相关模块

- [[30.areas/PMIC/PMU/_index|Multi-Rail PMU]] — Sequencer 是 PMU 的关键组成部分
- [[30.areas/PMIC/Common/时序测试|时序测试]] — Sequencer 测试的核心方法
