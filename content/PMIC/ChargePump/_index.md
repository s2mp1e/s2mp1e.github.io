---
title: "Charge Pump 知识库"
tags:
  - pmic
  - charge-pump
  - index
created: 2026-07-17
---

# Charge Pump 电荷泵

> Charge Pump (Switched Capacitor Converter) 利用电容储能实现电压转换，不需要电感，适合小电流应用。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/ChargePump/ChargePump_原理与测试\|Charge Pump 原理与测试]] | 工作原理、常见架构、ATE 测试方法 |

---

## Charge Pump vs 电感式 DC-DC

| 对比项 | Charge Pump | Buck/Boost |
|--------|------------|------------|
| 储能元件 | 电容 (飞电容) | 电感 |
| EMI | 低 | 较高 |
| 尺寸 | 小 (无电感) | 较大 |
| 效率 | 中 (理论最高 ~90%) | 高 (>95%) |
| 输出电流 | 小 (< 500mA) | 大 (> 1A) |
| 纹波 | 较大 | 较小 |

---

## 常用架构

| 架构 | 转换比 | 应用 |
|------|--------|------|
| **1x / Bypass** | VOUT = VIN | LDO 直通 |
| **1.5x** | VOUT ≈ 1.5 × VIN | Li-Ion → 5V |
| **2x (Doubler)** | VOUT ≈ 2 × VIN | 1.8V → 3.3V |
| **Inverting** | VOUT ≈ -VIN | 负压生成 |
| **Reconfigurable** | 1x / 1.5x / 2x 自动切换 | 优化效率 |

---

## 相关模块

- [[30.areas/PMIC/LDO/_index|LDO]] — Charge Pump 输出经常再接 LDO 稳压
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
