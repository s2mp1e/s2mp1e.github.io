---
title: "保护功能测试详述"
tags:
  - pmic
  - protection
  - ovp
  - uvlp
  - ocp
  - otp
  - ate
created: 2026-07-17
---

# 保护功能测试详述 / Protection Test Details

---

## 一、OVP (Over Voltage Protection / 过压保护)

### 原理

当 VOUT 超过 OVP 阈值时，芯片立即关断 HS MOS 以防止输出电压继续上升。

### ATE 测试方法

```
方法 1: VOUT 扫描法
  1. 让 Buck 正常工作
  2. 逐步降低 VIN 或调节 FB 电压
  3. 检测 VOUT 上升
  4. 当 OVP 触发时: VOUT 停止上升或开始下降
  5. 记录触发点的 VOUT 值

方法 2: 直接施加法
  1. 芯片关断状态下，强制 VOUT 引脚电压从 OV_TH_LOW 到 OV_TH_HIGH
  2. 监测 OVP Flag (寄存器位或 PG 信号)
  3. OVP Flag 翻转点即为阈值
```

### 关键规格

| 参数 | 典型值 |
|------|--------|
| OVP 阈值 | VOUT_NOM + 10%~20% |
| OVP 响应时间 | < 几 μs |
| OVP 恢复模式 | 自动恢复 / Latch |

---

## 二、UVLO (Under Voltage Lockout / 欠压锁定)

### 原理

当 VIN 低于 UVLO 阈值时，芯片整体关断，防止在供电不足下异常工作。

### ATE 测试方法

```
条件: EN=HIGH, 设定负载
步骤:
  1. VIN 从正常工作电压逐步降低
  2. 监测 VOUT 或 SW 开关状态
  3. UVLO 触发: VOUT 开始下降 / SW 停振
  4. 记录 UVLO 下降阈值

  5. VIN 再从 UVLO 以下逐步升高
  6. 芯片重新启动: VOUT 恢复
  7. 记录 UVLO 上升阈值

迟滞 = 上升阈值 - 下降阈值
```

### 关键规格

| 参数 | 典型值 |
|------|--------|
| UVLO 下降阈值 | 2.5V ~ 4.5V |
| UVLO 迟滞 | 200mV ~ 500mV |
| UVLO 后行为 | 芯片完全关断 |

---

## 三、OCP (Over Current Protection / 过流保护)

### 原理

当输出电流超过 OCP 阈值时，芯片进入限流或保护模式。

### 常见 OCP 类型

| 类型 | 恢复行为 | 特点 |
|------|---------|------|
| **Hiccup Mode** | 关断 → 等待 → 尝试重启 | 平均功耗低，适合短路 |
| **Constant Current Limit** | 限制电流在 OCP 阈值 | 持续大功耗 |
| **Foldback** | OCP 触发后降低限流值 | 功耗更低 |
| **Latch Off** | 关断后需要 POR 重启 | 需要人工干预 |
| **Cycle-by-Cycle** | 每个周期检测 | 逐周期保护 |

### ATE 测试方法

```
条件: VIN 正常, EN=HIGH
步骤:
  1. 手拉负载电流从 0 开始逐步增大
  2. 监测 VOUT
  3. OCP 触发时: VOUT 开始明显下降
  4. 记录触发点的 IOUT

对于 Hiccup:
  - 观察 VOUT 波形: 周期性尝试重启
  - Hiccup On Time / Off Time 是否符合设计
```

---

## 四、SCP (Short Circuit Protection / 短路保护)

### 原理

VOUT 被直接短路到 GND 时的极端保护。

### ATE 测试方法

```
方法: 强制 VOUT = GND
  1. 启动芯片 (EN=HIGH)
  2. 通过开关将 VOUT 短接到 GND
  3. 观测:
     - 短路电流是否在规格内
     - 芯片是否进入安全模式 (Hiccup / Latch)
     - 短路解除后是否能自动恢复
  4. 关断 VOUT 短路开关
```

---

## 五、OTP (Over Temperature Protection / 过热保护)

### 原理

芯片结温超过 OTP 阈值时关断，防止热损坏。

### ATE 测试方法 (通常是 Sample Level)

```
方法 1: Thermal Chamber
  1. 芯片放到温箱
  2. 逐步升温
  3. 监测 OTP Flag 或 VOUT
  4. 记录 OTP 触发温度
  5. 降温 → 记录恢复温度 + 迟滞

方法 2: 芯片自加热
  1. 在最大负载下运行
  2. 芯片自发热
  3. 监测 OTP 触发
  4. 需要热像仪或内部温度传感器读数

注意: FT 量产中通常只测 OTP 功能 (Pass/Fail) 而非精确阈值
```

---

## 六、PG (Power Good / 输出电压正常指示)

### 原理

当 VOUT 达到规定比例 (如 90%) 时，PG 信号输出 HIGH (开漏/推挽)。

### ATE 测试方法

```
PG 上升阈值:
  1. 启动芯片，VOUT 从 0 上升
  2. 监测 PG 引脚
  3. PG 上升时的 VOUT → PG_HIGH_TH

PG 下降阈值:
  1. 关断芯片，VOUT 下降
  2. 监测 PG 引脚
  3. PG 下降时的 VOUT → PG_LOW_TH

PG 延迟:
  1. EN 上升 → PG 上升 之间的延迟
  2. 通常 = ACT TIME + 额外延迟
```

---

## 七、测试总结表

| 保护项 | 触发方式 | 观察点 | 测试难度 | 量产覆盖 |
|--------|---------|--------|---------|---------|
| OVP | VOUT 超过阈值 | OVP Flag / VOUT 波形 | 中 | FT 全测 |
| UVLO | VIN 低于阈值 | SW 停振 / VOUT 降 | 低 | FT 全测 |
| OCP | IOUT 超过阈值 | VOUT 下降 / Hiccup | 中 | FT 全测 |
| SCP | VOUT 短路 | 短路电流 / 恢复行为 | 高 | Sample |
| OTP | 结温超过阈值 | OTP Flag / VOUT 关断 | 高 | Sample |
| PG | VOUT 达到阈值 | PG 引脚电平 | 低 | FT 全测 |

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_测试项目总览|Buck 测试项目总览]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
