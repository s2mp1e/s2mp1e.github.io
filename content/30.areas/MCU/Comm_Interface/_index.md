---
title: "Communication Interface 知识库"
tags:
  - mcu
  - usb
  - can
  - lin
  - communication
  - index
created: 2026-07-18
---

# Communication Interface 通信接口

> 中高端 MCU 集成高速通信接口: USB (通用串行总线)、CAN (控制器局域网)、LIN (本地互联网络) 等，用于汽车、工业、消费电子等场景。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/Comm_Interface/USB_CAN_LIN_测试\|USB/CAN/LIN 测试详解]] | 三种接口的原理、电气参数、协议测试方法 |

---

## 接口对比

| 接口 | 速率 | 拓扑 | 应用 |
|------|------|------|------|
| **LIN** | 1~20kbps | 单主多从 (总线) | 汽车车身控制 |
| **CAN** | 125k~1Mbps (FD: 8M) | 多主总线 | 汽车动力/工业 |
| **USB FS** | 12Mbps | 主机-设备 (星型) | 消费电子 |
| **USB HS** | 480Mbps | 主机-设备 | 高速数据 |
| **Ethernet** | 10/100M | 网络 | 工业物联网 |

---

## 相关模块

- [[30.areas/MCU/Digital_Peripheral/_index|Digital Peripherals]] — UART/SPI/I2C 基础接口
- [[30.areas/MCU/Clock/_index|Clock]] — USB 需要 48MHz 精确时钟
- [[30.areas/MCU/Common/MCU_FT|MCU FT 指南]] — FT 中的接口测试
