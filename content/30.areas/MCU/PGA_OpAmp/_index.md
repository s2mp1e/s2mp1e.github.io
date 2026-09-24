---
title: "PGA / OpAmp / Comparator 知识库"
tags:
  - mcu
  - pga
  - opamp
  - comparator
  - analog
  - index
created: 2026-07-18
---

# PGA / OpAmp / Comparator 模拟前端

> MCU 的模拟前端包括 PGA (可编程增益放大器)、OpAmp (运算放大器) 和 Comparator (比较器)，承担信号放大、缓冲和比较功能。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/PGA_OpAmp/PGA_原理与测试\|PGA 原理与测试]] | PGA 增益/失调/带宽测试、OpAmp 测试、Comparator 测试 |

---

## 三个模块的区别

| 模块 | 功能 | 输出 | 关键参数 |
|------|------|------|---------|
| **PGA** | 可编程增益放大 | 模拟电压 | Gain Error, Offset, Bandwidth |
| **OpAmp** | 通用运算放大 | 模拟电压 | Offset, Bias, GBW, Slew Rate |
| **Comparator** | 电压比较 | 数字电平 | Threshold, Offset, Hysteresis |

---

## 关键测试参数

- **PGA**: Gain Accuracy, Gain Error (每档), Offset, Bandwidth, Noise, Linearity
- **OpAmp**: VOS, IB, GBW, SR, CMRR, PSRR, Output Swing
- **Comparator**: VTH, VOS, Hysteresis, Propagation Delay, CMRR

---

## 相关模块

- [[30.areas/MCU/ADC/_index|ADC]] — PGA 常作为 ADC 前端
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim]] — PGA Gain/Offset Trim
