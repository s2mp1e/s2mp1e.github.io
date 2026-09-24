---
title: "Sequencer 原理与测试"
tags:
  - pmic
  - sequencer
  - power-seq
  - ate
created: 2026-07-17
---

# Sequencer 原理与测试

---

## 一、基本工作原理

### 上电序列 (Power Up)

```
Global EN
    │
    ├─── t_delay1 ───→ EN_OUT1 → VOUT1 开始上升
    ├─── t_delay2 ───→ EN_OUT2 → VOUT2 开始上升
    ├─── t_delay3 ───→ EN_OUT3 → VOUT3 开始上升
    │
    └─── 电源正常判断 (PG) → 下个序列条件
```

### 关电序列 (Power Down)

```
Power Down
    │
    ├─── VOUT3 开始下降 (先关)
    ├─── VOUT2 开始下降
    ├─── VOUT1 开始下降 (后关)
    │
    └─── 通常与上电顺序相反
```

---

## 二、关键测试参数

| 参数 | 描述 | 典型值 |
|------|------|--------|
| **tDELAY (Rise Delay)** | EN→VOUT 开始上升的延迟 | 100μs ~ 几 ms |
| **tRISE (VOUT Rise Time)** | VOUT 从 0 到稳定的时间 | 50μs ~ 500μs |
| **tFALL (VOUT Fall Time)** | 关断后 VOUT 放电到 0 的时间 | 几十 μs ~ 几 ms |
| **tSEQUENCE** | 相邻两轨之间的延迟 | 100μs ~ 10ms |
| **PG Delay** | VOUT 正常 → PG 有效的延迟 | 几 μs ~ 几百 μs |
| **nRST / POR Timing** | 复位信号时序 | 几 ms |

---

## 三、ATE 测试方法

### 3.1 序列延迟测量

```
条件: 配置所有 Rails
步骤:
  1. 触发 Global EN
  2. 用多通道 TMU 或 Digitizer 同时捕获各 VOUT
  3. 测量每个 VOUT 的上升沿相对于 Global EN 的延迟
  4. 计算相邻 rails 的间隔 tSEQ = tDELAY_n+1 - tDELAY_n
判断: tSEQ 在规格窗口内
```

### 3.2 Rise Time 测量

```
条件: 各 Rail 带上典型负载
步骤:
  1. 捕获单个 VOUT 上升沿
  2. VOUT_10% → VOUT_90% 的时间 = tRISE
判断: tRISE 不超过规格
注意: 负载电容影响上升时间
```

### 3.3 Power Down 测试

```
条件: 所有 Rail 正常输出
步骤:
  1. 置 Global EN = LOW
  2. 捕获各 VOUT 下降沿
  3. 测量掉电延迟和顺序
  4. 确认 Active Discharge 行为 (如芯片支持)
```

### 3.4 PG / nRST 验证

```
条件: 上电序列完成
步骤:
  1. 监测 PG / nRST 引脚
  2. 确认所有 Rail 都建立后 PG 才有效
  3. 单路故障时 PG 保持无效
```

---

## 参考资料

- [[30.areas/PMIC/PMU/PMU_架构与测试|PMU 架构与测试]]
- [[30.areas/PMIC/Common/时序测试|时序测试方法]]
