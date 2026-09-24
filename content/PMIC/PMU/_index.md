---
title: "Multi-Rail PMU 知识库"
tags:
  - pmic
  - pmu
  - system
  - index
created: 2026-07-17
---

# Multi-Rail PMU 多路电源管理单元

> 现代 SoC 需要多路不同电压、不同时序的供电轨 (Rails)。PMU (Power Management Unit) 将 Buck、LDO、Boost、Charger、Load Switch、控制逻辑等集成在一起，提供完整的系统级电源方案。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/PMU/PMU_架构与测试\|PMU 架构与测试]] | PMU 系统架构、多轨测试方法 |

---

## 典型 PMU 框图

```
                    ┌─────────────────────────────┐
                    │          PMU                 │
VIN_BAT ─────┬──────┤  ┌──────┐  ┌──────┐         │
             │      │  │Buck1 │→│LDO1  │→ VOUT_A  │
             │      │  │      │  └──────┘         │
             │      │  │      │  ┌──────┐         │
             │      │  │      │→│LDO2  │→ VOUT_B  │
             │      │  ├──────┤  └──────┘         │
             │      │  │Buck2 │→ VOUT_C           │
             │      │  ├──────┤                   │
             │      │  │Boost │→ VOUT_D           │
             │      │  ├──────┤                   │
             │      │  │Charger│→ VBAT            │
             │      │  ├──────┤                   │
VIN_USB ─────┤──────┤  │I2C   │←→ Host            │
             │      │  ├──────┤                   │
             │      │  │Control│→ EN/SEQ          │
             │      │  └──────┘                   │
             │      └─────────────────────────────┘
             │
           BATTERY
```

---

## 相关模块

所有 PMIC 子模块都是 PMU 的组成部分：
- [[30.areas/PMIC/Buck/_index|Buck]]
- [[30.areas/PMIC/LDO/_index|LDO]]
- [[30.areas/PMIC/Boost/_index|Boost]]
- [[30.areas/PMIC/Charger/_index|Charger]]
- [[30.areas/PMIC/Digital_Interface/_index|I2C/SPI]]
- [[30.areas/PMIC/Protection/_index|Protection]]
- [[30.areas/PMIC/Power_Sequencer/_index|Power Sequencer]]
- [[30.areas/PMIC/Thermal/_index|Thermal]]
