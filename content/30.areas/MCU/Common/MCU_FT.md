---
title: "MCU FT 测试完整指南"
tags:
  - mcu
  - ft
  - final-test
  - reference
created: 2026-07-18
---

# MCU FT 测试完整指南 / MCU Final Test Complete Guide

> MCU 的 FT (Final Test) 在封装完成后进行，覆盖数字、模拟、存储、系统的全参数测试。MCU 的 FT 比 PMIC 更复杂：测试项更多、时间更长、DFT 依赖更重。

---

## 一、MCU FT 硬件架构

```
┌────────────────────────────────────────────┐
│  ATE (UltraFLEX / V93000)                  │
│  [数字通道] [SMU] [AWG/Digitizer] [TMU]    │
───── Cable / Pogo Tower ─────────────────────│
│  DIB (Device Interface Board)              │
│  ├── Socket (QFN/LQFP/BGA)                │
│  ├── 晶振 (XTAL 测试用)                    │
│  ├── Relay Matrix                         │
│  ├── 去耦电容网络                          │
│  └── 模拟信号调理                          │
├─────────────────────────────────────────────┤
│  Handler (三温: Cold/Room/Hot)             │
└────────────────────────────────────────────┘
```

---

## 二、MCU FT 完整流程

```
Handler Input → 温度平衡
    ↓
① Continuity / Leakage         所有引脚开短路、漏电
    ↓
② JTAG ID Code                 确认芯片型号/版本
    ↓
③ OTP Readback                 读取 Trim Code
    ↓
④ Scan Test (复测)            数字逻辑 (部分 Pattern)
    ↓
⑤ MBIST (复测)                SRAM
    ↓
⑥ Flash 功能测试              读写擦验证
    ↓
⑦ ADC 全参数测试              静态 + 动态
    ↓
⑧ DAC 全参数测试              静态 + 建立时间
    ↓
⑨ PGA / Comparator 测试       增益/失调/阈值
    ↓
⑩ OSC / PLL 测试              频率/Jitter/Lock
    ↓
⑪ 外设功能测试                UART/SPI/I2C/Timer/PWM
    ↓
⑫ Idd 功耗测试                各模式电流
    ↓
⑬ POR / BOD 测试              阈值/迟滞
    ↓
⑭ Trim 验证                   关键参数复测
    ↓
⑮ Functional Test             系统级功能
    ↓
Bin Decision → Handler Bin Out
```

---

## 三、测试项详解

### 3.1 Continuity / Leakage

```
与 PMIC 相同:
  • FIMV: 100μA → 测电压 (ESD 二极管 ~0.7V)
  • 高阻态漏电流: < ±1μA
  
MCU 特点: 引脚多 (48~144+ pins), 测试时间长
  → 并行测试 / 多通道 SMU
```

### 3.2 JTAG ID Code

```
读取芯片的 JTAG ID:
  • 确认芯片型号正确
  • 确认版本 (Revision)
  • 防止混料
```

### 3.3 OTP Readback

```
确认 CP 阶段烧录的 Trim Code 正确加载:

  ① 上电 POR
  ② 读取 OTP 区域 (通过 I2C/内部总线/Test Mode)
  ③ 校验: Trim Code ≠ 空白值
  ④ 校验: Checksum 正确
  ⑤ 验证 Code 已加载到目标寄存器
```

### 3.4 Scan 复测

```
FT 中 Scan 的考虑:
  • CP 已做全量 Scan → FT 可只做部分 Pattern
  • 或全部重测 (时间允许时)
  • 封装应力和键合问题 → 通过 Scan 快速检测
```

### 3.5 ADC 全参数测试

```
FT 中的 ADC 测试比 CP 更完整:

静态: Histogram 测试 (Offset/Gain/DNL/INL)
动态: FFT 测试 (SNR/THD/ENOB) — 耗时长, 可选
多通道: 所有通道验证

测试时间控制:
  • 静态 Histogram: ~100ms (65536 点 @ 1MS/s)
  • 动态 FFT: ~100ms
  • 16 通道 × 2 测试 = 3.2s (主要耗时项)
  → 策略: 动态只测代表通道, 静态测全通道
```

### 3.6 OSC / PLL 测试

```
HSI: 频率 ±1% (Trim 后)
PLL: 倍频后频率验证
LSI: 频率 ±10%
时钟切换: 各时钟源切换功能

典型: 通过 MCO (Master Clock Output) 引脚观测
```

### 3.7 外设功能测试

```
测试程序 (Test Firmware) 驱动各外设:

UART: 收发 Loopback 测试
SPI: 主从模式数据比对
I2C: 主从模式读写
Timer: 计数/比较/捕获
PWM: 频率/占空比
WDT: 超时复位
RTC: 计时精度 (短时间)
GPIO: 全部引脚输入输出功能
中断: 外部中断响应
```

### 3.8 Idd 功耗测试

```
各模式电流测量:

Run (全速): < 10mA
Run (低速): < 3mA
Sleep: < 1mA
Deep Sleep: < 10μA
Standby: < 2μA

注意:
  • nA 级测量需要高精度 SMU + 长时间稳定
  • 引脚配置影响电流 (浮空引脚漏电)
```

### 3.9 POR / BOD 测试

```
POR: 上升/下降阈值 + 迟滞
BOD: 各 Level 阈值 + 动作验证

详见: [[30.areas/MCU/System/Idd_电源_复位_测试|系统测试详解]]
```

### 3.10 Trim 验证

```
FT 必须验证 CP 的 Trim 生效:

ADC: Offset/Gain 在规格内
OSC: HSI 频率在 ±1%
BOD: 阈值在规格
PGA: 增益在规格
DAC: 输出在规格
VREF: 参考电压在规格
```

---

## 四、MCU FT Bin 策略

```
┌──────────┐
│  Bin 1   │  良品 → 编带出货
├──────────┤
│  Bin 2   │  重测品 (接触问题等)
├──────────┤
│  Bin 3   │  Parametric Fail (ADC/OSC 等)
├──────────┤
│  Bin 4   │  Scan/MBIST Fail (数字缺陷)
├──────────┤
│  Bin 5   │  Flash Fail
├──────────┤
│  Bin 6   │  Idd/POR Fail (功耗/复位)
├──────────┤
│  Bin 7   │  Trim/OTP Fail
├──────────┤
│  Bin 8   │  QA Sample
└──────────┘
```

---

## 五、三温 FT

```
MCU 三温测试重点:

| 温度 | 重点测试 |
|------|---------|
| Cold (-40°C) | 低温启动、ADC 性能、OSC 精度 |
| Room (25°C) | 基准参数、Trim 验证 |
| Hot (85/125°C) | Idd (漏电)、Flash 功能、ADC 漂移 |

ADC 参数随温度变化:
  Offset: 漂移 ~0.5 LSB/°C (Trim 前)
  Gain: 漂移 ~0.02%/°C
  → 规格需覆盖全温范围
```

---

## 六、测试时间优化

```
MCU FT 测试时间长 (10~60s), 优化至关重要:

| 测试项 | 时间 (典型) | 优化方法 |
|--------|-----------|---------|
| Scan | 1~3s | 减少复测 Pattern |
| MBIST | 0.5~1s | 只测关键 SRAM |
| Flash | 2~5s | 只测部分区域 |
| ADC 静态 | 1~3s | 减少通道/采样数 |
| ADC 动态 | 0.5~2s | 只测代表通道 |
| 外设 | 2~5s | 合并测试程序 |
| Idd | 1~2s | 缩短稳定时间 |
| 其他 | 2~5s | — |
| **Total** | **10~25s** | 目标 < 10s |

并行测试 (Multi-Site):
  2 Site: 时间减半
  4 Site: 时间 1/4
  → MCU 量产几乎都用 Multi-Site
```

---

## 七、常见 FT 问题

| 问题 | 可能原因 | 调查方向 |
|------|---------|---------|
| Scan Fail 比例异常 | 封装应力/键合 | 交叉验证 CP 数据 |
| ADC 性能 CP/FT 差异 | 封装寄生/DIB 差异 | 对比测试环境 |
| Flash 在 FT 擦写失败 | 电荷泵异常 | 测试电压/时序 |
| Idd 偏高 | 引脚浮空/配置错误 | 检查测试程序 |
| OTP 读取失败 | 烧录不完整 | 冗余位/复烧 |
| 低温启动失败 | OSC 低温不起振 | OSC 低温特性 |
| Multi-Site 良率差异 | DIB Site 不均衡 | 交叉验证 |

---

## 参考资料

- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim 完整指南]]
- [[30.areas/MCU/DFT/Scan_DFT_测试|DFT 测试详解]]
- [[30.areas/PMIC/Common/FT|PMIC FT 指南]] — Bin/三温/Handler 通用
- [[30.areas/PMIC/Common/ATE测试基础|PMIC ATE 基础]] — 硬件资源通用
