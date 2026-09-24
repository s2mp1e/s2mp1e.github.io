---
title: "Boost 基本原理与测试"
tags:
  - pmic
  - boost
  - principle
  - ate
created: 2026-07-17
---

# Boost Converter 基本原理与测试

---

## 一、基本拓扑

```
              L           D
VIN ────────000───┬───┬───┬─── VOUT
                  │   │   │
                SW │   │   ─── COUT
                    │   │    │
                   ┌┴┐  │    │
                   │ │  │    │
                   └─┘  │    │
                    │   │    │
                   GND GND  GND
```

### 工作状态

**HS MOS 导通 (Ton)**:
```
VIN → L → GND
电感储能，电流线性上升
COUT 向负载供电
```

**HS MOS 关断 (Toff)**:
```
VIN → L → D → COUT → Load
电感释放能量，VOUT 被抬高
```

### 稳态关系

$$
V_{OUT} = \frac{V_{IN}}{1 - D}
$$

其中:
$$
D = \frac{T_{ON}}{T_{SW}}
$$

> ⚠ **注意**: Boost 的 Duty Cycle 不能太接近 1 (最大一般限制在 85%~95%)，否则效率急剧下降且可能不稳定。

---

## 二、Boost 的测试挑战

### 2.1 Startup / ACT TIME

Boost 启动时有一个特殊挑战：**启动前 VOUT ≈ VIN - V diode**。

因为输出端通过电感和二极管直通到输入，启动前 VOUT 就已经接近 VIN。解决方法：

```
含 Load Switch 的 Boost:
VIN → L → SW → D → Load Switch → COUT
                       ↑
                 启动后 Load SW 才打开
```

### 2.2 电感电流

Boost 的电感电流不等于输出电流：

$$
I_L = \frac{I_{OUT}}{1 - D} > I_{OUT}
$$

电感电流纹波也比 Buck 更明显。

### 2.3 OVP (过压保护)

Boost 输出容易在空载/轻载时过冲，OVP 是关键的可靠性测试。

---

## 三、ATE 测试方法

### 3.1 VOUT Accuracy

```
条件: VIN = 3.7V, IOUT = 100mA
步骤:
  1. 使能 Boost
  2. 等待稳态
  3. 测量 VOUT
判断: VOUT = VIN/(1-Dtarget) ± 2%
```

### 3.2 Efficiency

```
条件: VIN = 3.7V, IOUT sweep: 1mA → IOUT_MAX
步骤:
  1. 测量 VIN, IIN (avg)
  2. 测量 VOUT, IOUT
  3. Eff = (VOUT × IOUT) / (VIN × IIN) × 100%
```

### 3.3 OCP / Hiccup 测试

```
条件: VIN = 3.7V, 逐步增大 IOUT
步骤:
  1. 开始增加负载
  2. OCP 触发时 VOUT 开始下降
  3. Hiccup 模式: VOUT 周期性尝试恢复
判断: OCP 触发点在规格范围内
```

---

## 四、Buck-Boost 架构简介

Buck-Boost 结合两者优点，可以在 VIN > VOUT 或 VIN < VOUT 下工作：

| 区域       | VIN vs VOUT | 工作模式                  |
| -------- | ----------- | --------------------- |
| Buck 区域  | VIN >> VOUT | Buck 模式               |
| Boost 区域 | VIN << VOUT | Boost 模式              |
| 过渡区      | VIN ≈ VOUT  | Buck+Boost 或 4-Switch |

4-Switch Buck-Boost 是现代 PMIC 中常见的高效方案。

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_基本原理|Buck 基本原理]] — 与 Buck 对比学习效果更好
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能测试]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
