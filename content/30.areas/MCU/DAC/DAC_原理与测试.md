---
title: "DAC 原理与测试"
tags:
  - mcu
  - dac
  - analog
  - ate
created: 2026-07-18
---

# DAC 原理与测试 / DAC Principles & Testing

---

## 一、R-2R DAC 工作原理

```
数字输入 (N bits)
    │
    ├── bit0 ── 开关0 ──┐
    ├── bit1 ── 开关1 ──┤
    │       ...         ├── VOUT (经运放缓冲)
    ├── bitN-1 ─ 开关N ─┘
    │
   R-2R 梯形网络连接 VREF
```

$$
V_{OUT} = V_{REF} \times \frac{Code}{2^N}
$$

### String DAC (电阻串 DAC)

```
VREF ──┬──── R ────┬──── R ────┬──── R ────┬──
       │           │           │           │
     Tap 0       Tap 1       Tap 2      Tap (2^N-1)
       │           │           │           │
       └────── MUX (由数字码选择) ──────────┘
                        │
                      VOUT
```

- 天然单调 (Monotonic by design)
- 2^N 个电阻 → 面积大，适合 ≤ 12 bit

---

## 二、静态参数

### 2.1 Offset / Gain Error

与 ADC 类似:
- **Offset**: Code=0 时的实际输出电压
- **Gain**: 满量程斜率偏差

### 2.2 DNL

$$
DNL[i] = \frac{V_{step}(i) - LSB_{ideal}}{LSB_{ideal}}
$$

- DNL < -1 → **非单调** (Non-Monotonic) — DAC 最严重的问题

### 2.3 INL

$$
INL[i] = \frac{V_{actual}(i) - V_{ideal}(i)}{LSB_{ideal}}
$$

### 2.4 Monotonicity (单调性)

```
单调:  输出随 Code 增加而单调上升 (可以平坦，不能下降)
非单调: 某处 Code 增加但输出反而下降

R-2R DAC: 不保证单调 (电阻匹配问题)
String DAC: 天然单调
```

---

## 三、动态参数

### 3.1 Settling Time (建立时间)

DAC 输出从变化开始到稳定在最终值 ±0.5 LSB 内的时间：

```
VOUT
  │      ┌───── 最终值
  │     ╱│
  │    ╱ │
  │   ╱  │  ← 振荡 (Ring)
  │  ╱   │
  │ ╱    │
  │╱     │
  └──────┴──────→ 时间
  ↑      ↑
 Code   Settled
 变化   (±0.5LSB)

tSettle: 几 ns ~ 几 μs
```

### 3.2 Slew Rate (压摆率)

输出电压的最大变化速率：

$$
SR = \frac{dV_{OUT}}{dt} \Big|_{max}
$$

- 主要由输出运放的偏置电流和负载电容决定

### 3.3 Glitch Energy (毛刺能量)

Code 跳变时（尤其是 Major Carry 如 0111→1000）产生的瞬态毛刺：

```
VOUT
  │    ╱╲
  │   ╱  ╲     ← Glitch
  │  ╱    ╲
  │ ╱      ╲──────
  │╱              
  └──────────────→ 时间

Glitch Energy = ∫ (V(t) - V_final) dt
```

---

## 四、ATE 测试方法

### 4.1 静态测试 — 全码扫描 (All Code Scan)

```
步骤:
  ① 写入 Code = 0
  ② 测量 VOUT (高精度 SMU/DVM)
  ③ Code+1 → 测量
  ④ 重复到 Code = 2^N - 1
  ⑤ 计算 Offset/Gain/DNL/INL

8-bit DAC: 256 点 → 测试时间可控
12-bit DAC: 4096 点 → 测试时间较长 (可降采样)
```

### 4.2 静态测试 — 抽样扫描 (Sampled Code Scan)

```
对高分辨率 DAC (12bit+):
  ① 全码扫描太慢 (4096 点 × 1ms = 4s)
  ② 只测关键码: 0, 1, 2, 3, 7, 15, 31, 63, ...
  ③ 重点测 Major Carry 码: 255→256, 511→512, 1023→1024
  ④ 简化计算 INL/DNL
```

### 4.3 Settling Time 测试

```
步骤:
  ① Code 从 25% → 75% 跳变 (大跳变)
  ② Digitizer 高速采样 VOUT 波形
  ③ 计算 VOUT 进入 ±0.5 LSB 窗口的时间

注意:
  • 需要低电容探头/负载
  • DIB 走线和 Socket 寄生影响
```

### 4.4 测试示例 (12-bit DAC, VREF=3.3V)

```
LSB = 3.3V / 4096 = 0.806 mV

静态测试 (抽样 256 点):
  Offset:  < ±8 LSB (±6.4mV)
  Gain:    < ±0.5%
  DNL:     < ±1 LSB
  INL:     < ±2 LSB
  Monotonicity: 无下降点

Settling Time:
  0→Full Scale: < 2 μs (0.5 LSB)
```

---

## 五、DAC Trim

```
原因: R-2R 电阻失配、运放失调
方法:
  ① Offset Trim: Code=0 → 测 VOUT → 修运放失调
  ② Gain Trim: Code=Full → 测 VOUT → 修参考或增益

部分 MCU DAC 通过复用 ADC 的 Trim 结果
(内部自校准: DAC 输出 → 内部 ADC 测量 → 自动补偿)
```

---

## 参考资料

- [[30.areas/MCU/ADC/ADC_原理与测试|ADC 原理与测试]] — 静态参数定义相通
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim 完整指南]]
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
