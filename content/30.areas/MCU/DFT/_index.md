---
title: "DFT 知识库"
tags:
  - mcu
  - dft
  - scan
  - bist
  - index
created: 2026-07-18
---

# DFT / Scan / BIST 可测性设计

> DFT (Design for Test) 是 MCU 数字逻辑测试的基础。通过 Scan Chain、BIST 等结构，让 ATE 能够高效测试大规模数字电路。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/DFT/Scan_DFT_测试\|DFT 测试详解]] | Scan 测试原理、ATPG、MBIST、测试模式 |

---

## DFT 技术一览

| 技术 | 测试对象 | 特点 |
|------|---------|------|
| **Scan Test** | 数字逻辑 | 高覆盖率 (>98%) |
| **MBIST** | SRAM | 自测试、快速 |
| **LBIST** | 数字逻辑 | 自测试、无需 ATE Pattern |
| **JTAG (IEEE 1149.1)** | 互连/边界 | 引脚互连测试 |
| **IDDQ** | CMOS 静态电流 | 检测桥接等缺陷 |
| **Test Mode** | 模拟模块 | 模拟测试专用路径 |

---

## 相关模块

- [[30.areas/MCU/Memory/_index|Memory]] — MBIST 针对 SRAM
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
