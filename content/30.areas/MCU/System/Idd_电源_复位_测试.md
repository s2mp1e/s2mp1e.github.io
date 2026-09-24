---
title: "Idd/电源/复位 测试详解"
tags:
  - mcu
  - idd
  - power
  - por
  - bod
  - ate
created: 2026-07-18
---

# Idd / 电源 / 复位 测试详解

---

## 一、Idd 功耗测试

### 1.1 测试原理

```
测量各功耗模式下 VDD 的输入电流:

ATE SMU
   │
   ├─ Force 线 → VDD Pin
   └─ Sense 线 → VDD Pin (Kelvin)

Force VDD = 3.3V
Measure IDD = 各模式的电流
```

### 1.2 各模式测试配置

| 模式 | 时钟配置 | 外设 | 典型值 (STM32F0 类) |
|------|---------|------|---------------------|
| **Run @ 48MHz** | HSI+PLL | 全开 | ~10mA |
| **Run @ 8MHz** | HSI/1 | 全开 | ~3mA |
| **Sleep** | 停止 HCLK | 部分 | ~1mA |
| **Deep Sleep** | 仅 LSI/LSE | 极少 | ~10μA |
| **Standby** | 全停 | 无 | ~2μA |
| **Shutdown** | 全停 | 无 | ~500nA |

### 1.3 测试流程

```
① 芯片上电, 加载测试程序
② 配置 Run 模式 (全速)
③ 测量 Idd_run
④ 执行 WFI 指令 → 进入 Sleep
⑤ 测量 Idd_sleep
⑥ 配置 Deep Sleep → 进入
⑦ 测量 Idd_deepsleep
⑧ ... 直到所有模式测完
```

### 1.4 测试注意事项

```
① 低功耗模式电流极低 (< 1μA)
   → 需要高精度 SMU (nA 级分辨率)
   → 测量时间延长 (稳定时间)

② IO 引脚状态影响功耗
   → 所有悬空引脚配置为确定电平 (上拉/下拉)
   → 避免浮空引脚产生漏电

③ 稳定时间
   → 模式切换后等待电流稳定 (几 ms ~ 几百 ms)

④ 温度影响
   → Idd 随温度上升 (漏电增加)
   → 高温 Idd 规格通常放宽
```

---

## 二、POR (Power-on Reset) 测试

### 2.1 原理

```
POR 保证芯片上电时从已知状态开始:

VDD
  │        ┌─────────────
  │       ╱
  │      ╱
  │     ╱
  │    ╱
  └───┘
      ↑
   POR 释放
  (VDD > VPOR_rising)

当 VDD < VPOR_falling → 芯片复位
```

### 2.2 测试方法

```
① POR 上升阈值:
   - VDD 从 0 缓慢上升 (如 1V/ms)
   - 监测芯片复位释放 (读状态寄存器或测功能)
   - 记录 VPOR_rising

② POR 下降阈值:
   - VDD 从正常值缓慢下降
   - 监测芯片复位触发
   - 记录 VPOR_falling

③ 迟滞:
   Hysteresis = VPOR_rising - VPOR_falling

典型规格:
  VPOR_rising: 1.5V~1.7V
  VPOR_falling: 1.3V~1.5V
  Hysteresis: ~200mV
```

---

## 三、BOD (Brown-Out Detection) 测试

### 3.1 原理

BOD 监测 VDD 是否低于可工作电压，可配置为复位或中断：

```
VDD 正常:     ┌───────────────────┐
             │  BOD 不触发        │

VDD 跌落:     ┌─────────┐
             │  BOD 触发 │ → Reset 或 Interrupt
             └─────────┘
                    ↑
               BOD 阈值 (可配置多档)
```

### 3.2 测试方法

```
① BOD 阈值测试 (每档):
   - 配置 BOD Level = 1 (如 2.8V)
   - VDD 从 3.3V 缓慢下降
   - BOD 触发 → 读标志/复位
   - 记录触发电压
   - 对每档 (Level 0~7) 重复

② BOD 迟滞:
   - 下降触发后, 上升恢复
   - 测恢复电压

③ BOD 动作验证:
   - 复位模式: BOD 触发 → MCU 复位
   - 中断模式: BOD 触发 → 中断标志置位

④ BOD Trim (如需要):
   - 测量实际阈值 vs 目标
   - 烧录 Trim Code
```

---

## 四、内部 LDO / DC-DC 测试

```
MCU 内部电源架构:

VDD (3.3V) ──┬──→ 内部 LDO → VDD_CORE (1.2V) → CPU/逻辑
              │
              └──→ 内部 DC-DC (可选) → VDD_CORE

测试项目:
  ① VDD_CORE 输出电压 (通过测试引脚或寄存器)
  ② 内部 LDO 带载能力 (全速运行不跌落)
  ③ 内部 DC-DC 效率 (如支持)
  ④ 外部旁路模式 (Bypass Mode, 如支持)
```

---

## 五、睡眠模式功能测试

```
除 Idd 外, 还需验证:

① 唤醒功能:
   - 各唤醒源: 外部中断, RTC, WDT, UART 等
   - 唤醒时间: < 几 μs ~ 几 ms

② SRAM 保持:
   - Deep Sleep 前写 Pattern
   - 唤醒后验证 (Standby 模式 SRAM 丢失需确认)

③ 时钟恢复:
   - 唤醒后时钟自动恢复正确
   - PLL 重新锁定

④ 寄存器保持:
   - 进入/退出低功耗模式后寄存器状态正确
```

---

## 六、电源测试硬件要点

```
① 低电流测量 (nA 级):
   → 专用高精度 SMU
   → Guard 环设计
   → 长稳定时间

② 快速电源跳变:
   → 用于 BOD/POR 测试的快速 VDD 变化
   → AWG + Power Amp 方案

③ 多电源域:
   → VDD, VDDA (模拟), VBAT (备份) 分别供电
   → 分别测量各域电流
```

---

## 参考资料

- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|UVLO 测试 (PMIC)]] — 阈值测试方法相通
- [[30.areas/PMIC/LDO/LDO_原理与测试|LDO 测试 (PMIC)]] — 内部 LDO 测试参考
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
- [[30.areas/MCU/Common/MCU_FT|MCU FT 完整指南]]
