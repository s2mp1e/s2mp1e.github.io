---
title: "MCU 知识库"
tags:
  - mcu
  - ate
  - index
created: 2026-07-18
---

# MCU 知识库总览 / MCU Knowledge Base

> **Purpose**: 整理 MCU (Microcontroller Unit) 领域的各模块原理与 ATE 测试方法，形成体系化的知识库。
> **Target Audience**: ATE 测试工程师，MCU 芯片测试方向。

---

## ⭐ 核心参考文档 / Core References

| 文档 | 内容 |
|------|------|
| [[30.areas/MCU/Common/MCU_ATE测试基础\|📖 MCU ATE 测试基础]] | MCU 测试与 PMIC 的差异、测试策略、DFT 基础 |
| [[30.areas/MCU/Common/MCU_Trim\|📖 MCU Trim 完整指南]] | ADC/DAC/OSC/Bandgap 等全模块 Trim 方法 |
| [[30.areas/MCU/Common/MCU_FT\|📖 MCU FT 测试完整指南]] | FT 流程、测试项、Bin 策略、三温 |

---

## 📦 知识库结构 / Structure

### 模拟模块 / Analog Modules

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/MCU/ADC/_index\|ADC]] | SAR/ΣΔ ADC — INL/DNL/SNR/THD/ENOB | [[ADC_原理与测试\|ADC 测试详解]] |
| [[30.areas/MCU/DAC/_index\|DAC]] | DAC — INL/DNL/Settling/Glitch | [[DAC_原理与测试\|DAC 测试详解]] |
| [[30.areas/MCU/PGA_OpAmp/_index\|PGA / OpAmp / Comparator]] | 可编程增益放大器、运放、比较器 | [[PGA_原理与测试\|PGA 测试详解]] |
| [[30.areas/MCU/VREF_Sensor/_index\|VREF / Temp Sensor]] | 基准源、温度传感器校准、电压监测 | [[VREF_TempSensor_测试\|VREF 测试详解]] |

### 数字与存储 / Digital & Memory

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/MCU/Memory/_index\|Flash / SRAM / EEPROM]] | 嵌入式存储 — Program/Erase/Retention/BIST | [[Flash_SRAM_测试\|Memory 测试详解]] |
| [[30.areas/MCU/Clock/_index\|Clock / OSC / PLL]] | 时钟系统 — 频率/Jitter/Lock Time/Trim | [[Clock_OSC_PLL_测试\|Clock 测试详解]] |
| [[30.areas/MCU/Digital_Peripheral/_index\|Digital Peripherals]] | GPIO/UART/SPI/I2C/Timer/PWM/WDT | [[GPIO_UART_SPI_测试\|外设测试详解]] |

### 系统与安全 / System & Security

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/MCU/System/_index\|Power & System]] | Idd 功耗/复位 POR/BOD/内部 LDO | [[Idd_电源_复位_测试\|系统测试详解]] |
| [[30.areas/MCU/DFT/_index\|DFT / Scan / BIST]] | 扫描测试/内建自测试/测试模式 | [[Scan_DFT_测试\|DFT 测试详解]] |
| [[30.areas/MCU/DMA_NVIC/_index\|DMA / NVIC]] | DMA 传输、中断控制器、SysTick | [[DMA_NVIC_测试\|DMA/NVIC 测试详解]] |
| [[30.areas/MCU/Boot_ROM/_index\|Boot ROM / 启动]] | 启动流程、Boot 模式、ISP 烧录 | [[Boot_启动测试\|Boot 测试详解]] |

### 通信与安全 / Communication & Security

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/MCU/Comm_Interface/_index\|USB / CAN / LIN]] | 高速通信接口 — 电气/协议/枚举测试 | [[USB_CAN_LIN_测试\|通信测试详解]] |
| [[30.areas/MCU/Security/_index\|Security]] | AES/TRNG/CRC/SHA/RDP 安全模块 | [[Security_原理与测试\|安全测试详解]] |

### 应用模块 / Application Modules

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/MCU/Touch/_index\|Touch 电容触摸]] | 充电转移检测、灵敏度、抗扰 | [[Touch_原理与测试\|Touch 测试详解]] |
| [[30.areas/MCU/LCD_Driver/_index\|LCD 段码驱动]] | 偏压/波形/帧频/对比度 | [[LCD_段码驱动测试\|LCD 测试详解]] |
| [[30.areas/MCU/Motor_Control/_index\|Motor Control 电机控制]] | 互补 PWM/死区/BRK/编码器 | [[Motor_测试详解\|电机测试详解]] |
| [[30.areas/MCU/BLE_RF/_index\|BLE / RF 无线]] | RF ATE 资源/TX-RX 测试/DTM/校准 | [[BLE_RF_测试详解\|RF 测试详解]] |

### 通用基础 / Common Foundations

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/MCU/Common/_index\|Common Test Methods]] | MCU ATE 基础 / Trim / FT | [[MCU_ATE测试基础]], [[MCU_Trim]], [[MCU_FT]] |

---

## 🔬 MCU 测试的核心维度 / Core Test Dimensions

| 维度 | 典型参数 | 时间尺度 |
|------|---------|---------|
| 数字功能 | Scan Pattern, Functional Pattern | 数字时钟域 |
| 存储测试 | Program/Erase, MBIST, Retention | μs ~ ms (程序) |
| 模拟静态 | INL, DNL, Offset, Gain Error | 稳态 |
| 模拟动态 | SNR, THD, ENOB, SFDR | 频域 |
| 时钟 | FOSC, Jitter, PLL Lock Time | ns ~ ms |
| 功耗 | Idd Run/Sleep/Deep Sleep | 稳态 |
| 外设 | UART/SPI/I2C/Timer/PWM | 协议/时序 |
| Trim | ADC Gain/Offset, OSC, VREF, BOD | 全流程 |

---

## 🆚 MCU vs PMIC 测试差异

| 维度 | PMIC | MCU |
|------|------|-----|
| 核心功能 | 电源转换 | 数字计算 + 模拟采集 |
| 测试重点 | 大电流/效率/保护 | 数字功能/存储/模拟精度 |
| 数字占比 | 少 (I2C/SPI) | 高 (CPU/总线/外设) |
| 模拟精度 | 中等 (±2%) | 高 (ADC 12bit → ±0.02%) |
| DFT | 简单 | 核心 (Scan/BIST) |
| 测试时间 | ~4s/DUT | 10s~60s/DUT |
| Trim 复杂度 | 中等 | 高 (多模块多参数) |

---

## 参考来源 / References

- 主流 MCU 芯片 Datasheet (STM32 / NXP / TI / Renesas / 国产)
- [[30.areas/PMIC/_index|PMIC 知识库]] — 姊妹知识库，模拟测试方法通用
- ATE 测试程序 (Teradyne/Advantest/Chroma 等)
