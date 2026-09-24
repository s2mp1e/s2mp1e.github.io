---
title: "LED Driver 原理与测试"
tags:
  - pmic
  - led
  - driver
  - principle
  - ate
created: 2026-07-17
---

# LED Driver 原理与测试

---

## 一、基本原理

LED 是**电流驱动型**器件，LED Driver 的核心是**恒流源**。

### Backlight LED Driver 典型架构

```
VIN ──── Boost ───┬─── VLED (升压到 LED 需要的电压)
                   │
              ┌────┴────┐
              │  Current │← PWM Dimming
              │  Sink    │
              └────┬────┘
                   │
                  LEDx4
                   │
                  GND
```

每路 LED 串由独立的 Current Sink 控制电流。

### Flash LED Driver 典型架构

```
VIN ──── Boost ──── VLED ───┬─── LED_Flash
                             │
                             └─── LED_Torch
```

需要两种模式: Torch (手电筒/常亮) 和 Flash (闪光灯/高亮)

---

## 二、关键测试参数

| 参数 | 描述 | 典型值 |
|------|------|--------|
| **LED Current Accuracy** | 每路电流精度 | ±2%~±5% |
| **Current Matching** | 多路电流一致性 | < 2% |
| **VOUT (Boost Output)** | Boost 输出电压 | ~4.5V (单颗LED) ~ 30V (多颗串联) |
| **OVP** | 开路保护电压 | VOUT_MAX + margin |
| **PWM Dimming Frequency** | 调光频率 | 1kHz ~ 20kHz |
| **Dimming Linearity** | 调光线性度 | 1%~100% |
| **Flash Current** | 闪光灯电流 | 500mA ~ 2A |
| **Flash Timeout** | 闪光最大持续时间 | 200ms ~ 400ms |
| **Torch Current** | 手电筒电流 | 几十 ~ 几百 mA |
| **Efficiency** | Boost 效率 | > 85% |

---

## 三、ATE 测试方法

### 3.1 LED Current & Matching

```
条件: VIN=3.7V, 使能 LED Driver
步骤:
  1. 设定当前 LED 电流寄存器 (如 20mA)
  2. 逐个测量每路 LED 引脚电流
  3. 计算精度: I_meas / I_target
  4. 计算 Matching: MAX(I_n - I_avg) / I_avg
判断: 精度 ±5%, Matching < 2%
```

### 3.2 OVP 测试

```
条件: LED 引脚开路 (所有 LED 不接)
步骤:
  1. 使能 LED Driver
  2. 监测 VOUT
  3. 当 VOUT 达到 OVP 阈值 → Boost 停止开关
  4. 记录 OVP 触发电压
判断: OVP 阈值在规格内
```

### 3.3 Flash 电流 / 时序

```
条件: VIN=3.7V
步骤:
  1. 设置 Flash 模式
  2. 测量 Flash 电流峰值
  3. 测量 Flash 持续时间 (从触发到关断)
  4. 确认 200ms/400ms 超时保护
判断: 电流 ±10%, 时序在规格内
```

### 3.4 PWM Dimming Linearity

```
条件: 正常 LED 负载
步骤:
  1. 设置 PWM Dimming Duty: 1%, 5%, 10%, 25%, 50%, 75%, 100%
  2. 在每个点测量 LED 电流
  3. 绘制 Dimming Curve
  4. 检查非线性度
```

---

## 四、常见问题

| 问题 | 可能原因 |
|------|---------|
| LED 亮度不均 | Current Matching 差 / LED 本身差异 |
| Flash 时 VIN 跌落 | 输入电容不足 / Boost 响应慢 |
| 调光时听到噪声 | PWM 频率 < 20kHz 可听范围 |
| OVP 误触发 | 输出电容过大 / 动态响应过冲 |
| LED 开路后闪烁 | OVP-Hiccup 行为异常 |

---

## 参考资料

- [[30.areas/PMIC/Boost/Boost_基本原理与测试|Boost 基本原理]]
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能测试]]
