---
title: "Load Switch 知识库"
tags:
  - pmic
  - load-switch
  - index
created: 2026-07-17
---

# Load Switch 负载开关

> Load Switch 是一种简单的电源开关器件，用于控制后端电路的供电通断。现代 Load Switch 集成了保护、限流、放电等功能，是 PMIC 中常见的基础模块。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/LoadSwitch/LoadSwitch_原理与测试\|Load Switch 原理与测试]] | 工作原理、关键参数、ATE 测试方法 |

---

## Load Switch vs eFuse vs Buck

| 对比项 | Load Switch | eFuse | Buck |
|--------|------------|-------|------|
| 功能 | 通断控制 | 保护+通断 | 电压转换 |
| 输出电压 | = VIN (直通) | = VIN (直通) | VOUT < VIN |
| 限流 | 可选 | 有 (精确) | 有 |
| 浪涌控制 | 基本 | 有 (dV/dt) | N/A |
| Rdson | 典型 10~100mΩ | 典型 10~50mΩ | 开关管 |

---

## 相关模块

- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能]] — Load Switch 常含 OCP/OVP
- [[30.areas/PMIC/Thermal/_index|热管理]] — 大电流负载开关的热测试
