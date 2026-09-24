---
title: "Buck-Boost 知识库"
tags:
  - pmic
  - buck-boost
  - index
created: 2026-07-17
---

# Buck-Boost 升降压转换器

> Buck-Boost Converter 可以在输入电压高于或低于输出电压时正常工作，广泛应用于电池供电设备（如手机、笔记本电脑）。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Buck-Boost/Buck-Boost_原理与测试\|Buck-Boost 原理与测试]] | Buck-Boost 工作原理、4-Switch 架构、测试方法 |

---

## Buck-Boost vs Buck vs Boost

| 对比项 | Buck | Boost | Buck-Boost |
|--------|------|-------|------------|
| VOUT vs VIN | VOUT < VIN | VOUT > VIN | VOUT 可高可低 |
| 典型应用 | 5V→1.8V | 3.7V→5V | 锂电池 (2.7V~4.2V) → 3.3V |
| 拓扑复杂度 | 低 | 中 | 高 (4-Switch) |
| 效率 | 高 (>95%) | 高 (>90%) | 中高 (>85%) |
| 常见架构 | PWM/COT | PWM | 4-Switch / SEPIC |

---

## 相关模块

- [[30.areas/PMIC/Buck/_index|Buck Converter]]
- [[30.areas/PMIC/Boost/_index|Boost Converter]]
