---
title: "通用测试方法知识库"
tags:
  - pmic
  - ate
  - common
  - index
created: 2026-07-17
---

# 通用测试方法 / Common Test Methods

> PMIC ATE 测试中通用的测试方法和基础原理，适用于各模块。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Common/ATE测试基础\|ATE 测试基础]] | ATE 测试基本概念、资源类型、测试流程 |
| [[30.areas/PMIC/Common/时序测试\|时序测试方法]] | Timing 测量的原理和 ATE 实现方法 |
| [[30.areas/PMIC/Common/Trim\|PMIC Trim 完整指南]] | **重点** — 全模块 Trim 方法、存储技术、流程、计算 |
| [[30.areas/PMIC/Common/FT\|FT 测试完整指南]] | **重点** — FT 流程、硬件、测试项、Bin 策略、三温、数据 |

---

## 测试分类

### DC 参数测试
- Voltage / Current 测量
- 精度、分辨率、量程选择
- Force Voltage / Force Current 方法

### AC / 动态测试
- 纹波、噪声测量
- 瞬态响应
- PSRR

### 时序测试
- 脉冲宽度 (Ton, Toff)
- 频率 (Fsw)
- 延迟时间 (Startup, Dead Time, PG delay)

### 数字测试
- I2C / SPI 协议验证
- Register R/W 测试
- OTP / EFUSE 烧录

### Trim / 修调 (重点)
- [[30.areas/PMIC/Common/Trim|Trim 完整指南]] — CP Trim 全流程、各模块 Trim 方法
- [[30.areas/PMIC/Digital_Interface/OTP_EFUSE_Trim|OTP/EFUSE 技术细节]]

### FT / 成品测试 (重点)
- [[30.areas/PMIC/Common/FT|FT 完整指南]] — FT 流程、Bin 策略、三温、DIB 设计

---

## 相关模块

- [[30.areas/PMIC/Buck/_index|Buck Converter]]
- [[30.areas/PMIC/LDO/_index|LDO]]
- [[30.areas/PMIC/Protection/_index|保护功能]]
- [[30.areas/PMIC/PMU/_index|Multi-Rail PMU]]
