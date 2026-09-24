---
title: "Boost Converter 知识库"
tags:
  - pmic
  - boost
  - dcdc
  - index
created: 2026-07-17
---

# Boost Converter 升压转换器

> Boost Converter (升压转换器) 将较低输入电压转换为较高输出电压，常用于电池供电系统的电压升压。

---

## 子页面

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Boost/Boost_基本原理与测试\|Boost 基本原理与测试]] | Boost 工作原理、关键参数、测试方法 |

---

## Boost 与 Buck 的核心区别

| 对比项 | Buck | Boost |
|--------|------|-------|
| 功能 | 降压 | 升压 |
| HS MOS 位置 | 输入端 (VIN 侧) | 输出端 (VOUT 侧) |
| 电感连接 | VIN → L → SW → COUT | VIN → L → SW → D → COUT |
| 占空比关系 | VOUT = D × VIN | VOUT = VIN / (1-D) |
| HS 导通时 | 电感储能 + 供电 | 电感储能 |
| HS 关断时 | 电感续流 | 电感储能 + 供电 |
| 启动挑战 | 相对简单 | 需要防浪涌/限流 |

---

## 关键测试参数

- **VOUT Accuracy** — 输出电压精度 (关系: VOUT = VIN/(1-D))
- **Efficiency** — 效率 (全负载范围)
- **Inductor Current / Ripple** — 电感电流纹波 (Boost 纹波一般更大)
- **Load Regulation** — 负载调整率
- **Line Regulation** — 线性调整率
- **Startup / ACT TIME** — 启动时间 (VIN → VOUT 建立)
- **OCP / SCP** — 过流/短路保护
- **OVP** — 过压保护 (输出过压，Boost 特有挑战)

---

## 相关模块

- [[30.areas/PMIC/Buck/_index|Buck Converter]] — Buck/Boost 经常组合成 Buck-Boost 拓扑
- [[30.areas/PMIC/Protection/_index|保护功能]]
