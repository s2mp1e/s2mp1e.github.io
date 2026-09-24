---
title: "LCD Driver 知识库"
tags:
  - mcu
  - lcd
  - display
  - index
created: 2026-07-18
---

# LCD 段码驱动

> 段码 LCD (Segment LCD) 驱动集成在低功耗 MCU 中，用于仪表、家电、便携设备的字符显示。测试重点是偏压生成、波形正确性和对比度。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/LCD_Driver/LCD_段码驱动测试\|LCD 驱动测试详解]] | LCD 驱动原理、偏压/波形测试、对比度 |

---

## 关键测试点

| 参数 | 描述 |
|------|------|
| **偏压 (Bias)** | 1/3 Bias, 1/2 Bias 分压精度 |
| **COM/SEG 波形** | 驱动波形相位/幅度正确 |
| **帧频** | 刷新频率 (32~100Hz) |
| **对比度** | VLCD 电压调节 |
| **低功耗** | LCD 显示模式功耗 |

---

## 相关模块

- [[30.areas/MCU/System/_index|Power & System]] — 低功耗显示模式
- [[30.areas/MCU/Clock/_index|Clock]] — LCD 时钟源 (LSE 32kHz)
