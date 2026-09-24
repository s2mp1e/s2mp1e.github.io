---
title: "Power & System 知识库"
tags:
  - mcu
  - power
  - idd
  - por
  - bod
  - index
created: 2026-07-18
---

# Power & System 电源与系统

> MCU 系统级测试包括功耗 (Idd) 测试、复位系统 (POR/BOD)、内部 LDO/DC-DC、睡眠模式等。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/System/Idd_电源_复位_测试\|系统测试详解]] | Idd 功耗测试、POR/BOD、内部电源、睡眠模式 |

---

## MCU 功耗模式对比

| 模式 | CPU | 外设 | SRAM | 典型电流 |
|------|-----|------|------|---------|
| **Run** | 运行 | 全开 | 保持 | mA 级 |
| **Sleep** | 停 | 部分 | 保持 | 几百 μA |
| **Deep Sleep** | 停 | 极少 | 保持/部分 | 几 μA |
| **Standby** | 停 | 无 | 丢失 | < 1μA |
| **Shutdown** | 停 | 无 | 丢失 | 几百 nA |

---

## 相关模块

- [[30.areas/MCU/Clock/_index|Clock]] — 各模式时钟配置
- [[30.areas/MCU/Common/MCU_FT|MCU FT 指南]] — FT 中的功耗测试
- [[30.areas/PMIC/_index|PMIC 知识库]] — LDO/POR 原理相通
