---
title: "Clock 系统知识库"
tags:
  - mcu
  - clock
  - osc
  - pll
  - index
created: 2026-07-18
---

# Clock / OSC / PLL 时钟系统

> MCU 时钟系统包括内部 RC OSC、晶体振荡器 (XTAL OSC)、PLL、低功耗振荡器 (LPO) 等，为 CPU、外设、ADC 提供时钟。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/Clock/Clock_OSC_PLL_测试\|Clock 系统测试详解]] | OSC/PLL 原理、频率/Jitter/Lock Time 测试、Trim |

---

## MCU 时钟源对比

| 类型 | 频率 | 精度 | 功耗 | 用途 |
|------|------|------|------|------|
| **内部 RC OSC (HSI)** | 8~48MHz | ±1%~±5% (Trim 后) | 低 | 主时钟 |
| **内部 RC OSC (LSI)** | 32kHz | ±10% | 极低 | WDT/RTC |
| **XTAL OSC (HSE)** | 4~32MHz | ±20ppm | 中 | 高精度主时钟 |
| **PLL** | 倍频到 100MHz+ | 继承输入精度 | 中高 | 高速 CPU 时钟 |
| **LPO** | 10kHz~100kHz | 粗 | 极低 | 深睡眠唤醒 |

---

## 相关模块

- [[30.areas/MCU/ADC/_index|ADC]] — ADC 采样时钟
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim]] — OSC Trim 流程
