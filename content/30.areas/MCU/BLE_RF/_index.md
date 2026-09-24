---
title: "BLE / RF 无线测试知识库"
tags:
  - mcu
  - ble
  - rf
  - wireless
  - index
created: 2026-07-18
---

# BLE / RF 无线测试

> 无线 MCU (Wireless MCU) 集成 BLE (低功耗蓝牙)、Zigbee、Sub-GHz 等射频收发器。RF 测试需要专门的 RF ATE 资源和测试环境，是 MCU 测试中技术门槛最高的领域。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/BLE_RF/BLE_RF_测试详解\|BLE/RF 测试详解]] | RF ATE 资源、TX/RX 测试、DTM 模式、校准 |

---

## 无线 MCU 概览

| 协议 | 频段 | 速率 | 调制 | 典型应用 |
|------|------|------|------|---------|
| **BLE** | 2.4GHz | 1~2 Mbps | GFSK | 穿戴/物联网 |
| **Zigbee** | 2.4GHz | 250kbps | O-QPSK | 智能家居 |
| **Wi-Fi** | 2.4/5GHz | 高 | OFDM | 网络设备 |
| **Sub-GHz** | 433/868/915MHz | 低 | FSK/GFSK | 工业/抄表 |
| **NB-IoT** | 授权频段 | 低 | QPSK | 蜂窝物联网 |

---

## RF 测试关键维度

| 维度 | TX (发射) | RX (接收) |
|------|----------|----------|
| **功率** | 输出功率、功率控制范围 | 灵敏度 |
| **频率** | 频率精度、频偏 | 频率容限 |
| **调制** | 调制质量 (DEVM/Frequency Error) | PER (误包率) |
| **频谱** | 频谱掩模、杂散 | 阻塞、邻道抑制 |
| **系统** | — | BER/PER vs 输入功率 |

---

## 相关模块

- [[30.areas/MCU/Clock/_index|Clock]] — RF 频率源 (晶振精度影响频偏)
- [[30.areas/MCU/System/_index|Power & System]] — 无线 MCU 功耗测试
- [[30.areas/MCU/Common/MCU_FT|MCU FT 指南]] — RF FT 策略
