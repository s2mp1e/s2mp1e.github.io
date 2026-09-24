---
title: "Buck Converter 测试知识库"
tags:
  - pmic
  - buck
  - dcdc
created: 2026-07-17
---

# Buck Converter 降压转换器

> Buck Converter (降压转换器) 是 PMIC 中最核心的模块之一，负责将较高电压高效转换为较低电压。

---

## 子页面 / Subpages

| 页面 | 内容 |
|------|------|
| [[30.areas/PMIC/Buck/Buck_基本原理\|Buck 基本原理]] | Buck 工作原理、架构对比 (同步/异步、COT/PWM/PSM) |
| [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试\|Ton 与 ACT TIME 测试]] | 基于实际案例的 Ton 和 ACT TIME 详细测试方法 |
| [[30.areas/PMIC/Buck/Buck_测试项目总览\|Buck 测试项目总览]] | 完整的 Buck ATE 测试项目清单 |

---

## Buck 测试的关键挑战

1. **时序精度** — Ton 在 ns 级别，需要高精度 timing 测量
2. **负载变化** — 需要覆盖空载到满载全范围
3. **效率权衡** — 高频 vs 高效率的平衡
4. **保护验证** — 过流、过压、欠压等保护功能验证
5. **多相/多路** — 复杂 PMIC 中多路 Buck 的交叉影响

---

## 相关模块

- [[30.areas/PMIC/LDO/LDO_原理与测试|LDO]] — 通常与 Buck 搭配使用，Buck 做预降压，LDO 做精细稳压
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能]] — Buck 的 OCP/OVP 测试
