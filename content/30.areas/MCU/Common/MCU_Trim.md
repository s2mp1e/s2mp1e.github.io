---
title: "MCU Trim 完整指南"
tags:
  - mcu
  - trim
  - reference
created: 2026-07-18
---

# MCU Trim 完整指南 / MCU Trim Complete Guide

> MCU 包含大量模拟模块，每个模块都需要修调 (Trim) 来消除工艺偏差。本文涵盖 MCU 各模块的 Trim 方法、流程和策略。

---

## 一、MCU Trim 全景 / Trim Overview

```
MCU 中需要 Trim 的模块:

┌─────────────────────────────────────────┐
│  模拟模块                                │
│  ├── ADC: Offset Trim + Gain Trim       │
│  ├── DAC: Offset Trim + Gain Trim       │
│  ├── PGA: Gain Trim (每档)              │
│  ├── Comparator: Offset Trim            │
│  ├── Bandgap: VREF Trim + TC Trim       │
│  ├── OSC (HSI): Frequency Trim          │
│  ├── OSC (LSI): Frequency Trim          │
│  ├── BOD: Threshold Trim                │
│  ├── POR: Threshold Trim (可选)          │
│  ├── LDO: VOUT Trim                     │
│  └── Temp Sensor: Offset/Gain Cal        │
│                                         │
│  系统级                                  │
│  └── PLL: 校准 (通常无需 Trim)           │
└─────────────────────────────────────────┘
```

---

## 二、ADC Trim

### 2.1 Offset Trim

```
测量:
  ① 配置 ADC 输入 = GND (内部短接或外部 0V)
  ② 采集 N 次取平均
  ③ Code_avg = Offset 实际值
  ④ Offset_Code = -Code_avg (补偿值)

烧录:
  Offset_Code 写入 OTP → 上电自动加载

硬件实现:
  数字域补偿: 转换结果 + Offset_Code
  模拟域补偿: 比较器输入端加补偿 DAC
```

### 2.2 Gain Trim

```
测量:
  ① 配置 ADC 输入 = VREF (满量程)
  ② 采集 N 次取平均
  ③ Gain_Error = (Code_ideal - Code_avg) / Code_ideal
  ④ Gain_Code = 修正值

烧录:
  Gain_Code 写入 OTP

硬件实现:
  调整参考电压 (Ref DAC)
  或数字域增益补偿
```

### 2.3 多通道 Trim 策略

```
多通道 ADC (如 16 通道):

方案 A: 全局 Trim
  所有通道共用一个 Offset/Gain Code
  → 简单, 但通道间失配残留

方案 B: 逐通道 Trim
  每通道独立 Trim Code
  → 精度最高, OTP 面积大

方案 C: 全局 + 通道补偿
  全局 Trim + 每通道小范围修正
  → 折中方案 (最常用)
```

---

## 三、DAC Trim

```
Offset Trim:
  ① Code = 0 → 测 VOUT
  ② VOUT ≠ 0 → Offset 补偿 (运放失调校准)

Gain Trim:
  ① Code = Full Scale → 测 VOUT
  ② 调整参考或增益网络

精度目标:
  12-bit DAC: INL < ±2 LSB, DNL < ±1 LSB
```

---

## 四、PGA Trim

```
每档增益独立 Trim (或多档共享):

① Gain=1: 测增益 → 通常无需 Trim (单位增益结构)
② Gain=2: 测增益 → 调整 RF 比例
③ Gain=4: 测增益 → 调整 RF 比例
...
⑧ Gain=32: 测增益 → 调整 RF 比例

PGA Offset:
  ① 输入短接 (VIN=0)
  ② 测 VOUT (各增益档)
  ③ 输入参考失调 = VOUT / G
  ④ 对最敏感档 (高增益) 重点 Trim
```

---

## 五、OSC Trim (HSI/LSI)

### 5.1 HSI Trim (主时钟)

```
流程:
  ① 默认 Code 测量 FOSC
  ② 目标: 8.000MHz
  ③ 实际: 7.856MHz (-1.8%)
  ④ Trim Step: ~0.5%/Code (设计决定)
  ⑤ Code = +4 → FOSC ≈ 7.856 × 1.02 = 8.013MHz ✓
  ⑥ 烧录

多温度点 Trim (可选):
  ① Room: 测 FOSC_R
  ② Hot (85°C): 测 FOSC_H
  ③ Cold (-40°C): 测 FOSC_C
  ④ 选使全温误差最小的 Code
  ⑤ 或单独存储温度补偿表
```

### 5.2 LSI Trim (低功耗时钟)

```
LSI 精度要求低 (±10%), 但影响:
  • WDT 超时精度
  • RTC 计时精度 (无外晶振时)

Trim 流程与 HSI 类似, Step 更大
```

---

## 六、BOD / POR Trim

```
BOD Threshold Trim:
  ① 配置 BOD Level (默认 Code)
  ② 扫描 VDD 找触发电压
  ③ 触发电压 ≠ 目标 (如 2.8V)
  ④ 计算修正 Code
  ⑤ 烧录 → 复测

每档 Level 独立 Trim Code
```

---

## 七、Temp Sensor 校准

```
温度传感器校准 (不是传统 Trim):

  ① Hot 温度点 (85°C): 读 ADC Code → Code_H
  ② Room 温度点 (25°C): 读 ADC Code → Code_R
  ③ 计算 Gain = (85-25) / (Code_H - Code_R)
  ④ 计算 Offset = 25 - Gain × Code_R
  ⑤ 写入校准寄存器 (或用户可读)
  
用途:
  芯片温度监测、温度补偿
```

---

## 八、MCU Trim 全流程 / Complete Flow

```
CP (晶圆测试):
  ① Bandgap VREF Trim (最先, 其他模块依赖)
  ② OSC HSI Trim
  ③ OSC LSI Trim
  ④ ADC Offset Trim
  ⑤ ADC Gain Trim
  ⑥ DAC Offset/Gain Trim
  ⑦ PGA Gain Trim
  ⑧ Comparator Offset Trim
  ⑨ BOD/POR Threshold Trim
  ⑩ LDO VOUT Trim (如有)
  ⑪ 所有 Trim Code 一次性烧录 OTP
  ⑫ 复测验证所有 Trim 参数

FT (成品测试):
  ⑬ OTP 自动加载验证
  ⑭ 关键 Trim 参数复测
  ⑮ 全参数测试
```

### 依赖关系

```
Bandgap Trim 必须先做:
   VREF → ADC 参考 → ADC Trim
   VREF → DAC 参考 → DAC Trim
   VREF → BOD 比较 → BOD Trim
   VREF → LDO 参考 → LDO Trim

OSC Trim 独立:
   HSI → CPU 时钟 → 后续测试时序
```

---

## 九、Trim 时间优化

```
MCU Trim 项多 → 测试时间长:

优化策略:
  ① 并行测量: 多模块同时测 (独立时)
  ② 减少测量点: 用 2 点代替多点
  ③ 快速算法: 二分搜索代替扫描
  ④ 一次烧录: 所有 Code 收集完一次性烧 OTP
  ⑤ 硬件加速: 内部自校准电路 (Self-Cal)

典型 Trim 测试时间:
  全模块 Trim: 2~5 秒 (CP)
```

---

## 十、常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| Trim 后参数仍偏差 | Step 太大 / 测量误差 | 增加 Bits / 多次平均 |
| 温度漂移超规 | 只做了单温 Trim | 多温度点 Trim |
| OTP 读取错误 | 烧录不完整 | 冗余位 / 复测 |
| ADC 通道间差异 | 只做了全局 Trim | 逐通道 Trim |
| 上电后 Trim 不生效 | OTP 加载失败 | 检查加载时序/POR |

---

## 参考资料

- [[30.areas/MCU/ADC/ADC_原理与测试|ADC 原理与测试]] — ADC Trim 细节
- [[30.areas/MCU/Clock/Clock_OSC_PLL_测试|Clock 测试]] — OSC Trim 细节
- [[30.areas/MCU/System/Idd_电源_复位_测试|系统测试]] — BOD Trim
- [[30.areas/PMIC/Common/Trim|PMIC Trim 指南]] — 存储技术/烧录通用
- [[30.areas/MCU/Common/MCU_FT|MCU FT 完整指南]]
