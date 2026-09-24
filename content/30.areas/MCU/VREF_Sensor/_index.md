---
title: "VREF / Sensor 知识库"
tags:
  - mcu
  - vref
  - bandgap
  - sensor
  - temp
  - index
created: 2026-07-18
---

# VREF / Sensor 基准与传感器

> MCU 的基准源 (VREF/Bandgap) 和内置传感器 (温度传感器、电压监测) 支撑 ADC/DAC 的精度，是模拟测试的基础。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/VREF_Sensor/VREF_TempSensor_测试\|VREF/Temp Sensor 测试详解]] | Bandgap 基准测试、温度传感器校准、内部电压监测 |

---

## 模块一览

| 模块 | 功能 | 关键参数 |
|------|------|---------|
| **Bandgap VREF** | 参考电压 (1.2V/2.5V) | 精度、TC (温漂)、PSRR |
| **Temp Sensor** | 芯片温度检测 | 灵敏度 (mV/°C)、精度 |
| **VBAT Monitor** | 电池电压监测 | 分压比精度 |
| **Internal VDD Monitor** | 内部电压监测 | 精度 |

---

## 相关模块

- [[30.areas/PMIC/Analog_Core/Bandgap_原理与测试|PMIC Bandgap]] — 原理完全相同
- [[30.areas/MCU/ADC/_index|ADC]] — VREF 是 ADC 的参考
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim]] — VREF/Temp Cal 流程
