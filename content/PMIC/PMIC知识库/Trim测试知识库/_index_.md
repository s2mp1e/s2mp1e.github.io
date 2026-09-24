---
title: PMIC 修调知识库索引 (PMIC Trim Knowledge Base)
description: PMIC 各模块修调 (Trim) 与校准 (Calibration) 的原理与测试方法综合索引
tags:
  - pmic
  - knowledge-base
  - trim
  - calibration
  - index
created: 2026-07-24
aliases:
  - PMIC 修调索引
  - PMIC Trim Index
---

# PMIC 修调知识库索引 (PMIC Trim Knowledge Base Index)

> **本知识库系统整理了 PMIC 各模块的修调 (Trim) / 校准 (Calibration) 原理与测试方法，涵盖从 CP (Chip Probe) 修调到 FT (Final Test) 验证的全流程。**

---

## 目录 (Table of Contents)

1. [什么是 PMIC Trim / 修调](#1-什么是-pmic-trim--修调)
2. [为什么需要 Trim](#2-为什么需要-trim)
3. [Trim 流程概览 (Trim Flow)](#3-trim-流程概览-trim-flow)
4. [各模块修调导航](#4-各模块修调导航)
5. [常见术语表 (Glossary)](#5-常见术语表-glossary)
6. [常用测量技术与仪器](#6-常用测量技术与仪器)
7. [相关参考文件](#7-相关参考文件)

---

## 1. 什么是 PMIC Trim / 修调

**PMIC Trim (修调)** 是指在芯片生产过程中，通过一次性可编程 (OTP) 存储器（如 eFuse、Zener Zap、Poly Fuse 等）对芯片内部的模拟电路参数进行 **微调 (calibration)**，以补偿工艺偏差 (process variation) 带来的性能漂移，使最终产品的电压、电流、时序等关键指标满足规格要求。

通俗地说：**Trim = 给芯片做 "出厂校准"**。

### 修调的对象 (What Gets Trimmed)

| 类别 | 典型修调项 | 英文术语 |
|------|-----------|---------|
| 基准 (Reference) | 带隙基准电压 (VBG)、基准电流 (IREF)、VREF1P0 | Bandgap / VREF / IREF Trim |
| 电压调整器 (LDO) | LDO 输出电压精度 (NOR/ECO 模式) | LDO Output Voltage Trim |
| 升降压变换器 (Buck-Boost) | DMD 点、TON/TOFF 时间、EA Clamp、输出电压、比较器失调 | Buck-Boost Trim |
| 迟滞 Buck (Hysteretic Buck) | LX 电阻、VO_R 电阻、VREF_R 电阻、RC Ton、OCP、负 DMD | Hysteretic Buck Trim |
| 多相 Buck (Multi-Phase Buck) | 时钟频率、PWM 比较器、Ramp Buffer、三角波电阻、EA Clamp、Current Sense、OCP、均流、输出电压 | Multi-Phase Buck Trim |
| 振荡器 (Oscillator) | RC1024K 晶振频率 | RC Oscillator Trim |
| 电流检测 (Current Sense) | EIS 电流检测精度 | EIS Current Trim |
| ADC | HKADC / XOADC 内部上拉电阻 | ADC Pull-Up Resistor Trim |
| 其他 | 库仑计 (Coulomb Counter)、BATID 检测 | Coulomb Counter / BATID Trim |

---

## 2. 为什么需要 Trim

### 2.1 工艺偏差 (Process Variation)

半导体制造过程中，即使在同一晶圆 (wafer) 上，不同 die 之间的 **MOS 管阈值电压 (Vth)**、**电阻方块值 (Rs)**、**电容密度 (Cox)** 等参数也会存在显著差异。这些差异会导致：

- **Bandgap 基准电压漂移**：典型目标 1.20V，实际可能分布在 1.15V ~ 1.25V
- **振荡器频率偏移**：目标 1024KHz，实际可能偏差 ±15%
- **比较器失调电压**：理想为 0，实际存在数 mV 乃至数十 mV 的 offset
- **电流镜匹配误差**：导致 IREF 基准电流不准

### 2.2 PVT 变化

除工艺 (Process) 外，**电压 (Voltage)** 和 **温度 (Temperature)** 的变化也会影响电路性能。Trim 通常在 **常温 (25C)** 下进行，但需保证在全温度范围内仍满足规格。

### 2.3 精度要求

现代 PMIC 对输出电压精度的要求通常为 **±1% ~ ±3%**，某些关键路径甚至要求 **±0.5%**。不经过 Trim，裸片 (die) 的自然分布很难达到这一要求。

### 2.4 成本与良率考量

- **Trim 前**：大量 die 因参数超差被淘汰，良率低
- **Trim 后**：通过微调将参数拉回规格内，大幅提升良率
- **Trim 成本 vs 良率收益**：需要权衡 trim time (测试时间) 与良率提升

---

## 3. Trim 流程概览 (Trim Flow)

典型的 PMIC Trim 流程包含两个阶段：

```mermaid
flowchart LR
    A[晶圆制造<br>Wafer Fab] --> B[CP测试<br>Chip Probe]
    B --> C[Trim Decision<br>修调决策]
    C --> D[OTP Program<br>写入 eFuse]
    D --> E[封装<br>Assembly]
    E --> F[FT测试<br>Final Test]
    F --> G[Trim Verify<br>修调验证]
    G --> H[出货<br>Ship]
```

### 3.1 CP (Chip Probe) 阶段 — Trim 执行

- 在晶圆级对每颗 die 进行探针测试
- 测量关键参数（VBG、VREF、振荡器频率等）
- 计算最优 trim code
- 通过 eFuse / Zener Zap 等 OTP 方式写入修调码
- 关键约束：**探针接触电阻、测试时间 (test time)、并行测试效率**

### 3.2 FT (Final Test) 阶段 — Trim 验证

- 封装完成后进行最终测试
- 验证 trim code 是否正确写入和生效
- 测试修调后的各项参数是否满足规格
- 确认无误后出货

> 详细流程参考：[[PMIC/Trim|Trim 修调总览]] 与 [[PMIC/FT|FT 测试总览]]

---

## 4. 各模块修调导航

### 4.1 基准修调项 (Reference Trims)

| 修调项 | 描述 | 参考文件 |
|-------|------|---------|
| [[修调项/VREF1P0电压修调|VREF1P0 电压修调]] | 1.0V 参考电压精度修调 | Trim.md |
| [[修调项/VBG基准电压修调|VBG 基准电压修调]] | Bandgap 基准电压修调 (典型 1.20V) | Trim.md |
| [[修调项/VREF输出电压精度修调|VREF 输出电压精度修调]] | VREF 输出 buffer 精度修调 | Trim.md |
| [[修调项/IREF基准电流修调|IREF 基准电流修调]] | 基准电流源修调 | Trim.md |

### 4.2 Buck-Boost 修调

| 修调项 | 描述 | 参考文件 |
|-------|------|---------|
| [[修调项/DMD点修调|DMD 点修调]] | 将 Buck-Boost 的 DMD 点修调到目标值 (如 20mA) | Trim.md |
| [[修调项/TON时间修调|TON 时间修调]] | 开关管导通时间修调 | Trim.md |
| [[修调项/TOFF时间修调|TOFF 时间修调]] | 开关管关断时间修调 | Trim.md |
| [[修调项/minTON时间修调|min TON 时间修调]] | 最小导通时间修调 | Trim.md |
| [[修调项/maxTOFF修调|max TOFF 修调]] | 最大关断时间修调 | Trim.md |
| [[修调项/EAclampLOW修调|EA Clamp LOW 修调]] | 误差放大器低端钳位修调 | Trim.md |
| [[修调项/EAclampHIGH修调|EA Clamp HIGH 修调]] | 误差放大器高端钳位修调 | Trim.md |
| [[修调项/BB输出电压修调|BB 输出电压修调]] | Buck-Boost 输出电压精度修调 | Trim.md |
| [[修调项/BB比较器修调|BB 比较器修调]] | VO_DET / Sleep / BK_Mode 比较器失调修调 | Trim.md |

### 4.3 LDO 修调

| 修调项 | 描述 | 参考文件 |
|-------|------|---------|
| [[修调项/LDO normal电压输出修调|LDO Normal 电压输出修调]] | LDO 正常模式输出电压精度修调 | Trim.md |
| [[修调项/LDO eco电压输出修调|LDO ECO 电压输出修调]] | LDO 高效模式输出电压精度修调 | Trim.md |

### 4.4 迟滞 Buck (Hysteretic Buck) 修调

| 修调项 | 描述 | 参考文件 |
|-------|------|---------|
| [[修调项/迟滞buck LX电阻修调|迟滞 Buck LX 电阻修调]] | 电感开关节点电阻修调 | Trim.md |
| [[修调项/迟滞buck VO_R电阻修调|迟滞 Buck VO_R 电阻修调]] | 输出电压反馈电阻修调 | Trim.md |
| [[修调项/迟滞buck VREF_R电阻修调|迟滞 Buck VREF_R 电阻修调]] | 参考电压反馈电阻修调 | Trim.md |
| [[修调项/迟滞buck RC Ton修调|迟滞 Buck RC Ton 修调]] | RC 振荡导通时间修调 | Trim.md |
| [[修调项/迟滞buck输出电压修调|迟滞 Buck 输出电压修调 (带载)]] | 带载条件下输出电压精度修调 | Trim.md |
| [[修调项/迟滞buck POCP修调|迟滞 Buck POCP 修调]] | 峰值过流保护修调 (含 OCP 失调、POCP Sense、OCP 自修调) | Trim.md |
| [[修调项/迟滞buck负DMD修调|迟滞 Buck 负 DMD 修调]] | 负向 DMD 点修调 | Trim.md |

### 4.5 多相 Buck (Multi-Phase Buck) 修调

| 修调项 | 描述 | 参考文件 |
|-------|------|---------|
| [[修调项/多相buck时钟频率修调|多相 Buck 时钟频率修调]] | 开关时钟频率修调 | Trim.md |
| [[修调项/多相buck PWM比较器修调|多相 Buck PWM 比较器修调]] | NOR/ECO 模式 PWM 比较器修调 | Trim.md |
| [[修调项/多相buck ramp buffer修调|多相 Buck Ramp Buffer 修调]] | NOR/ECO 模式斜坡缓冲器修调 | Trim.md |
| [[修调项/多相buck三角波电阻修调|多相 Buck 三角波电阻修调]] | 三角波发生器电阻修调 | Trim.md |
| [[修调项/多相buck EA clamp修调|多相 Buck EA Clamp 修调]] | 误差放大器钳位范围修调 | Trim.md |
| [[修调项/多相buck current sense修调|多相 Buck Current Sense 修调]] | 电流检测开环/闭环修调 | Trim.md |
| [[修调项/多相buck OCP修调|多相 Buck OCP 修调]] | POCP (正过流) 与 NOCP (负过流) 修调 | Trim.md |
| [[修调项/多相buck负DMD修调|多相 Buck 负 DMD 修调]] | 负向 DMD 点修调 | Trim.md |
| [[修调项/多相buck均流修调|多相 Buck 均流修调]] | Current Share 修调，各相电流平衡 | Trim.md |
| [[修调项/多相buck输出电压精度修调|多相 Buck 输出电压精度修调]] | 输出电压精度修调 | Trim.md |

### 4.6 其他修调项

| 修调项 | 描述 | 参考文件 |
|-------|------|---------|
| [[修调项/RC1024K晶振修调|RC1024K 晶振修调]] | 1024KHz 振荡器频率修调 | Trim.md |
| [[修调项/EIS电流修调|EIS 电流修调]] | 电化学阻抗谱电流检测修调 | Trim.md |
| [[修调项/XOADC上拉电阻修调|XOADC 上拉电阻修调]] | XOADC 内部上拉电阻精度修调 | Trim.md |
| [[修调项/HKADC上拉电阻修调|HKADC 上拉电阻修调]] | HKADC 内部上拉电阻精度修调 | Trim.md |
| [[修调项/库仑计修调|库仑计修调]] | Coulomb Counter 电量计精度修调 | Trim.md |
| [[修调项/BATID修调|BATID 修调]] | 电池 ID 检测电阻修调 | Trim.md |

---

## 5. 常见术语表 (Glossary)

### 5.1 修调相关术语

| 术语 | 全称 / 中文 | 说明 |
|------|------------|------|
| **Trim** | 修调 / 微调 | 通过 OTP 调整芯片内部参数的过程 |
| **Calibration** | 校准 | 使测量值与标准值对齐的过程，与 Trim 常混用 |
| **Trim Code** | 修调码 | 存入 OTP 的数字值，决定修调量 |
| **LSB** | Least Significant Bit / 最低有效位 | Trim code 的最低位，代表最小调整步进 |
| **Trim Step** | 修调步进 | 每 1 LSB 对应的物理量变化 (如 5mV/step) |
| **Trim Range** | 修调范围 | 修调码能覆盖的总调整范围 (如 ±15%) |
| **Coarse Trim** | 粗调 | 大步进、大范围的粗调级 |
| **Fine Trim** | 精调 | 小步进、高精度的微调级 |
| **Redundancy Trim** | 冗余修调 | 备用修调位，用于弥补首次修调的不足 |

### 5.2 存储技术术语

| 术语 | 全称 / 中文 | 说明 |
|------|------------|------|
| **OTP** | One-Time Programmable / 一次性可编程 | 只能写入一次的非易失存储器 |
| **MTP** | Multi-Time Programmable / 多次可编程 | 可多次擦写的非易失存储器 |
| **eFuse** | Electronic Fuse / 电子熔丝 | 通过电迁移效应熔断的 OTP 器件 |
| **Zener Zap** | 齐纳击穿 | 通过反向击穿使 PN 结短路的 OTP 方式 |
| **Poly Fuse** | 多晶硅熔丝 | 通过大电流熔断多晶硅电阻 |
| **Anti-Fuse** | 反熔丝 | 通过栅氧击穿形成导电路径 |
| **Program** | 编程 / 写入 | 将 trim code 写入 OTP 的过程 |
| **Verify (Readback)** | 回读验证 | 编程后读出 OTP 值确认写入正确 |

### 5.3 测试相关术语

| 术语 | 全称 / 中文 | 说明 |
|------|------------|------|
| **CP** | Chip Probe / 晶圆探针测试 | 晶圆级测试，通常在此阶段执行 Trim |
| **FT** | Final Test / 最终测试 | 封装后测试，验证 Trim 结果 |
| **ATE** | Automatic Test Equipment / 自动测试设备 | 自动执行测试的仪器系统 |
| **DUT** | Device Under Test / 待测器件 | 正在被测试的芯片 |
| **Test Time** | 测试时间 | 影响测试成本的关键指标，Trim 需要精打细算 |
| **Parallel Test** | 并行测试 | 同时测试多颗 DUT 以降低单颗测试成本 |

### 5.4 电路与参数术语

| 术语 | 全称 / 中文 | 说明 |
|------|------------|------|
| **Bandgap (VBG)** | 带隙基准 | 产生与温度无关的基准电压 (约 1.20V) |
| **VREF** | Voltage Reference / 参考电压 | 经 buffer 后的高精度参考电压 |
| **IREF** | Current Reference / 参考电流 | 基准电流源 |
| **LDO** | Low Dropout Regulator / 低压差线性稳压器 | 低压差电压调整器 |
| **DMD** | DCM-CCM 切换点 | 轻载时 DCM 与重载时 CCM 的转换点电流 |
| **TON / TOFF** | Turn-On / Turn-Off Time | 功率管导通/关断时间 |
| **EA Clamp** | Error Amplifier Clamp | 误差放大器输出钳位电压 |
| **OCP** | Over Current Protection / 过流保护 | 过流保护阈值 |
| **POCP / NOCP** | Positive / Negative OCP | 正/负方向过流保护 |
| **Current Sense** | 电流检测 | 检测电感/功率管电流的电路 |
| **Current Share** | 均流 | 多相变换器中各相电流均衡 |
| **Offset Voltage** | 失调电压 | 比较器/运放输入端的直流偏差 |
| **INL / DNL** | Integral / Differential Nonlinearity | ADC 的积分/微分非线性 |

---

## 6. 常用测量技术与仪器

### 6.1 电压测量

| 技术 | 仪器 | 典型应用 | 精度 |
|------|------|---------|------|
| **DVM (数字电压表)** | DMM (如 Keysight 3458A) | 基准电压、LDO 输出 | 6.5 ~ 8.5 位 |
| **ATE 电压测量单元 (VMU)** | Teradyne ETS-88 / Advantest 93k | CP/FT 自动测量 | 16~24 bit ADC |
| **差分测量** | DVM + 差分探头 | 小信号精密测量 | 消除共模噪声 |
| **四线开尔文测量 (4-Wire Kelvin)** | SMU (源测量单元) | 低阻抗、高精度电压测量 | 消除接触电阻影响 |
| **高速电压采样** | 数字化仪 (Digitizer) | 纹波测量、瞬态响应 | 12~16 bit, ~100Msps |

### 6.2 电流测量

| 技术 | 仪器 | 典型应用 | 注意事项 |
|------|------|---------|---------|
| **SMU (源测量单元)** | Keithley 2400 / 2650 系列 | 静态电流、关机电流 | 注意量程切换 |
| **电流探头 (Current Probe)** | 示波器 + 电流探头 | 电感电流波形、DMD 点 | 需去磁校准 |
| **分流电阻 (Shunt)** | 精密电阻 + DVM | 大电流测量 | 注意功率耗散和温升 |
| **ATE 电流测量单元 (IMU)** | ATE 系统内置 | FT 电流测试 | 需配合 Force/Measure |

### 6.3 时序与频率测量

| 技术 | 仪器 | 典型应用 |
|------|------|---------|
| **示波器 (Oscilloscope)** | 4通道 500MHz ~ 1GHz | TON/TOFF 时间、缓起时间、开关波形 |
| **频率计 (Frequency Counter)** | 通用计数器 | 晶振频率、LX 开关频率 |
| **时间间隔测量 (TIA)** | ATE 时序测量单元 | min TON、max TOFF |
| **眼图分析 (Eye Diagram)** | 高速示波器 | 时钟抖动、信号完整性 |

### 6.4 修调专用测试技术

| 技术 | 说明 | 应用场景 |
|------|------|---------|
| **Binary Search Trim** | 二分搜索法快速找到最优 trim code | 多数电压/电流修调 |
| **逐次逼近 Trim** | 从 MSB 到 LSB 逐位决定 | DAC-based trim |
| **Shmoo Plot** | 扫描 trim code vs 参数值，可视化最优工作点 | 复杂参数调优 |
| **Correlation Trim** | 利用常温测试结果推算高温行为，减少温度测试时间 | 温度相关修调 |
| **Trim Redundancy Check** | 冗余位校验，确保首次修调失败后的备用方案 | 高可靠性产品 |

### 6.5 测试环境注意事项

| 项目 | 说明 |
|------|------|
| **探针接触电阻 (Probe Contact R)** | CP 测试中接触不良会导致错误的 trim decision |
| **温度控制 (Temperature)** | Trim 需在稳定温度下进行，通常 25C ± 2C |
| **噪声抑制 (Noise Rejection)** | 平均采样 (averaging)、屏蔽 (shielding)、滤波 (filtering) |
| **开尔文连接 (Kelvin Connection)** | 强制/检测线分离，消除线阻影响 |
| **热效应 (Self-Heating)** | 大电流测试时 DUT 自热会导致参数漂移 |
| **Rheometry (流变)** | Force/Measure 切换时的建立时间 (settling time) |

---

## 7. 相关参考文件

### 核心文档

| 文件 | 描述 |
|------|------|
| [[../Trim.md|Trim.md — 修调总览]] | PMIC 各模块修调项的完整清单与简要说明 |
| [[../FT.md|FT.md — 最终测试总览]] | PMIC 各模块 FT 测试项的完整清单与简要说明 |
| [[../FT测试知识库/_index_.md|FT 测试知识库（原理与方法）]] | 各模块 FT 测试原理与测试方法的详细知识库 |

### 各模块详细修调文档

> 以下子页面尚未创建，建议按需补充详细内容：

| 文件路径 | 预期内容 |
|---------|---------|
| 修调项/VREF1P0电压修调.md | VREF1P0 修调原理、测试电路、算法、规格限制 |
| 修调项/VBG基准电压修调.md | Bandgap trim 电路结构、温度系数修调、code 映射 |
| 修调项/IREF基准电流修调.md | 电流基准 trim 方法、比例镜像修调 |
| 修调项/RC1024K晶振修调.md | RC 振荡器频率修调、电容/电阻 bank 切换 |
| 修调项/DMD点修调.md | Buck-Boost DCM/CCM 切换点 trim 方法 |
| 修调项/TON时间修调.md | 导通时间 trim，含 RC 延迟与比较器方式 |
| 修调项/BB输出电压修调.md | Buck-Boost 输出电压反馈分压电阻 trim |
| 修调项/LDO normal电压输出修调.md | LDO 反馈电阻 trim、code 步进计算 |
| 修调项/迟滞buck POCP修调.md | OCP 比较器失调 trim、Sense 电阻 trim、自修调算法 |
| 修调项/多相buck current sense修调.md | Current sense 开环/闭环 trim 方法 |
| 修调项/多相buck均流修调.md | 多相电流均衡 trim，含 Master-Slave 架构 |
| 修调项/EIS电流修调.md | EIS (电化学阻抗谱) 电流检测 trim |
| 修调项/XOADC上拉电阻修调.md | XOADC 内部上拉电阻精度 trim |
| 修调项/HKADC上拉电阻修调.md | HKADC 内部上拉电阻精度 trim |
| 修调项/库仑计修调.md | Coulomb Counter 电量计增益/失调 trim |
| 修调项/BATID修调.md | 电池 ID 检测电阻分压 trim |

---

## 附录

### A. Trim Code 计算示例

假设 VREF 的理想值为 1.000V，实测值为 0.985V，trim 步进为 5mV/LSB：

```
偏差 = 1.000 - 0.985 = 15mV
所需 Code = 15 / 5 = 3 (十进制)
写入二进制 Trim Code = 0011 (4-bit)
```

### B. 常见问题 (FAQ)

**Q: Trim 为什么在 CP 做而不在 FT 做？**
A: CP 阶段可接触晶圆上的所有管脚和测试 pad，修调电路可直接访问。FT 时芯片已封装，部分测试点无法直接接触。且 CP 阶段发现不良可节约封装成本。

**Q: eFuse 和 Zener Zap 有什么区别？**
A: eFuse 利用电迁移效应熔断金属线，需要精确控制电流和时间；Zener Zap 利用 PN 结反向击穿使其短路，能量要求较低。eFuse 更可靠但面积较大，Zener Zap 面积小但可能有漏电风险。

**Q: 为什么有的 trim 需要多次迭代？**
A: 某些参数之间存在耦合。例如，VBG trim 后会影响 VREF，VREF trim 后可能又反过来微调 VBG。需要多次迭代逼近最优值。

**Q: Trim 失败后的处理流程是什么？**
A: 通常有 Redundancy Trim (备用修调位)，若主修调失败则使用备用位。若备用位也失败，则判定为良率损失 (yield loss)。

---

> **本知识库持续更新中。如需补充新的修调项或修正已有内容，请参照现有格式提交修改。**
>
> 最后更新: 2026-07-24
