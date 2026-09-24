---
title: "Buck-Boost 原理与测试"
tags:
  - pmic
  - buck-boost
  - principle
  - ate
created: 2026-07-17
---

# Buck-Boost 原理与测试

---

## 一、4-Switch Buck-Boost 拓扑

```
              Q1      Q2
VIN ───────┬──┴──┬──┬──┴──┬─────── VOUT
           │     │  │     │
           │  SW1│  │ SW2 │
           │     │  │     │
           │    ┌┴┐ │    ┌┴┐
           │    │ │ │    │ │
           │    └─┘ │    └─┘
           │     │  │     │
           │     L  │     │
           └─────000─────┘
```

### 四个开关管
| 开关 | 功能 |
|------|------|
| **Q1 (HS1)** | Buck 区高边管 |
| **Q2 (LS1)** | Buck 区低边管 |
| **Q3 (HS2)** | Boost 区高边管 |
| **Q4 (LS2)** | Boost 区低边管 |

---

## 二、三种工作模式

### Buck 模式 (VIN >> VOUT)
```
Q1 开关, Q2 互补开关
Q3 常开, Q4 常关
→ 相当于 Buck + 直通
```

### Boost 模式 (VIN << VOUT)
```
Q1 常开, Q2 常关
Q3 开关, Q4 互补开关
→ 直通 + Boost
```

### Buck-Boost 过渡模式 (VIN ≈ VOUT)
```
四个开关轮流工作
Q1/Q2 和 Q3/Q4 交替开关
→ 控制复杂，效率较低
```

---

## 三、关键测试参数

| 参数 | 说明 |
|------|------|
| **VOUT Accuracy** | 全 VIN 范围 (Buck / Boost / 过渡区) |
| **Efficiency** | Buck 区 / Boost 区 / 过渡区 分别测 |
| **Mode Transition** | Buck ↔ Buck-Boost ↔ Boost 切换点平滑性 |
| **Switching Frequency** | 各模式下可能不同 |
| **Startup / ACT TIME** | 启动时间 (可能比 Buck 更长) |
| **OCP / SCP** | 过流/短路保护 |
| **OVP** | 过压保护 |
| **Load Transient** | 在三种模式下分别验证 |

---

## 四、ATE 测试要点

### 4.1 Mode Transition 测试

```
条件:
  VIN sweep 从 VIN_MAX → VIN_MIN
  VOUT 固定 (如 3.3V)
  
测试步骤:
  1. 在 Buck 区 (VIN=5V) 测量 Fsw, VOUT, Eff
  2. 降低 VIN 到 Buck-Boost 过渡区
  3. 观察 VOUT 是否稳定 / 是否有模式切换抖动
  4. 在 Boost 区 (VIN=2.7V) 重复测量
```

### 4.2 4-Switch Gate Timing

四个开关管的时序必须正确，防止直通：

```
Buck 模式:
Q1: ──┐    ┌────────────
      │    │
      └────┘
Q2:       ┌──┐    ┌─────
      ────┘  └────┘

每个切换都需测 Dead Time
```

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_基本原理|Buck 基本原理]]
- [[30.areas/PMIC/Boost/Boost_基本原理与测试|Boost 基本原理]]
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能测试]]
