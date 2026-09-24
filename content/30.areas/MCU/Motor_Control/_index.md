---
title: "Motor Control 知识库"
tags:
  - mcu
  - motor
  - bldc
  - pwm
  - index
created: 2026-07-18
---

# Motor Control 电机控制

> 电机控制 MCU 集成高级定时器 (Advanced Timer)、硬件死区插入、编码器接口等功能，用于 BLDC/PMSM 电机驱动。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/Motor_Control/Motor_测试详解\|电机控制模块测试]] | 高级定时器测试、死区验证、互补 PWM |

---

## 关键模块

| 模块 | 功能 | 关键测试 |
|------|------|---------|
| **Advanced Timer** | 互补 PWM 输出 | 频率/占空比/死区 |
| **Dead-Time Insertion** | 硬件死区 | 死区时间精度 |
| **Encoder Interface** | 编码器解码 | 计数/方向 |
| **Comparator (紧急关断)** | 过流保护 | 响应时间 |
| **ADC 同步采样** | 电流采样 | 同步时序 |

---

## 相关模块

- [[30.areas/MCU/Digital_Peripheral/_index|Digital Peripherals]] — Timer/PWM 基础
- [[30.areas/MCU/ADC/_index|ADC]] — 电流采样
- [[30.areas/MCU/PGA_OpAmp/_index|Comparator]] — 过流保护
