---
title: "VREF/Temp Sensor 测试详解"
tags:
  - mcu
  - vref
  - bandgap
  - sensor
  - temp
  - ate
created: 2026-07-18
---

# VREF / Temp Sensor 测试详解

---

## 一、Bandgap VREF 测试

### 1.1 MCU 中的 VREF 架构

```
典型 MCU VREF 架构:

Bandgap (1.2V) ──┬──→ ADC 参考 (内部)
                  ├──→ DAC 参考
                  ├──→ Comparator 参考
                  ├──→ 内部 LDO 参考
                  └──→ VREF 引脚 (可选, 外接电容)
```

### 1.2 关键参数

| 参数 | 描述 | 典型规格 |
|------|------|---------|
| **VREF 精度** | 绝对值精度 (Trim 后) | ±0.5%~±1% |
| **TC (温漂)** | 全温范围变化 | < 50 ppm/°C |
| **PSRR** | 电源抑制 | > 60dB @ 1kHz |
| **噪声** | 输出噪声 | < 100 μVpp |
| **启动时间** | 上电到稳定 | < 10 μs |
| **负载调整** | 负载变化影响 (外接引脚时) | < 1% |

### 1.3 ATE 测试方法

```
① VREF 精度测试:
   - 使能 VREF (通过寄存器或引脚)
   - 高阻测量 VREF 引脚电压 (或通过 ADC 间接测)
   - 判断: VREF_target ± 1%

② TC 测试 (三温):
   - Cold: 测 VREF_C
   - Room: 测 VREF_R
   - Hot: 测 VREF_H
   - TC = (Max-Min) / (VREF_R × ΔT) × 1e6 ppm/°C

③ PSRR 测试 (如引脚可测):
   - VDD 叠加 AC 纹波
   - 测 VREF 上的纹波
   - PSRR = 20log(VDD_ripple/VREF_ripple)

④ 通过 ADC 间接测试 (无引脚方案):
   - ADC 使用 VREF 作为参考
   - 输入已知电压 → ADC 结果
   - 反推 VREF 实际值
```

### 1.4 VREF Trim

```
流程:
  ① CP 测量 VREF (直接引脚或经 ADC)
  ② 计算 Trim Code (调整 BG 电阻网络)
  ③ 烧录 OTP
  ④ 复测验证

注意: VREF Trim 必须先于 ADC/DAC Trim
(ADC/DAC 依赖 VREF 作为参考)
```

详见: [[30.areas/PMIC/Analog_Core/Bandgap_原理与测试|PMIC Bandgap 测试]] — 原理完全相同

---

## 二、温度传感器测试

### 2.1 原理

```
MCU 温度传感器常用方案:

① 基于 VBE: VBE 随温度线性变化 (-2mV/°C)
② 基于 ΔVBE: 两个不同电流密度下的 VBE 差
   ΔVBE = (kT/q) × ln(N) — 与温度成正比
③ 输出: 经 ADC 采样 → 数字温度码
```

### 2.2 关键参数

| 参数 | 描述 | 典型规格 |
|------|------|---------|
| **灵敏度** | 电压/码值随温度变化率 | ~4mV/°C (模拟) |
| **精度** | 温度读数误差 | ±2°C ~ ±5°C (校准后 ±1°C) |
| **范围** | 工作温度范围 | -40°C ~ 125°C |
| **线性度** | 偏离线性拟合的程度 | < ±1°C |

### 2.3 校准与测试

```
校准流程 (CP):
  ① 温箱设定 25°C (精确控温)
  ② 芯片热平衡 (等待几分钟)
  ③ 读 ADC 温度码 Code_R
  ④ 温箱设定 85°C
  ⑤ 热平衡 → 读 Code_H
  ⑥ 计算:
     Gain = (85 - 25) / (Code_H - Code_R)   [°C/code]
     Offset = 25 - Gain × Code_R             [°C]
  ⑦ 烧录 Gain/Offset 到 OTP

测试验证 (FT):
  ① 读温度码
  ② T = Gain × Code + Offset
  ③ 与测试温度比对 (< ±2°C)
```

### 2.4 测试注意事项

```
① 热平衡时间: 芯片封装热阻导致结温滞后
   → 需要充分等待 (1~5 分钟)

② 温箱精度: ±0.5°C 以上

③ 芯片自热: 测试时 CPU 运行会发热
   → 测试时使用低功耗配置
   → 或测量时短暂空闲

④ Handler 温控: FT 的三温测试提供温度条件
```

---

## 三、内部电压监测测试

```
MCU 常内置电压监测 (通过 ADC 通道):

① VDD 监测:
   - 内部分压 → ADC 通道
   - 测试: 已知 VDD → 读 ADC → 反推分压比
   - 分压比精度: ±1%

② VBAT 监测 (如支持):
   - 电池电压监测通道
   - 同样验证分压比

③ 分压比校准 (如需要):
   - 测量实际分压比
   - 写入校准系数
```

---

## 四、测试程序实现要点

```
① VREF 测量需要高阻输入 (SMU 高阻模式)
② 温度测试需要精确温控 + 充分热平衡
③ 校准数据 (Gain/Offset) 需要可读寄存器
④ 通过 ADC 间接测量时注意 ADC 自身误差
```

---

## 参考资料

- [[30.areas/PMIC/Analog_Core/Bandgap_原理与测试|PMIC Bandgap 测试]] — 原理通用
- [[30.areas/MCU/ADC/ADC_原理与测试|ADC 测试]] — 间接测量路径
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim 指南]] — VREF/Temp Cal
