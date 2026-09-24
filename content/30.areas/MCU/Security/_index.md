---
title: "Security 安全模块知识库"
tags:
  - mcu
  - security
  - aes
  - trng
  - crc
  - index
created: 2026-07-18
---

# Security 安全模块

> 安全 MCU 集成硬件加密引擎: AES/DES 加密、TRNG 真随机数、CRC 校验、Hash (SHA) 等，用于固件保护、安全通信、防克隆。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/MCU/Security/Security_原理与测试\|Security 模块测试详解]] | AES/TRNG/CRC/SHA 原理与 ATE 测试方法 |

---

## 安全模块一览

| 模块 | 功能 | 关键测试点 |
|------|------|-----------|
| **AES** | 对称加密 (128/192/256) | 标准向量测试 (NIST/FIPS) |
| **DES/3DES** | 对称加密 (旧标准) | 标准向量测试 |
| **TRNG** | 真随机数生成 | 随机性统计测试 (NIST SP800-22) |
| **CRC** | 循环冗余校验 | 标准多项式验证 |
| **SHA/HMAC** | 哈希/消息认证 | 标准向量测试 |
| **RSA/ECC** (高端) | 公钥加密 | 数学运算验证 |
| **PUF** (高端) | 物理不可克隆 | 唯一性/稳定性 |

---

## 相关模块

- [[30.areas/MCU/Memory/_index|Memory]] — 安全 Flash (RDP 读保护)
- [[30.areas/MCU/Common/MCU_FT|MCU FT 指南]]
