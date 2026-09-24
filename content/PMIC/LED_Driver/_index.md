---
title: "LED Driver 知识库"
tags:
  - pmic
  - led
  - driver
  - index
created: 2026-07-17
---

# LED Driver LED 驱动

> LED Driver IC 用于驱动 LED 发光和调光，常见于背光、闪光灯、指示灯等场景。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/LED_Driver/LED_Driver_原理与测试\|LED Driver 原理与测试]] | LED 驱动原理、调光方式、ATE 测试方法 |

---

## LED Driver 类型

| 类型 | 拓扑 | 应用 |
|------|------|------|
| **Backlight LED Driver** | Boost + 多路电流源 | LCD 背光 |
| **Flash LED Driver** | Boost + 大电流 | 相机闪光灯 |
| **Display LED Driver** | Charge Pump | OLED/AMOLED |
| **RGB LED Driver** | 低压 LDO + PWM | 指示灯 |
| **Serial LED Driver** | 恒流源 + 移位寄存器 | 大屏/LED 矩阵 |

---

## 核心测试维度

- **电流精度** — LED 电流匹配度
- **调光线性度** — PWM/DC 调光曲线
- **OVP** — LED 开路保护
- **效率** — Boost 效率
- **Flash 时序** — 闪光灯同步

---

## 相关模块

- [[30.areas/PMIC/Boost/_index|Boost Converter]] — LED Driver 核心 Buck/Boost
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能]]
