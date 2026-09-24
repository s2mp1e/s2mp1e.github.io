---
title: "Buck 基本原理"
tags:
  - pmic
  - buck
  - principle
created: 2026-07-17
---

# Buck Converter 基本原理 / Buck Converter Fundamentals

---

## 一、基本拓扑 / Basic Topology

Buck Converter 是一种**降压型 DC-DC 转换器**，核心拓扑如下：

```
        ┌───┐      L
VIN ────┤HS ├───┬───000───┬─── VOUT
        └───┘   │         │
                │         │
              SW │        ─── COUT
                 │         │
                ┌┴┐        │
                │ │ LS     │
                └─┘        │
                 │         │
                GND ───────┴─── GND
```

### 关键元件 / Key Components

| 元件                     | 作用          |
| ---------------------- | ----------- |
| **High-Side MOS (HS)** | 控制输入能量的通断   |
| **Low-Side MOS (LS)**  | 续流二极管/同步整流管 |
| **电感 L**               | 储能、滤波，决定纹波  |
| **输出电容 COUT**          | 稳压、滤波       |

---

## 二、工作原理 / Operation Principle

### HS MOS 导通时 (Ton)
```
VIN → HS MOS → SW → L → COUT → VOUT
```
- SW ≈ VIN
- 电感电流线性上升
- 电感储存能量

### HS MOS 关断时 (Toff)
```
LS MOS 导通 → 电感续流 → 电流下降
```
- SW ≈ 0V (同步) 或 -0.7V (异步二极管)
- 电感释放能量
- 电流线性下降

### 稳态关系 / Steady-State Relationship

$$
V_{OUT} = D \times V_{IN}
$$

其中 Duty Cycle (占空比):

$$
D = \frac{T_{ON}}{T_{SW}} = \frac{V_{OUT}}{V_{IN}}
$$

---

## 三、同步 vs 异步 Buck / Synchronous vs Asynchronous

| 对比项  | 异步 Buck    | 同步 Buck      |
| ---- | ---------- | ------------ |
| 低边开关 | 肖特基二极管     | MOS 管        |
| 效率   | 较低 (二极管压降) | 较高 (低 Rdson) |
| 成本   | 较低         | 较高           |
| 应用   | 低成本、低功率    | 高效率、大电流      |

详细对比参考: [[Clippings/异步与同步Buck对比]]

---

## 四、常见控制模式 / Control Modes

### 1. PWM (Pulse Width Modulation) — 固定频率

- 开关频率固定 (如 1MHz)
- 通过调节占空比稳压
- 轻载效率较低
- 适用于重载场景

### 2. PFM / PSM (Pulse Frequency / Skip Mode) — 轻载模式

- 轻载时跳过周期或降低频率
- 降低开关损耗
- 效率曲线在轻载区更优

### 3. COT (Constant On-Time) — 恒定导通时间

- Ton 由内部 RC Timer 决定
- 频率随输入输出电压变化
- **需要 RC Ton Trim** 来修正工艺偏差

```
COT Ton 产生路径:
RC Timer → Ton Control → Gate Driver → HS MOS → SW
```

---

## 五、关键时间参数 / Key Timing Parameters

| 参数 | 描述 | 典型范围 |
|------|------|---------|
| **Ton** | 每个周期 HS MOS 导通时间 | 10ns ~ 几 μs |
| **Toff** | 每个周期 HS MOS 关断时间 | 与 Ton 互补 |
| **Tsw** | 开关周期 = Ton + Toff | 0.3μs ~ 10μs |
| **Fsw** | 开关频率 = 1/Tsw | 100kHz ~ 3MHz |
| **Dead Time** | 上下管同时关断的保护时间 | 几 ns ~ 几十 ns |
| **ACT TIME** | Buck 启动时间 (EN→VOUT建立) | 几十 μs ~ 几 ms |

> ⚠ **注意**: Ton 和 ACT TIME 是不同尺度的时间参数，详见 [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试|Ton 与 ACT TIME 测试]]

---

## 六、测试中需要关注的特性

1. **开关频率 / Ton 精度** — RC Timer 是否准确，是否需要 Trim
2. **效率** — 全负载范围效率曲线
3. **负载调整率** — 负载变化时的 VOUT 稳定性
4. **线性调整率** — VIN 变化时的 VOUT 稳定性
5. **输出纹波** — 开关频率处的纹波幅度
6. **负载瞬态响应** — 负载跳变时的 VOUT 过冲/下冲
7. **软启动** — 启动时的 VOUT 上升斜率控制
8. **保护功能** — OCP, OVP, UVLO, OTP

---

## 参考资料

- [[Clippings/异步与同步Buck对比]]
- [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试]]
- [[30.areas/PMIC/Buck/Buck_测试项目总览]]
