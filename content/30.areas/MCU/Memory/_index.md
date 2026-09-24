---
title: "Memory 知识库"
tags:
  - mcu
  - memory
  - flash
  - sram
  - index
created: 2026-07-18
---

# Flash / SRAM / EEPROM 存储

> MCU 的存储系统包括 Flash (程序存储)、SRAM (数据存储) 和 EEPROM/Data Flash (非易失数据)。存储测试是 MCU ATE 的核心环节。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/Memory/Flash_SRAM_测试\|Flash/SRAM 测试详解]] | Flash 读写擦、SRAM BIST、EEPROM 测试方法 |

---

## 存储类型对比

| 类型 | 容量 (典型) | 写入方式 | 擦除单位 | 寿命 | 测试重点 |
|------|------------|---------|---------|------|---------|
| **Flash** | 16KB~2MB | 页编程 | Sector/Page | 10k~100k 次 | Program/Erase/Retention |
| **SRAM** | 2KB~256KB | 直接读写 | Byte | 无限 | MBIST/功能 |
| **EEPROM** | 256B~8KB | 字节编程 | Byte | 100k~1M 次 | Endurance |
| **OTP** | 几 KB | 一次性 | — | 1 次 | 烧录验证 |

---

## 相关模块

- [[30.areas/MCU/DFT/_index|DFT / BIST]] — SRAM 的 MBIST 实现
- [[30.areas/MCU/Common/MCU_FT|MCU FT 指南]] — FT 中的 Memory 测试
