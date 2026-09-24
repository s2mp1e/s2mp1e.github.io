---
title: "Thermal 原理与测试"
tags:
  - pmic
  - thermal
  - otp
  - ate
created: 2026-07-17
---

# Thermal 原理与测试

---

## 一、温度检测原理

### 1.1 基于二极管 (BJT)

利用 PN 结正向压降的温度特性：

$$
V_{BE}(T) = V_{BE0} - \alpha \times T
$$

- α ≈ -2mV/°C
- 简单、低成本、中等精度

### 1.2 基于 ΔVBE

利用两个不同电流下的 VBE 差值：

$$
\Delta V_{BE} = \frac{kT}{q} \times \ln(N)
$$

- 与工艺无关
- 精度 ±1°C~±2°C
- 常用于 Bandgap 和温度传感器

### 1.3 基于温度传感器 (ADC)

- 内部温度传感器 + ADC
- 数字寄存器读取温度值
- 精度 ±0.5°C~±3°C

---

## 二、关键测试参数

| 参数 | 描述 | 典型值 |
|------|------|--------|
| **OTP Threshold** | 过温关断阈值 | 150°C~170°C |
| **OTP Hysteresis** | 恢复迟滞 | 10°C~30°C |
| **T_WARN Threshold** | 预警阈值 | 120°C~140°C |
| **Temperature Sensor Accuracy** | 传感器精度 | ±2°C~±5°C |
| **RθJA** | 结到环境热阻 | 20~100 °C/W |
| **RθJC** | 结到外壳热阻 | 5~30 °C/W |

---

## 三、ATE 测试方法

### 3.1 OTP 阈值测试 (量产级)

量产中通常用 **Sample Level**，全测只测功能：

```
功能测试 (全测):
  条件: 加热芯片到 OTP 阈值以上
  步骤:
    1. 使能芯片, 正常工作
    2. 加热 (热板/风枪) → OTP 触发
    3. 确认芯片关断 / FAULT 信号
    4. 冷却 → 确认自动恢复
  判断: OTP 功能正常 (PASS/FAIL)

阈值测试 (Sample Level):
  条件: 温箱, 精确控温
  步骤:
    1. 升温到 OTP_TH - 10°C → 确认芯片正常工作
    2. 每次升温 1°C → 等待热平衡
    3. 芯片关断 → 记录温度
    4. 降温到恢复 → 记录恢复温度
    5. 迟滞 = 关断 - 恢复
```

### 3.2 温度传感器校准

```
条件: 温箱, 已知温度点
步骤:
  1. 在 25°C 和 85°C 下平衡
  2. 读取温度传感器寄存器值
  3. 根据两点校准:
     Gain = (T2 - T1) / (Code2 - Code1)
     Offset = T1 - Gain × Code1
  4. 校准后的温度 = Gain × Code + Offset
```

### 3.3 热阻测量 (RθJA)

```
条件: 芯片固定功耗, 测温箱
步骤:
  1. 设定 P_D = 1W (已知电压 × 电流)
  2. 等待热平衡 (几分钟)
  3. 测量 T_J (利用温度传感器)
  4. 记录 T_A (温箱温度)
  5. RθJA = (T_J - T_A) / P_D
```

---

## 四、三温测试 (Triple Temp Test)

量产 PMIC 通常需要进行三温测试：

| 温度 | 目的 | 典型值 |
|------|------|--------|
| **Hot (高温)** | 验证高温性能、OTP | 85°C~150°C |
| **Room (室温)** | 基准参数 | 25°C |
| **Cold (低温)** | 验证低温启动 | -40°C~0°C |

### 三温测试顺序

```
Handler → Hot Tester → Handler → Room Tester → Handler → Cold Tester
   ↑                                                           │
   └─────────────────── 完成 ←─────────────────────────────────┘
```

或单台 Tester 逐温测试 (需要切换时间)。

---

## 参考资料

- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能测试 — OTP]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础 — 三温]]
- [[30.areas/PMIC/PMU/PMU_架构与测试|PMU 热管理]]
