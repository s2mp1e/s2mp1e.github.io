---
title: "Load Switch 原理与测试"
tags:
  - pmic
  - load-switch
  - principle
  - ate
created: 2026-07-17
---

# Load Switch 原理与测试

---

## 一、基本拓扑

```
                     ┌──────────┐
VIN ─┬──────────────┤  Pass    ├──────┬─── VOUT
     │              │  FET     │      │
     │              └──────────┘      │
     │                    ↑            │
     │              ┌─────┴─────┐      │
     │              │  Control  │      │
     │              │  Logic    │      │
     │              └─────┬─────┘      │
     │                    │            │
     │                  ON/OFF        ─── COUT
     │                    │            │
     └───────────── EN ───┘            │
                                      GND
```

内部通常包含:
- Pass FET (NMOS 或 PMOS)
- Charge Pump (用于 NMOS 栅极驱动)
- Control Logic
- 可选: Current Limit / OVP / Active Discharge / dV/dt 控制

---

## 二、关键测试参数

| 参数 | 描述 | 测试方法 |
|------|------|---------|
| **Rdson** | Pass FET 导通电阻 | Force IOUT, 测 VIN-VOUT 压差 |
| **IOUT_MAX** | 最大持续电流 | 升温至热限或电压跌落 |
| **RON** 上升时间 | VOUT 从 0 到稳定的时间 | EN → VOUT 波形 |
| **ROFF** 下降时间 | 关断后 VOUT 放电时间 | EN LOW → VOUT=0 |
| **Iq (Quiescent Current)** | 导通时自身功耗 | 空载测 IIN |
| **Isd (Shutdown Current)** | 关断时漏电流 | EN=LOW 测 IIN |
| **ILIMIT (Current Limit)** | 限流阈值 (如有) | 增加负载至限流 |
| **Active Discharge** | 关断后主动放电电阻 | 关断后测 VOUT 下降斜率 |
| **dV/dt 控制** | 导通时输出斜率 | EN 上升后 VOUT 上升斜率 |

---

## 三、ATE 测试方法

### 3.1 Rdson

```
条件: EN=HIGH, IOUT = 满载
步骤:
  1. Force VIN (如 5V)
  2. IOUT = 1A (电子负载)
  3. 测量 VIN 和 VOUT
  4. Rdson = (VIN - VOUT) / IOUT
判断: Rdson < 规格值
注意: 4-wire Kelvin 连接消除线阻
```

### 3.2 导通上升时间 (tON)

```
条件: EN 从 LOW→HIGH, VIN 稳定
步骤:
  1. 使能 Load Switch
  2. 测量 VOUT 波形
  3. tON = EN 上升沿(50%) → VOUT 上升沿(90%)
注意: 关注 dV/dt 控制是否正常
```

### 3.3 Current Limit

```
条件: EN=HIGH, VIN 正常
步骤:
  1. 逐步增加 IOUT (Force Current)
  2. 监测 VOUT
  3. VOUT 开始下降的点 → 限流已触发
  4. 记录触发时 IOUT = ILIMIT
判断: ILIMIT 在规格范围内
```

### 3.4 Active Discharge

```
条件: 先使能 → 输出建立 → 关断
步骤:
  1. 使能, VOUT 建立
  2. EN=LOW
  3. 测量 VOUT 放电波形
  4. 计算放电电阻: Rdis = VOUT / Idischarge
注意: 放电太快或太慢都有问题
```

---

## 四、Load Switch 测试硬件注意事项

- **Kelvin 连接**: Rdson 测试必须 4-wire
- **大电流**: DIB 走线和 Socket 需能承受数安培电流
- **散热**: 大电流下需关注芯片温升
- **电容负载**: 输出端的大 COUT 会影响 tON 测量

---

## 参考资料

- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能测试]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
