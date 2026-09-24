---
title: "Oscillator 原理与测试"
tags:
  - pmic
  - analog
  - oscillator
  - principle
  - ate
created: 2026-07-17
---

# Oscillator 原理与测试

---

## 一、基本原理

PMIC 中的振荡器为芯片提供时钟基准，常用于：
- Buck/Boost 开关频率
- Charge Pump 开关频率
- POR / Watchdog Timer
- Soft Start Timer

### 常见架构

```
RC Oscillator:

VIN ────┐
         │
         R
         │
         ├───────┬─────── VOSC (比较器输入)
         │       │
        ─── C    │
         │       │
        GND     ┌┴┐
                └─┘ (比较器 → 数字逻辑)
```

频率由 R 和 C 决定：

$$
F_{OSC} = \frac{1}{K \times R \times C}
$$

---

## 二、关键测试参数

| 参数 | 描述 | 典型值 |
|------|------|--------|
| **FOSC** | 振荡频率 | 100kHz ~ 5MHz |
| **FOSC Accuracy (Trimmed)** | 频率精度 (修调后) | ±2% ~ ±5% |
| **FOSC vs VIN** | 频率 vs 电压稳定性 | < 1%/V |
| **FOSC vs Temp** | 频率 vs 温度稳定性 | < 1%/°C |
| **Jitter (Cycle-Cycle)** | 周期抖动 | < 0.5% |
| **Duty Cycle** | 占空比 | 50% ± 5% |
| **Startup Time** | 起振时间 | < 几 μs |

---

## 三、ATE 测试方法

### 3.1 频率测量

```
条件: VIN 正常, 使能芯片
步骤:
  1. 找到可测的时钟输出引脚 (CLK_OUT / SW / Test Mux)
  2. 使用 TMU 或 Counter
  3. 测量 256 或 1024 个周期取平均
  4. FOSC = N / (t_N - t_0)
判断: FOSC 在目标 ±5% 内
```

### 3.2 Duty Cycle

```
条件: 同上
步骤:
  1. 测量一个周期内 HIGH 时间 (Th) 和 LOW 时间 (Tl)
  2. Duty = Th / (Th + Tl) × 100%
  3. 取多个周期平均
```

### 3.3 FOSC vs VIN / Temp

```
步骤:
  1. Hot: 125°C, 测 FOSC_H
  2. Room: 25°C, 测 FOSC_R
  3. Cold: -40°C, 测 FOSC_C
  4. VIN 在三温下各 sweep (Min ~ Max)
  
数据分析:
  dF/dV = ΔF / ΔVIN  (每项温度)
  dF/dT = ΔF / ΔT    (每项电压)
```

### 3.4 OSC Trim

当 OSC 频率偏差超出规格时，通过 Trim Code 调整：

```
Trim Code: 0 (最小频率) → 7 (最大频率)
步进: ~2%/Code

测试流程:
  1. 测 FOSC (Default Trim=0)
  2. 计算需要调整的 Code
  3. 写入 Code → 复测验证
  4. 决定最终 Trim Value
```

---

## 四、OSC 在 Buck 中的角色

Buck 的 Ton 和 Fsw 直接依赖 OSC/RCC Timer：

```
OSC → Clock Divider → Ton Timer → Ton
    → PWM Logic    → Fsw = FOSC / N
```

因此：

- **OSC 频率偏差 → Fsw 偏差 → Ton 偏差**
- Buck 的 RC Ton Trim 本质是补偿 OSC 和 RC 的综合偏差
- [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试|详见 Buck Ton 测试]]

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试|Buck Ton 与 ACT TIME 测试]]
- [[30.areas/PMIC/Analog_Core/Bandgap_原理与测试|Bandgap 原理与测试]]
- [[30.areas/PMIC/Digital_Interface/OTP_EFUSE_Trim|OTP/EFUSE/Trim]]
