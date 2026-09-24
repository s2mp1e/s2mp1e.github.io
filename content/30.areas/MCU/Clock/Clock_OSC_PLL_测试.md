---
title: "Clock 系统测试详解"
tags:
  - mcu
  - clock
  - osc
  - pll
  - ate
created: 2026-07-18
---

# Clock / OSC / PLL 测试详解

---

## 一、内部 RC OSC 原理

```
RC Oscillator:

      ┌──── R ────┐
      │           │
      │          ─── C
      │           │
      │           ├───── V(t)
      │           │
     ┌┴┐         ┌┴┐
     └─┘ Comparator └─┘
      │           │
      └─── 逻辑 ───┘
           │
        FOSC 输出

FOSC ≈ 1 / (K × R × C)
```

**偏差来源**:
- R 绝对值: ±15%~±20%
- C 绝对值: ±10%~±15%
- 比较器延迟: 温度相关

→ **必须 Trim** (通过切换电容/电流阵列)

---

## 二、XTAL OSC 原理 (Pierce 振荡器)

```
        ┌─── XTAL ───┐
        │            │
       ───          ───
  C1   ───         ───  C2
        │            │
        ├──┐      ┌──┤
        │  └─反相器─┘  │
       GND          GND

测试关注:
  • 起振时间 (Startup Time)
  • 驱动强度 (Drive Level)
  • 负阻 (Negative Resistance)
```

---

## 三、PLL 原理

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│ PFD     │───→│ Charge  │───→│ Loop    │───→ VCO ──→ FOUT
│ (鉴相器) │    │ Pump    │    │ Filter  │      │
└────┬────┘    └─────────┘    └─────────┘      │
     ↑                                          │
     │          ┌─────────┐                     │
     └──────────┤ ÷N      │←────────────────────┘
                │ (分频器) │
                └─────────┘

FOUT = FIN × N / (R × M)
```

### MCU 典型 PLL 配置

```
HSE 8MHz → PLL ×9 → 72MHz (经典 STM32 配置)
HSI 8MHz → PLL ×6 → 48MHz
```

---

## 四、测试项目

### 4.1 频率测试 (FOSC)

```
方法:
  ① 配置时钟输出引脚 (MCO / CLKO)
  ② 用 TMU 或 Counter 测量
  ③ 测量 1024 个周期取平均

测量点:
  • HSI: 8MHz ± 2% (Trim 后 ± 1%)
  • LSI: 32kHz ± 10%
  • PLL 输出: 72MHz ± 0.1% (XTAL 输入时)
```

### 4.2 OSC Trim (HSI Trim)

```
流程:
  ① 测量 HSI 频率 (Default Code)
  ② 目标: 8.000MHz
  ③ 实际: 7.85MHz (偏差 -1.9%)
  ④ 计算 Trim Code (Step ~1%/Code)
  ⑤ 写入 Code → 复测
  ⑥ 确认 FOSC 进入 ±1% 窗口
  ⑦ 烧录 OTP

注意:
  • HSI Trim 通常需要 2 个温度点 (Room + Hot)
  • 部分 MCU 用 3 温度点 (Cold/Room/Hot)
```

### 4.3 PLL Lock Time (锁定时间)

```
测试:
  ① PLL 从关闭/掉电状态启动
  ② 测量到频率稳定的时间
  ③ 典型: 10~100 μs

测量方法:
  • 监测 PLL Lock 状态位 (软件轮询)
  • 或监测输出频率稳定 (TMU 连续测量)
```

### 4.4 Jitter 测试 (时钟抖动)

```
Jitter 类型:
  • Period Jitter: 周期变化
  • Cycle-to-Cycle: 相邻周期差
  • Long-Term: 长期漂移

ATE 测量:
  • TMU 连续测量 N 个周期
  • 统计 σ (标准差) = Period Jitter
  • 典型: < 0.5% (RC OSC), < 0.1% (PLL)

注意: 量产中 Jitter 通常只做 Spot Check
```

### 4.5 XTAL OSC 起振时间

```
测试:
  ① XTAL OSC 关闭
  ② 使能 (EN=HIGH)
  ③ 测量到振荡稳定 (幅度 > 90%) 的时间
  ④ 典型: 几百 μs ~ 几 ms

ATE 挑战:
  • 需要外部 XTAL 和负载电容 (DIB 上放置)
  • Socket 寄生影响 (引线长度)
  • 量产中可用内部环回 (Loopback) 替代
```

---

## 五、时钟系统测试要点

```
MCU 时钟树示例:

HSI (8MHz RC) ─┬─→ /2 → CPU Clock
               ├─→ PLL ×9 → 72MHz → CPU/USB
               └─→ ADC Clock

LSI (32kHz) ───→ WDT / RTC

HSE (8MHz XTAL) ─→ PLL

测试关键路径:
  ① HSI → CPU 运行 (功能验证)
  ② HSI → PLL → CPU 高速运行
  ③ LSI → WDT 计数验证
  ④ 各时钟域切换 (Clock Switch)
```

---

## 参考资料

- [[30.areas/MCU/Common/MCU_Trim|MCU Trim 完整指南]] — OSC Trim
- [[30.areas/PMIC/Analog_Core/Oscillator_原理与测试|PMIC Oscillator 测试]] — RC OSC 原理相通
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
