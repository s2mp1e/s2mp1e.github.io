---
title: "Charger 原理与测试"
tags:
  - pmic
  - charger
  - battery
  - principle
  - ate
created: 2026-07-17
---

# Charger 原理与测试

---

## 一、Li-Ion 电池充电曲线

Li-Ion 电池标准充电分为三个阶段：

```
电流/电压
  │
  │  Trickle    CC          CV        Done
  │  (预充)     (恒流)     (恒压)    (截止)
  │
V_REG ─────────────────────────────────────
  │                    │
  │                    │
  │  ┌──────────┐      │
I_CHG│          │      │
  │  │          │      │
  │  └────┐     │      │
I_PCH     │     │      │
  │       │     │      │
I_TERM ────────────────┴───┐
  │                         │
  └────────────────────────────→ 时间
```

### 三阶段详解

| 阶段 | 条件 | 行为 | 测试要点 |
|------|------|------|---------|
| **Trickle (预充)** | VBAT < VSHORT | 小电流预充 | VSHORT 阈值 |
| **Pre-Charge** | VBAT < VMIN | 中等电流充电 | VMIN 阈值、I_PCH |
| **CC (恒流)** | VBAT = 2.8V~4.2V | 恒定大电流 | I_CHG 精度 |
| **CV (恒压)** | VBAT = VREG | 电压恒定、电流下降 | VREG 精度 |
| **Termination** | ICHG < I_TERM | 充电完成 | I_TERM 阈值 |

---

## 二、关键测试参数

| 参数 | 描述 | 典型值 |
|------|------|--------|
| **VREG (Regulation Voltage)** | 恒压阶段目标电压 | 4.2V / 4.35V / 4.4V |
| **I_CHG (Charge Current)** | 恒流阶段充电电流 | 0.5A ~ 5A+ |
| **I_TERM (Termination Current)** | 充电截止电流 | I_CHG × 10% |
| **VSHORT (Short Battery Threshold)** | 短路电池检测阈值 | 2.0V ~ 2.5V |
| **I_PCH (Pre-Charge Current)** | 预充电流 | 几十 ~ 几百 mA |
| **Recharge Threshold** | 再充电阈值 | VREG - 100mV~200mV |
| **Charge Timer (Safety Timer)** | 充电超时保护 | 几小时 |

---

## 三、ATE 测试方法

### 3.1 VREG 恒压精度

```
条件: VBAT 用 SMU 模拟 (force voltage sink mode)
步骤:
  1. 设置 VBAT = VREG - 0.2V (进入 CC 区)
  2. 等待充电电流稳定
  3. 测 VOUT (即 VBAT 引脚电压) = VREG 精度
  4. 判断: VREG ± 1%
```

### 3.2 I_CHG 恒流精度

```
条件: VBAT = 3.0V~3.5V (确保在 CC 区)
步骤:
  1. 使能充电
  2. 等待电流稳定
  3. 测量输入电流或 BAT 引脚电流
  4. 判断: I_CHG ± 5%
```

### 3.3 I_TERM / EOC (End of Charge)

```
条件: VBAT = VREG (CV 模式下)
步骤:
  1. 设置 VBAT = VREG (SMU sink)
  2. 监测充电电流
  3. 电流下降 → 记录 I_TERM 点
  4. 判断充电完成信号 (STAT / INT)
```

### 3.4 Timer / Safety Timer

```
条件: 正常充电状态
步骤:
  1. 启动充电 (保持电池电压在 CC 区)
  2. 等待 Safety Timer 超时
  3. 确认充电停止 / FAULT 信号发出
  4. 记录实际超时时间
```

---

## 四、特殊测试项

### 4.1 NVDC (Narrow Voltage DC) 测试

笔记本 Charger 的 NVDC 架构需要测试：

- **System 优先**: 适配器功率不够时优先保证系统供电
- **Battery Supplement**: 大负载时电池补充供电
- **Adapter 插入/拔出**: 热切换

### 4.2 USB 兼容性

- USB 2.0 (500mA) / USB 3.0 (900mA) / USB-C PD
- BC1.2 协议检测
- D+/D- 检测

### 4.3 Wireless Charger 测试

- 通信协议 (WPC Qi)
- 功率传输效率
- FOD (Foreign Object Detection)

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_基本原理|Buck 基本原理]] — Switching Charger 基础
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能]] — 充电安全
- [[30.areas/PMIC/Thermal/_index|热管理]] — 充电热保护
