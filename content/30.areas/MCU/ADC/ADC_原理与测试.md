---
title: "ADC 原理与测试"
tags:
  - mcu
  - adc
  - analog
  - ate
created: 2026-07-18
---

# ADC 原理与测试 / ADC Principles & Testing

---

## 一、SAR ADC 工作原理

SAR (Successive Approximation Register) ADC 通过二分法逼近输入电压：

```
          VREF
           │
    ┌──────┴───────┐
    │   DAC (CDAC) │←── SAR Logic
    └──────┬───────┘
           │ VDAC
           │
VIN ──┐   │
      ├───┴──→ Comparator ──→ SAR Register → 输出码
```

```
工作过程 (12-bit 示例):
  Cycle 1: VDAC = VREF/2   → 比较 → 决定 MSB (bit11)
  Cycle 2: VDAC = VREF/4   → 比较 → 决定 bit10
  ...
  Cycle 12: 决定 LSB (bit0)
  
12-bit 需要 12 个比较周期 → SAR ADC 采样率 = fCLK / (N + overhead)
```

### MCU SAR ADC 典型结构

```
AIN0 ─┐
AIN1 ─┤
AIN2 ─┼──→ MUX ──→ S/H ──→ CDAC ──→ Comparator
AIN3 ─┤                    ↑
  ... │                    │
AINn ─┘              Sample Clock
                          │
               ┌──────────┴──────────┐
               │ Successive Register │
               └─────────────────────┘
```

---

## 二、静态参数 / Static Parameters

### 2.1 Offset Error (失调误差)

理想 ADC 的第一个转换点与实际第一个转换点的偏差：

```
代码
 │        实际
 │       ╱
 │      ╱
 │     ╱ 理想
 │    ╱╱
 │   ╱
 │  ╱
 │ ╱
 └──────────────────→ VIN
     ↑
   Offset
```

### 2.2 Gain Error (增益误差)

满量程处的斜率偏差 (排除 Offset 后)。

### 2.3 DNL (Differential Non-Linearity / 差分非线性)

$$
DNL[i] = \frac{W[i] - LSB_{ideal}}{LSB_{ideal}}
$$

- W[i]: 第 i 个码的实际宽度
- DNL < -1 → Missing Code (丢码)

### 2.4 INL (Integral Non-Linearity / 积分非线性)

$$
INL[i] = \sum_{k=0}^{i} DNL[k]
$$

即累积的 DNL。INL 反映整体线性度。

---

## 三、动态参数 / Dynamic Parameters

### 3.1 SNR (Signal-to-Noise Ratio / 信噪比)

$$
SNR = 20 \log_{10}\left(\frac{V_{signal\_rms}}{V_{noise\_rms}}\right)
$$

理想 N-bit ADC: SNR_ideal = 6.02N + 1.76 dB

### 3.2 THD (Total Harmonic Distortion / 总谐波失真)

$$
THD = 20 \log_{10}\left(\frac{\sqrt{V_2^2 + V_3^2 + ... + V_k^2}}{V_1}\right)
$$

### 3.3 SINAD (Signal-to-Noise-and-Distortion)

$$
SINAD = 20 \log_{10}\left(\frac{V_{signal}}{V_{noise+distortion}}\right)
$$

### 3.4 ENOB (Effective Number of Bits / 有效位数)

$$
ENOB = \frac{SINAD - 1.76}{6.02}
$$

例如 12-bit ADC 测得 SINAD = 65 dB:
```
ENOB = (65 - 1.76) / 6.02 = 10.5 bits
→ 有效精度只有 10.5 位
```

### 3.5 SFDR (Spurious-Free Dynamic Range / 无杂散动态范围)

基波与最大杂散分量的功率比。

---

## 四、ATE 测试方法

### 4.1 静态测试 — Histogram 方法

```
原理:
  输入线性斜坡 (Ramp) 或三角波
  → 记录每个码出现的次数
  → 码宽 ∝ 出现次数

步骤:
  ① AWG 产生慢速三角波 (覆盖全量程)
  ② 芯片连续采样 (如 65536 次)
  ③ 统计每个码的计数 Count[i]
  ④ DNL[i] = Count[i] / Count_avg - 1
  ⑤ INL[i] = Σ DNL
```

### 4.2 静态测试 — 伺服环 (Servo Loop) 方法

```
原理:
  对每个码，搜索其精确跳变电压

步骤:
  ① 目标码 i
  ② 二分搜索输入电压直到输出在码 i 和 i+1 之间跳变
  ③ 记录 V(i)
  ④ 对所有码重复

精度高但耗时长 (仅适合低位 ADC 或 Lab)
```

### 4.3 动态测试 — FFT 方法

```
原理:
  输入高纯度正弦波
  → 采样 N 点 (相干采样, Coherent Sampling)
  → FFT 分析频域
  → 计算 SNR/THD/SINAD/ENOB/SFDR

相干采样条件:
  fin / fs = M / N  (M 和 N 互质)
  
  如 fs = 1MS/s, N = 1024, M = 127
  fin = 127 × 1MS/s / 1024 = 124.023 kHz
```

### 4.4 测试示例 (12-bit SAR ADC)

```
静态测试 (Histogram):
  条件: VREF = 3.3V, 三角波 0~3.3V, 采样 65536 次
  Offset: < ±4 LSB
  Gain:   < ±8 LSB
  DNL:    < ±1.5 LSB
  INL:    < ±2 LSB

动态测试 (FFT):
  条件: VREF = 3.3V, 正弦波 2.4Vpp @ 124kHz, N=1024
  SNR:    > 66 dB (理想 12bit = 74dB)
  THD:    < -70 dB
  ENOB:   > 10.5 bits
```

---

## 五、ADC Trim

### 5.1 Offset Trim

```
原因: 比较器失调 + 采样电容失配
方法: 
  ① 输入 0V (接地)
  ② 测量输出码
  ③ 计算 Offset 修正值
  ④ 写入 Trim 寄存器 (DAC 补偿或数字域补偿)
```

### 5.2 Gain Trim

```
原因: CDAC 电容比例偏差
方法:
  ① 输入 VREF (满量程)
  ② 测量输出码
  ③ 计算 Gain 修正值
  ④ 调整参考电压或数字增益
```

### 5.3 ADC Trim 流程

```
CP 测试:
  ① Offset Trim: VIN=0 → 测码 → 烧 Offset Code
  ② Gain Trim: VIN=VREF → 测码 → 烧 Gain Code
  ③ 复测验证: 多电压点验证 DNL/INL

FT 测试:
  ④ 读取 Trim Code (OTP 加载)
  ⑤ Offset/Gain 复测验证
```

详见: [[30.areas/MCU/Common/MCU_Trim|MCU Trim 完整指南]]

---

## 六、常见问题

| 问题           | 可能原因                 |
| ------------ | -------------------- |
| Offset 偏大    | 比较器失调、采样电容失配         |
| Missing Code | DNL 超差、CDAC 电容失配     |
| SNR 低        | 电源噪声、采样抖动 (Jitter)   |
| THD 高        | S/H 非线性、输入信号源失真      |
| ENOB 低       | 综合 (噪声+失真)           |
| 不同通道差异       | MUX 串扰、通道间 Offset 差异 |

---

## 参考资料

- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim 完整指南]]
- [[30.areas/MCU/PGA_OpAmp/PGA_原理与测试|PGA 原理与测试]]
- [[30.areas/MCU/Clock/Clock_OSC_PLL_测试|Clock 系统]] — ADC 时钟
