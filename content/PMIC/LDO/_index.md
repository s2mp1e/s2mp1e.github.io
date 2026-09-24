---
title: "LDO 知识库"
tags:
  - pmic
  - ldo
  - index
created: 2026-07-17
---

# LDO 低压差线性稳压器

> LDO (Low Dropout Regulator) 提供低噪声、低纹波的稳定输出电压，常用于噪声敏感电路。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/LDO/LDO_原理与测试\|LDO 原理与测试]] | LDO 工作原理、关键参数、ATE 测试方法 |

---

## 核心测试参数

- VOUT Accuracy / Dropout Voltage
- Quiescent Current (Iq)
- PSRR / Noise
- Load/Line Regulation
- Load Transient
- Current Limit / OCP

---

## 相关模块

- [[30.areas/PMIC/Buck/_index|Buck Converter]] — Buck 常作为 LDO 的前级
