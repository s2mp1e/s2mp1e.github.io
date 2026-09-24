---
title: "DMA / NVIC 知识库"
tags:
  - mcu
  - dma
  - nvic
  - interrupt
  - index
created: 2026-07-18
---

# DMA / NVIC 系统控制器

> DMA (直接内存访问) 和 NVIC (嵌套向量中断控制器) 是 MCU 的系统级核心模块，决定数据搬运效率和中断响应能力。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/DMA_NVIC/DMA_NVIC_测试\|DMA/NVIC 测试详解]] | DMA 传输测试、中断控制器测试、异常处理 |

---

## 模块功能

| 模块 | 功能 | 关键测试点 |
|------|------|-----------|
| **DMA** | 无需 CPU 的数据搬运 | 传输正确性、传输速率、源/目的地址 |
| **NVIC** | 中断优先级管理 | 优先级抢占、中断响应时间、向量跳转 |
| **SysTick** | 系统节拍定时器 | 计时精度 (Cortex-M 核心) |
| **MPU** (如有) | 内存保护 | 区域保护、违规检测 |

---

## 相关模块

- [[30.areas/MCU/Digital_Peripheral/_index|Digital Peripherals]] — DMA 常配合 UART/SPI/ADC
- [[30.areas/MCU/Clock/_index|Clock]] — SysTick 时钟源
