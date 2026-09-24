---
title: "Thermal Management 知识库"
tags:
  - pmic
  - thermal
  - index
created: 2026-07-17
---

# Thermal Management 热管理

> PMIC 的功率密度越来越高，热管理成为芯片可靠性的关键。热管理模块包括温度检测 (TSD)、动态降频 (Thermal Throttling)、过温保护 (OTP)、结温估算等。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Thermal/Thermal_原理与测试\|Thermal 原理与测试]] | 温度检测原理、OTP/TSD 测试、热阻测试 |

---

## 热管理模块组成

| 子模块 | 功能 | 典型阈值 |
|--------|------|---------|
| **TSD (Thermal Shutdown)** | 过温关断 | 150°C~170°C |
| **TJ Warning** | 温度预警 | 120°C~140°C |
| **Thermal Throttling** | 降频/限流降温 | 125°C~145°C |
| **Temperature Sensor** | 内部温度检测 | 精度 ±2°C~±5°C |
| **NTC Interface** | 外部 NTC 检测 | 外接热敏电阻 |

---

## 热阻

$$
T_J = T_A + P_D \times R_{θJA}
$$

- **T_J**: 结温 (Junction Temperature)
- **T_A**: 环境温度 (Ambient Temperature)  
- **P_D**: 功耗
- **RθJA**: 结到环境热阻 (°C/W)

---

## 相关模块

- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能 — OTP]]
- [[30.areas/PMIC/PMU/PMU_架构与测试|PMU — 多路散热]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础 — 三温测试]]
