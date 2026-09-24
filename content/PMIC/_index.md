---
title: "PMIC 知识库"
tags:
  - pmic
  - ate
  - index
created: 2026-07-17
---

# PMIC 知识库总览 / PMIC Knowledge Base

> **Purpose**: 整理 PMIC (Power Management IC) 领域的各模块原理与 ATE 测试方法，形成体系化的知识库。
> **Target Audience**: ATE 测试工程师，尤其是 PMIC 芯片测试方向。

---

## ⭐ 核心参考文档 / Core References

> 这两份文档是 PMIC 测试的完整参考指南，涵盖跨模块的全流程知识。

| 文档 | 内容 | 阅读时长 |
|------|------|:---:|
| [[30.areas/PMIC/Common/Trim\|📖 PMIC Trim 完整指南]] | 全模块 Trim 方法、存储技术、CP 流程、计算方式、Guard Band | 30 min |
| [[30.areas/PMIC/Common/FT\|📖 FT 测试完整指南]] | FT 硬件/流程/测试项/Bin 策略/三温 FT/DIB 设计/数据 | 35 min |

---

## 📦 知识库结构 / Structure

### 核心转换器 / Core Converters

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/PMIC/Buck/_index\|Buck Converter]] | 降压转换器 — PWM/COT/PSM + Ton & ACT TIME | [[Buck_基本原理]], [[Buck_Ton与ACT_TIME测试\|Ton & ACT TIME]], [[Buck_测试项目总览\|测试项目]] |
| [[30.areas/PMIC/Boost/_index\|Boost Converter]] | 升压转换器 — 启动挑战、OCP | [[Boost_基本原理与测试]] |
| [[30.areas/PMIC/Buck-Boost/_index\|Buck-Boost Converter]] | 升降压转换器 — 4-Switch 架构、模式切换 | [[Buck-Boost_原理与测试]] |
| [[30.areas/PMIC/ChargePump/_index\|Charge Pump]] | 电荷泵 — 倍压/反压/可重构 | [[ChargePump_原理与测试]] |

### 线性与驱动 / Linear & Drivers

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/PMIC/LDO/_index\|LDO]] | 低压差线性稳压器 — Dropout/PSRR/Noise | [[LDO_原理与测试]] |
| [[30.areas/PMIC/LED_Driver/_index\|LED Driver]] | LED 驱动 — 背光/闪光灯/调光 | [[LED_Driver_原理与测试]] |
| [[30.areas/PMIC/LoadSwitch/_index\|Load Switch / eFuse]] | 负载开关 — Rdson/限流/Active Discharge | [[LoadSwitch_原理与测试]] |

### 电池管理 / Battery Management

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/PMIC/Charger/_index\|Battery Charger]] | 充电管理 — CC/CV/NVDC/安全 | [[Charger_原理与测试]] |

### 保护与监控 / Protection & Monitoring

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/PMIC/Protection/_index\|Protection]] | OVP/UVLO/OCP/SCP/OTP/PG | [[OVP_OCP_OTP_UVLO\|保护功能测试详述]] |
| [[30.areas/PMIC/Thermal/_index\|Thermal Management]] | 热管理 — OTP/TSD/热阻/三温 | [[Thermal_原理与测试]] |

### 模拟核心 / Analog Core

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/PMIC/Analog_Core/_index\|Analog Core]] | Bandgap / OSC / Bias / POR | [[Bandgap_原理与测试\|Bandgap]], [[Oscillator_原理与测试\|Oscillator]] |

### 数字接口 / Digital Interface

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/PMIC/Digital_Interface/_index\|Digital Interface]] | I2C/SPI/OTP/EFUSE/Trim | [[I2C_SPI_测试\|I2C/SPI]], [[OTP_EFUSE_Trim\|OTP/EFUSE/Trim]] |

### 系统集成 / System Integration

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/PMIC/PMU/_index\|Multi-Rail PMU]] | 多路电源管理 — 交叉耦合/并行测试 | [[PMU_架构与测试]] |
| [[30.areas/PMIC/Power_Sequencer/_index\|Power Sequencer]] | 电源时序控制 — 上下电序列 | [[Sequencer_原理与测试]] |

### 通用基础 / Common Foundations

| 模块 | 描述 | 关键页面 |
|------|------|---------|
| [[30.areas/PMIC/Common/_index\|Common Test Methods]] | ATE 基础 / 时序测量 / DC 测试 | [[ATE测试基础]], [[时序测试]] |

---

## 🔬 PMIC 测试的核心维度 / Core Test Dimensions

| 维度 | 典型参数 | 时间尺度 | 涉及模块 |
|------|---------|---------|---------|
| DC 参数 | VOUT, IOUT, Icc, Iq, Rdson | 稳态 | Buck, LDO, LoadSwitch, Charger |
| 时序参数 | Ton, Toff, Fsw, Dead Time, Startup | **ns ~ ms** | Buck, Boost, Power Sequencer |
| 动态参数 | Load Transient, Line Transient | μs ~ ms | Buck, LDO, PMU |
| 保护功能 | OVP, OCP, OTP, UVLO, PG | 触发验证 | Protection, Thermal |
| 通信接口 | I2C/SPI R/W, Timing | 数字协议 | Digital Interface |
| 修调校准 | Trim Code, Program, Verify | 全流程 | Analog Core, OTP/EFUSE |
| 系统级 | Sequencing, Cross Regulation, Total Iq | 系统级 | PMU, Sequencer |

---

## 🧪 PMIC 测试核心原则

1. **CP vs FT 分工明确** — CP 测 Trim 和基础 DC，FT 覆盖 AC/Timing/Protection
2. **先功能后性能** — 先验证基本功能 (启动/通信/输出)，再测精度/时序
3. **保护功能必须测** — OCP/SCP/OVP/OTP 是可靠性关键
4. **温度覆盖全面** — Hot/Room/Cold 三温测试
5. **Trim 流程闭环** — 测 → 算 → 烧 → 验
6. **硬件设计是基础** — Kelvin/Relay/去耦/散热决定测试质量

---

## 参考来源 / References

- [[Clippings/异步与同步Buck对比]] — 基础 Buck 文章
- 各芯片 Datasheet / Application Note
- ATE 测试程序 (Teradyne/Advantest/Chroma 等)
