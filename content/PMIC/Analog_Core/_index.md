---
title: "Analog Core 知识库"
tags:
  - pmic
  - analog
  - bandgap
  - oscillator
  - index
created: 2026-07-17
---

# Analog Core 模拟核心

> PMIC 内部的模拟核心模块包括 Bandgap (带隙基准)、Oscillator (振荡器)、Bias Current (偏置电流) 等，是所有其他模块正常工作的基础。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Analog_Core/Bandgap_原理与测试\|Bandgap 原理与测试]] | 带隙基准原理、关键参数、ATE 测试 |
| [[30.areas/PMIC/Analog_Core/Oscillator_原理与测试\|Oscillator 原理与测试]] | 振荡器原理、RC OSC、Trim、ATE 测试 |

---

## Analog Core 子模块总览

| 模块 | 作用 | 关键参数 |
|------|------|---------|
| **Bandgap** | 产生精确参考电压 (1.2V/0.6V) | VREF 精度、TC (温漂)、PSRR |
| **Oscillator (OSC)** | 产生开关时钟 | 频率精度、Jitter、TC |
| **Bias/Current Source** | 提供偏置电流 | IBIAS 精度、匹配 |
| **POR (Power on Reset)** | 上电复位 | POR 阈值、迟滞 |
| **Soft Start** | 控制启动斜率 | SS 时间、SS 精度 |
| **UVLO** | 欠压锁定 | UVLO 阈值、迟滞 |

---

## 相关模块

- [[30.areas/PMIC/Buck/Buck_基本原理|Buck — RC Ton Trim 依赖 Bandgap/OSC]]
- [[30.areas/PMIC/Common/时序测试|时序测试 — OSC 频率测试]]
- [[30.areas/PMIC/Digital_Interface/OTP_EFUSE_Trim|OTP/Trim — 修调值来源]]
