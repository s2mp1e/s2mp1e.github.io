---
title: "DAC 知识库"
tags:
  - mcu
  - dac
  - analog
  - index
created: 2026-07-18
---

# DAC 数模转换器

> DAC (Digital-to-Analog Converter) 将数字码转换为模拟电压，常用于 MCU 的波形发生、参考电压设置、音频输出等。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/DAC/DAC_原理与测试\|DAC 原理与测试]] | DAC 类型、静态/动态参数、ATE 测试方法 |

---

## MCU 常见 DAC 类型

| 类型 | 分辨率 | 速度 | MCU 应用 |
|------|--------|------|---------|
| **R-2R DAC** | 8~12 bit | 中速 | 通用 |
| **String DAC** | 8~12 bit | 慢速 | 参考设置 |
| **Current Steering** | 10~14 bit | 高速 | 高端 MCU (少见) |
| **PWM + RC** | 等效 8~10 bit | 极慢 | 低成本方案 |

---

## 关键测试参数

- **静态**: Offset, Gain Error, INL, DNL, Monotonicity
- **动态**: Settling Time, Slew Rate, Glitch Energy
- **其他**: 输出范围, 驱动能力, 输出阻抗

---

## 相关模块

- [[30.areas/MCU/ADC/_index|ADC]] — ADC 内部包含 DAC (CDAC)，原理相通
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim]] — DAC Offset/Gain Trim
