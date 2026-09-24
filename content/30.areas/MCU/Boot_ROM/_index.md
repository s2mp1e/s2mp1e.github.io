---
title: "Boot ROM 知识库"
tags:
  - mcu
  - boot
  - bootloader
  - index
created: 2026-07-18
---

# Boot ROM / 启动流程

> Boot ROM 是 MCU 上电后最先执行的固化代码，负责启动模式选择、系统初始化、ISP 烧录等功能。Boot 测试确保芯片每次上电都能正确启动。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/Boot_ROM/Boot_启动测试\|Boot 启动测试详解]] | 启动流程、Boot 模式、ISP 烧录、启动时间测试 |

---

## Boot ROM 功能

| 功能 | 描述 |
|------|------|
| **启动模式选择** | 根据 BOOT 引脚选择 Flash/SRAM/System Memory 启动 |
| **系统初始化** | 时钟配置、堆栈初始化 |
| **ISP (In-System Programming)** | 通过 UART/USB 烧录 Flash |
| **IAP (In-Application)** | 运行中自更新固件 |
| **安全启动** (如有) | 固件签名验证 |

---

## 相关模块

- [[30.areas/MCU/Memory/_index|Memory]] — Boot 与 Flash 交互
- [[30.areas/MCU/System/_index|Power & System]] — POR 后启动
- [[30.areas/MCU/Common/MCU_FT|MCU FT 指南]]
