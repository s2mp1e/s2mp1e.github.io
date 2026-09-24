---
title: "Digital Interface 知识库"
tags:
  - pmic
  - digital
  - i2c
  - spi
  - index
created: 2026-07-17
---

# Digital Interface 数字接口

> 现代 PMIC 通过数字接口 (I2C/SPI) 与主控通信，实现 VOUT 配置、模式切换、状态读取、修调等功能。OTP/EFUSE 用于存储修调值和芯片配置。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Digital_Interface/I2C_SPI_测试\|I2C/SPI 接口测试]] | I2C/SPI 协议基础、ATE 测试方法 |
| [[30.areas/PMIC/Digital_Interface/OTP_EFUSE_Trim\|OTP/EFUSE/Trim 测试]] | OTP/EFUSE 原理、Tream 流程、ATE 测试 |

---

## 核心测试维度

| 接口 | 测试内容 |
|------|---------|
| **I2C** | Slave Addr, Register R/W, Timing (SCL/SDA), ACK/NACK |
| **SPI** | Mode (CPOL/CPHA), CS timing, MOSI/MISO 功能 |
| **OTP** | Write/Read, Redundancy, Data Retention |
| **EFUSE** | Program current, Resistance check, Soft Program |
| **MTP** | Multi-Time Programmable, Cycle endurance |

---

## 相关模块

- [[30.areas/PMIC/Analog_Core/Bandgap_原理与测试|Bandgap]] — OTP 的参考源
- [[30.areas/PMIC/Analog_Core/Oscillator_原理与测试|Oscillator]] — 数字接口的时钟
- [[30.areas/PMIC/Buck/Buck_测试项目总览|Buck 测试]] — Buck 的 I2C 配置测试
