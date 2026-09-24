---
title: "Digital Peripherals 知识库"
tags:
  - mcu
  - gpio
  - uart
  - spi
  - i2c
  - timer
  - index
created: 2026-07-18
---

# Digital Peripherals 数字外设

> MCU 数字外设包括 GPIO、UART、SPI、I2C、Timer/PWM、Watchdog 等，是 MCU 与外部世界交互的接口。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/Digital_Peripheral/GPIO_UART_SPI_测试\|外设测试详解]] | GPIO/UART/SPI/I2C/Timer/PWM/WDT 测试方法 |

---

## 外设一览

| 外设 | 功能 | 关键测试点 |
|------|------|-----------|
| **GPIO** | 通用输入输出 | VIH/VIL, VOH/VOL, 驱动, 上下拉, 漏电 |
| **UART** | 串行通信 | 波特率精度, 收发数据, 奇偶校验 |
| **SPI** | 高速同步串行 | Mode, 时序, 主从模式 |
| **I2C** | 两线总线 | 时序, 地址, 多主 |
| **Timer** | 定时/计数 | 计数精度, 分频, 比较捕获 |
| **PWM** | 脉宽调制 | 频率/占空比精度 |
| **WDT** | 看门狗 | 超时时间, 复位功能 |
| **RTC** | 实时时钟 | 计时精度 (LSI 依赖) |

---

## 相关模块

- [[30.areas/MCU/Clock/_index|Clock]] — 外设时钟源
- [[30.areas/MCU/Common/MCU_FT|MCU FT 指南]] — FT 中的外设测试
