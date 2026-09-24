---
title: "Bandgap 原理与测试"
tags:
  - pmic
  - analog
  - bandgap
  - principle
  - ate
created: 2026-07-17
---

# Bandgap 原理与测试

---

## 一、基本原理

Bandgap (带隙基准) 产生一个与温度无关的参考电压，通常为 1.2V (硅的带隙电压)。

### 原理公式

$$
V_{REF} = V_{BE} + K \times \Delta V_{BE}
$$

- **VBE** (负温度系数, ~-2mV/°C)
- **ΔVBE** (正温度系数, ~+0.085mV/°C)
- **K** 是比例系数

调整 K 使两者温漂抵消 → VREF 在目标温度范围内稳定。

---

## 二、关键测试参数

| 参数 | 描述 | 典型值 |
|------|------|--------|
| **VREF** | 基准电压值 | 0.6V / 0.8V / 1.2V |
| **Temperature Coefficient (TC)** | 温漂系数 | 10~50 ppm/°C |
| **Line Regulation** | 输入电压变化影响 | < 0.1%/V |
| **PSRR** | 电源纹波抑制 | > 60dB @ 1kHz |
| **Output Noise** | 输出噪声 | < 10 μVrms |
| **Startup Time** | 建立时间 | < 10 μs |
| **Trim Range** | 修调范围 | ±5% |

---

## 三、ATE 测试方法

### 3.1 VREF 精度

```
条件: VIN 正常, 室温
步骤:
  1. 使能 Bandgap
  2. 等待建立 (几 μs)
  3. 测量 VREF 引脚电压
  4. 无需负载 (高阻测量)
判断: VREF ± 2% (Trim 后 ± 0.5%)
```

### 3.2 温漂系数 (TC)

```
条件: 温箱三温测试
步骤:
  1. Cold (-40°C): 测 VREF_C
  2. Room (25°C): 测 VREF_R
  3. Hot (125°C): 测 VREF_H
  4. TC = (MAX(VREF) - MIN(VREF)) / (VREF_25C × ΔT) × 1e6 ppm/°C
判断: TC < 50 ppm/°C
```

### 3.3 Line Regulation

```
条件: 温度固定, VIN sweep
步骤:
  1. VIN 从最低到最高 sweep
  2. 测量 VREF 变化
  3. Line Reg = ΔVREF / ΔVIN
判断: < 0.1%/V
```

### 3.4 Startup Time

```
条件: EN 从 LOW→HIGH
步骤:
  1. 置 EN = HIGH
  2. 监测 VREF 波形
  3. 测量 EN 上升沿 → VREF 达到 90% 的时间
判断: 符合设计规格
```

---

## 参考资料

- [[30.areas/PMIC/Analog_Core/Oscillator_原理与测试|Oscillator 测试]] — 类似的内核测试方法
- [[30.areas/PMIC/Digital_Interface/OTP_EFUSE_Trim|OTP/EFUSE/Trim]] — Bandgap 修调存储
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
