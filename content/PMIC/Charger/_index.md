---
title: "Battery Charger 知识库"
tags:
  - pmic
  - charger
  - battery
  - index
created: 2026-07-17
---

# Battery Charger 充电管理

> Battery Charger IC 负责对可充电电池（Li-Ion, Li-Po, NiMH 等）进行安全、高效的充电管理，是 PMIC 中常见的模块之一。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Charger/Charger_原理与测试\|Charger 原理与测试]] | 充电原理、充电曲线、ATE 测试方法 |

---

## Charger 类型

| 类型 | 特点 | 典型应用 |
|------|------|---------|
| **Linear Charger** | 简单、低成本、发热大 | < 1A 小电流 |
| **Switching Charger** (Buck) | 高效、适合大电流 | 手机、平板 |
| **Switching Charger (Boost)** | USB OTG 反向升压 | 移动电源 |
| **NVDC Charger** | 系统优先供电 + 电池充电 | 笔记本 |
| **Wireless Charger** | 无线充电接收端 | 手机 |

---

## 相关模块

- [[30.areas/PMIC/Buck/_index|Buck Converter]] — Switching Charger 核心是 Buck
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能]] — 充电安全关键
- [[30.areas/PMIC/Thermal/_index|Thermal]] — 充电热管理
