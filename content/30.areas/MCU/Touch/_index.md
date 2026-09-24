---
title: "Touch 电容触摸知识库"
tags:
  - mcu
  - touch
  - capacitive
  - index
created: 2026-07-18
---

# Touch 电容触摸

> 电容触摸 (Capacitive Touch Sensing) 通过检测电极电容变化识别手指触摸，广泛用于按键、滑条、滚轮等交互界面。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/Touch/Touch_原理与测试\|Touch 测试详解]] | 电容检测原理、TSC 外设测试、灵敏度验证 |

---

## 检测方法对比

| 方法 | 原理 | 特点 |
|------|------|------|
| **充电转移 (CT)** | 充放电次数计数 | 常用、抗噪好 |
| **弛张振荡 (RO)** | 振荡频率变化 | 简单、低成本 |
| **ΣΔ 调制** | 电容-数字转换 | 精度高 |
| **互容检测** | 发射/接收电极 | 多点触摸 |

---

## 相关模块

- [[30.areas/MCU/ADC/_index|ADC]] — 部分方案复用 ADC
- [[30.areas/MCU/Clock/_index|Clock]] — TSC 时钟源
