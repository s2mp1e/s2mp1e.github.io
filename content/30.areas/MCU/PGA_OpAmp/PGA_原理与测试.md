---
title: "PGA 原理与测试"
tags:
  - mcu
  - pga
  - opamp
  - comparator
  - analog
  - ate
created: 2026-07-18
---

# PGA / OpAmp / Comparator 原理与测试

---

## 一、PGA (Programmable Gain Amplifier) 原理

PGA 通过切换反馈电阻网络实现可编程增益：

```
典型 PGA 架构:

      ┌──── R1 ────┐
VIN ──┤            ├────┐
      │            │    │
      │    ┌─┐    │    │
      └────┤+├────┘    │
           │ │         │
        ┌──┤-├────┐    │
        │  └─┘    │    │
        │         │    │
        ├── RF ───┤    │
        │         ├────┴── VOUT
       Gain 选择开关
```

$$
V_{OUT} = G \times V_{IN}, \quad G = 1 + \frac{R_F}{R_1}
$$

### 典型增益档位

| 档位 | 增益 | 应用 |
|------|------|------|
| G=1 | 1x | 缓冲 |
| G=2 | 2x | 小信号放大 |
| G=4 | 4x | 传感器 |
| G=8 | 8x | 传感器 |
| G=16 | 16x | 微弱信号 |
| G=32 | 32x | 热电偶等 |

---

## 二、PGA 关键参数与测试

### 2.1 Gain Accuracy / Gain Error (增益精度/误差)

```
每个档位分别测试:

Gain Error = (G_actual - G_ideal) / G_ideal × 100%

典型规格: ±1% ~ ±5% (Trim 后 ±0.5%)
```

**ATE 测试方法**:
```
步骤:
  ① 设置 PGA Gain = 1
  ② 输入 VIN1 = 100mV, 测 VOUT1
  ③ 输入 VIN2 = 900mV, 测 VOUT2
  ④ G_actual = (VOUT2 - VOUT1) / (VIN2 - VIN1)
  ⑤ Gain Error = G_actual - G_ideal
  ⑥ 对所有增益档重复
```

### 2.2 Offset Voltage (失调电压)

```
VOS 折算到输入端:

VOS_in = VOUT (VIN=0) / G

典型: ±0.5mV ~ ±5mV (Trim 后 < ±0.2mV)
```

### 2.3 Bandwidth (带宽)

```
-3dB 带宽随增益变化:

G=1:  BW = 10MHz
G=8:  BW = 1MHz  (增益带宽积限制)
G=32: BW = 250kHz

测试: 网络分析仪或扫频法
```

### 2.4 Noise (噪声)

```
输入参考噪声 (RTI):

典型: 10~50 nV/√Hz (白噪声)

测试: 输出噪声 / 增益 = 输入参考噪声
```

### 2.5 Linearity / THD

```
大信号下的线性度:

输入 1kHz 正弦波 → 输出 FFT 分析
THD < -60dB (典型)
```

---

## 三、OpAmp 关键参数与测试

| 参数 | 描述 | 典型值 | 测试方法 |
|------|------|--------|---------|
| **VOS** | 输入失调电压 | ±1mV | 闭环测 VOUT (VIN=0) |
| **IB** | 输入偏置电流 | ±10nA | 测输入引脚电流 |
| **GBW** | 增益带宽积 | 1~20MHz | 单位增益频率测量 |
| **SR** | 压摆率 | 1~10 V/μs | 大信号阶跃响应 |
| **CMRR** | 共模抑制比 | > 70dB | 共模/差模增益比 |
| **PSRR** | 电源抑制比 | > 60dB | 电源纹波传递 |
| **Output Swing** | 输出摆幅 | Rail-to-Rail | 测最大/最小输出 |

---

## 四、Comparator 关键参数与测试

### 4.1 Threshold & Offset

```
工作原理:
VIN+ > VIN- → VOUT = HIGH
VIN+ < VIN- → VOUT = LOW

理想: 跳变点在 VIN+ = VIN-
实际: 跳变点偏移 = VOS

测试:
  ① VIN- 固定 (如 1.5V)
  ② VIN+ 从低到高扫描 (小步进)
  ③ 记录 VOUT 翻转时的 VIN+
  ④ VTH_rise = 翻转点
  ⑤ VIN+ 从高到低扫描
  ⑥ VTH_fall = 反向翻转点
  ⑦ 迟滞 = VTH_rise - VTH_fall
```

### 4.2 Hysteresis (迟滞)

```
迟滞的作用: 防止噪声引起输出抖动

VOUT
  │              ┌──────
  │              │
  │              │
  │      ────────┘
  └──────────────────────→ VIN+
       ↑      ↑
     VTH-   VTH+
     (下降) (上升)
     
Hysteresis = VTH+ - VTH-
```

### 4.3 Propagation Delay (传播延迟)

```
输入越过阈值 → 输出翻转 的时间

典型: 几十 ns ~ 几 μs (取决于偏置)
```

---

## 五、ATE 测试硬件要点

```
PGA/OpAmp/Comparator 测试对噪声敏感:

① 信号源: 低噪声 AWG (< 1μVrms)
② 测量: 高精度 DVM (6.5 digit+)
③ 走线: 差分/屏蔽线
④ DIB: 模拟区域远离数字区域
⑤ 去耦: 电源引脚足够去耦
⑥ 屏蔽: 关键测试加屏蔽罩
```

---

## 参考资料

- [[30.areas/MCU/ADC/ADC_原理与测试|ADC 原理与测试]] — PGA 常接 ADC 前端
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim 完整指南]] — PGA Gain/Offset Trim
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础 (PMIC)]] — SMU/AWG 资源参考
