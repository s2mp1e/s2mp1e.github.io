---
title: "LDO 原理与测试"
tags:
  - pmic
  - ldo
  - principle
  - ate
created: 2026-07-17
---

# LDO 低压差线性稳压器 / LDO Principles & Testing

---

## 一、基本拓扑 / Basic Topology

LDO (Low Dropout Regulator) 核心是一个**线性稳压器**，通过调整 Pass FET 的导通电阻来稳压：

```
VIN ───┬─── Pass FET ───┬─── VOUT
       │                │
       │                │
       │                ─── COUT
       │                │
       │   ┌──────┐     │
       └───│ Amp  ├─────┘
           │ FB   │
           └──┬───┘
              │ VREF
              │
             GND
```

---

## 二、关键参数 / Key Parameters

### 2.1 Dropout Voltage (压差电压)

Pass FET 完全导通时，VIN 和 VOUT 之间的最小压差：

$$
V_{DO} = V_{IN\_min} - V_{OUT}
$$

- 典型 LDO: 200mV ~ 500mV
- Ultra Low Dropout: < 100mV

### 2.2 Quiescent Current (Iq / 静态电流)

LDO 自身消耗的电流（不含负载电流）：

$$
I_q = I_{IN} - I_{OUT}
$$

- 普通 LDO: 几十 μA
- Low Iq LDO: 几百 nA

### 2.3 PSRR (Power Supply Rejection Ratio / 电源抑制比)

衡量 LDO 抑制输入纹波的能力：

$$
PSRR = 20 \log \frac{V_{IN\_ripple}}{V_{OUT\_ripple}}
$$

- 低频 (1kHz): 60~80dB
- 高频 (1MHz): 20~40dB

### 2.4 Output Noise (输出噪声)

LDO 内部参考源和放大器产生的噪声：

- 普通 LDO: 几十 μVrms
- Low Noise LDO: < 10 μVrms

### 2.5 Load/Line Regulation

- **Load Regulation**: 负载变化时的 VOUT 变化
- **Line Regulation**: 输入变化时的 VOUT 变化

---

## 三、LDO 类型 / LDO Types

| 类型 | Pass FET | 特点 | 典型应用 |
|------|---------|------|---------|
| **PMOS LDO** | PMOS | Dropout 小，Iq 低 | 通用 |
| **NMOS LDO** | NMOS | 更快的瞬态响应 | RF/高速电路 |
| **Capless LDO** | 无外部电容 | 无 COUT 稳定 | SoC 内部 |

---

## 四、ATE 测试方法 / ATE Test Methods

### 4.1 VOUT Accuracy

```
条件: VIN = VOUT_NOM + 0.5V, IOUT = 10mA
步骤:
  1. Set VIN, 使能 LDO
  2. 接电子负载 IOUT = 10mA
  3. 测量 VOUT
判断: VOUT 在 VOUT_NOM ± 2% 内 → PASS
```

### 4.2 Dropout Voltage

```
条件: IOUT = 满负载 (如 300mA)
步骤:
  1. VIN 从 VOUT_NOM + 1V 逐步降低
  2. 监测 VOUT
  3. VOUT 下降 VOUT_NOM × 2% 时的 VIN 记为 VDO
  4. Dropout = VDO - VOUT_NOM
```

### 4.3 Quiescent Current (Iq)

```
条件: VIN = VOUT_NOM + 0.5V, IOUT = 0mA
步骤:
  1. 使能 LDO (空载)
  2. 测量 IN 引脚电流
  3. 该电流 = Iq
注意: 极低 Iq (< 1μA) 需要高精度 SMU
```

### 4.4 PSRR

```
条件: VIN = VOUT_NOM + 0.5V, IOUT = 10mA
方法:
  1. VIN 上叠加 AC 信号 (100mVpp)
  2. 扫频 100Hz ~ 1MHz
  3. 测量 VOUT 上的纹波
  4. PSRR = 20 × log(VIN_ripple / VOUT_ripple)
注意: ATE 通常只测 Spot Freq 而非全频 sweep
```

### 4.5 Load Transient

```
条件: VIN = VOUT_NOM + 0.5V
步骤:
  1. IOUT 从 1mA → 100mA 跳变 (上升时间 < 1μs)
  2. 观测 VOUT 过冲/下冲幅度
  3. 观测 VOUT 恢复时间
```

---

## 五、Buck 和 LDO 的搭配测试

在 PMIC 中，Buck 和 LDO 经常配合使用:

| 架构                   | 说明                  | 测试要点                |
| -------------------- | ------------------- | ------------------- |
| Buck → LDO           | Buck 预降压 → LDO 精细稳压 | 需测 Buck+LDO 级联效率    |
| Buck + LDO 并联        | 分别供电不同负载            | 交叉影响测试              |
| LDO from Buck Output | LDO 供电来自 Buck 输出    | Buck 负载变化会影响 LDO 输入 |

---

## 六、常见测试问题

### Q1: LDO 输出振荡怎么办？
- 检查 COUT 是否合适 (ESR 范围)
- 检查负载电流范围
- 可能是环路稳定性问题

### Q2: Iq 测试值偏大？
- 确认芯片进入正确模式 (非使能或保护状态)
- 检查输出是否空载
- 确认温度

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_基本原理|Buck Converter]] — Buck 常与 LDO 配合使用
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
- [[30.areas/PMIC/Common/DC参数测试|DC 参数测试]]
