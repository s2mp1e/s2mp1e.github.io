---
title: "Charge Pump 原理与测试"
tags:
  - pmic
  - charge-pump
  - principle
  - ate
created: 2026-07-17
---

# Charge Pump 原理与测试

---

## 一、基本工作原理

以 2x Doubler (倍压器) 为例：

### Phase 1: 充电
```
          ┌──────────┐
VIN ─────┤  CFLY    ├───┬─── 断开 → VOUT
         │ 充电到VIN │   │
         └──────────┘   │
                        ─── COUT (向负载供电)
                        │
                       GND
```

### Phase 2: 泵升
```
         VIN ────┐
                 │
          ┌──────┴─────┐
VIN ─────┤  CFLY       ├─────── VOUT = 2×VIN
         │  原来充了VIN  │
         └─────────────┘
                        │
                        ─── COUT (充电)
```

---

## 二、关键测试参数

| 参数 | 描述 | 测试方法 |
|------|------|---------|
| **VOUT** | 输出电压 | 稳定后测量 |
| **Output Ripple** | 输出纹波 (Charge Pump 一般大于电感式) | AC 耦合测量 |
| **Efficiency** | 效率 = POUT / PIN | VIN × IIN vs VOUT × IOUT |
| **IOUT_MAX** | 最大输出电流 | 电压跌落至规格下限 |
| **Switching Freq** | 开关频率 | 测输出纹波频率 |
| **Mode Transition** | 倍率切换点 (Reconfigurable) | 测不同 VIN/IOUT 下模式 |
| **Startup** | 启动时间 | 飞电容充电时间 |
| **Output Impedance** | 等效输出阻抗 | 负载变化时 VOUT 变化量 |

---

## 三、ATE 测试要点

### 3.1 效率测试

Charge Pump 的效率理论公式：

$$
\eta = \frac{V_{OUT} \times I_{OUT}}{V_{IN} \times I_{IN}} \times \frac{N}{M} \times 100\%
$$

其中 N/M 是转换比 (如 2x 中 N=2, M=1)。

实测时需注意：
- 飞电容 CFLY 的质量影响效率
- 开关频率影响效率 (高频 → 开关损耗大)
- 轻载效率通常低于 Buck/Boost

### 3.2 模式切换 (Reconfigurable CP)

```
条件: VIN sweep, IOUT 固定
步骤:
  1. VIN 从高到低
  2. 监测 VOUT
  3. 当 VOUT 开始下降 → CP 切换倍率 (如 1x→1.5x→2x)
  4. 检查切换点电压和切换时 VOUT 的毛刺
```

---

## 参考资料

- [[30.areas/PMIC/Common/时序测试|时序测试]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
