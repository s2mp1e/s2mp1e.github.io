---
title: "ADC 知识库"
tags:
  - mcu
  - adc
  - analog
  - index
created: 2026-07-18
---

# ADC 模数转换器

> ADC (Analog-to-Digital Converter) 是 MCU 中最关键的模拟模块，将模拟信号转换为数字码。MCU 中常见 SAR ADC (逐次逼近型) 和 ΣΔ ADC (Sigma-Delta 型)。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/ADC/ADC_原理与测试\|ADC 原理与测试]] | ADC 类型、静态/动态参数、ATE 测试方法、Trim |

---

## MCU 常见 ADC 类型

| 类型 | 分辨率 | 采样率 | MCU 应用 |
|------|--------|--------|---------|
| **SAR ADC** | 8~16 bit | 100kS/s ~ 5MS/s | 最常用，通用采集 |
| **ΣΔ ADC** | 16~24 bit | 1S/s ~ 100kS/s | 高精度、慢信号 |
| **Flash ADC** | 4~8 bit | 100MS/s+ | 高速控制 (少见) |
| **Pipeline ADC** | 10~14 bit | 10MS/s~100MS/s | 高端 MCU (少见) |

---

## 关键测试参数

- **静态**: Offset, Gain Error, INL, DNL, Missing Code
- **动态**: SNR, SINAD, THD, ENOB, SFDR
- **其他**: 输入范围, 采样率, 输入阻抗, Crosstalk

---

## 相关模块

- [[30.areas/MCU/PGA_OpAmp/_index|PGA]] — ADC 前端常接 PGA
- [[30.areas/MCU/Clock/_index|Clock]] — ADC 采样时钟来源
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim]] — ADC Offset/Gain Trim
