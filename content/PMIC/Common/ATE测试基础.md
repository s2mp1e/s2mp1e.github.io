---
title: "ATE 测试基础"
tags:
  - pmic
  - ate
  - fundamentals
created: 2026-07-17
---

# ATE 测试基础 / ATE Test Fundamentals

---

## 一、什么是 ATE？

**ATE (Automatic Test Equipment)** — 自动化测试设备，用于在半导体量产中自动完成芯片的 electrical 测试。

### 常见 ATE 平台

| 平台                   | 厂商        | PMIC 适用性     |
| -------------------- | --------- | ------------ |
| **UltraFLEX / J750** | Teradyne  | 广泛应用，PMIC 主流 |
| **V93000**           | Advantest | 高端混合信号       |
| **ETS-800 / 3640**   | Chroma    | 电源管理专用       |
| **ASL-1000 / STS**   | SPEA      | 模拟/电源芯片      |
| **PECC**             | 华峰测控      | 国内模拟测试       |

---

## 二、ATE 核心资源类型

### DC 资源 (SMU / VI Source)

- **FVMV (Force Voltage Measure Voltage)** — 强制电压、测量电压
- **FVMI (Force Voltage Measure Current)** — 强制电压、测量电流
- **FIMV (Force Current Measure Voltage)** — 强制电流、测量电压

### 波形发生器 / 数字化仪 (AWG / Digitizer)

- 产生/捕获模拟波形
- PMIC 中用于纹波、瞬态分析

### 时序测量 (Timing Measurement Unit)

- 测量脉冲宽度、频率、相位
- 精度可达 ps 级别
- PMIC 中广泛用于 Ton, Fsw, Dead Time 等

### 数字通道 (Digital I/O / PMU)

- 数字接口通信 (I2C/SPI)
- 逻辑电平测试
- 协议验证

### 接脚参数 (Per-Pin Resources)

现代 ATE 每根引脚可能集成多种资源：

```
[Pin] → [DC (SMU)]
      → [Digital Driver/Comparator]
      → [Timing Measurement]
      → [PMU (Per Pin Measurement)]
      → [Relay Matrix]
```

---

## 三、PMIC 测试的特殊性

相比纯数字或纯模拟芯片，PMIC 测试有以下特点：

### 1. 高电压 / 大电流
- 输入电压可能高达几十 V
- 输出电流可能达到几 A ~ 几十 A
- 需要 **Power DUT Board** + **Relay Matrix**

### 2. 多种输出同时测试
- 复杂 PMIC 可能有 10+ 路输出 (Buck + LDO + Boost)
- 需要 **Parallel Testing** 或 **Scan Mode**

### 3. 时序敏感性
- 开关频率从几百 kHz 到几 MHz
- Ton 可能只有几十 ns
- 需要高精度 Timing Measurement

### 4. 热管理
- 大电流产热显著 (I²R loss)
- 需要散热 (Heatsink / Airflow / Liquid Cooling)
- 温度影响测试结果 (需温箱或热板)

### 5. 修调 (Trim)
- 芯片内部模拟偏差需要 Trim
- Trim Code 通过 OTP / EFUSE 存储
- 测试 + 修调 + 验证 的循环

---

## 四、测试流程 / Test Flow (CP vs FT)

### CP (Chip Probing / 晶圆测试)
```
目的: 早期筛选不良 Die
特点:
  - 通过探针卡 (Probe Card) 接触 Pad
  - 不能大电流测试 (探针电阻/电感限制)
  - 通常测 DC/时序/Trim
  - 环境温度: 25°C / Hot
```

### FT (Final Test / 成品测试)
```
目的: 最终质量把关
特点:
  - 通过 Socket/Handler 接触封装引脚
  - 可以大电流测试
  - 覆盖所有 AC/DC/Timing/Protection
  - 环境温度: Cold / 25°C / Hot
  - 三温测试 (Triple Temp) 常见
```

---

## 五、DIB / DUT Board

测试板设计是 PMIC ATE 的关键环节：

```
ATE Tester
    │
    │ (Cables / Pogo Tower)
    │
Performance Board (PB) / DIB
    │
    ├── Force/Sense 走线 (Kelvin connection)
    ├── Relay Matrix (自动切换测试通道)
    ├── Load Board (电子负载)
    ├── Decoupling Capacitors
    └── DUT Socket / Probe Card
        │
        DUT
```

### 关键设计考虑
- **Kelvin Connection**: 4-wire 测量避免线阻影响
- **Relay 切换**: 不同测试项需要不同配置
- **Power 分配**: 大电流走线足够宽，多层 PCB
- **去耦**: 各电源引脚附近放置足够电容

---

## 六、常见 PMIC 测试术语

| 术语                 | 含义                              |            |
| ------------------ | ------------------------------- | ---------- |
| **SRAM**           | 芯片上电后的寄存器默认配置 (如 Trim 值)        |            |
| **OTP / EFUSE**    | 一次性可编程存储 (用于存 Trim Code)        |            |
| **Hiccup**         | OCP/SCP 保护的一种恢复模式               |            |
| **PSM / PFM**      | 轻载模式，降低开关频率节能                   |            |
| **PWM**            | 脉宽调制                            | 固定频率正常工作模式 |
| **Soft Start**     | 软启动，控制 VOUT 上升斜率                |            |
| **DO / ΔVDO**      | Dropout Voltage / Dropout Delta |            |
| **Load Transient** | 负载瞬态，负载跳变时的响应                   |            |

---

## 参考资料

- [[30.areas/PMIC/Common/FT|FT 测试完整指南]] — **FT 流程与实践**
- [[30.areas/PMIC/Common/Trim|PMIC Trim 完整指南]] — **Trim 全流程**
- [[30.areas/PMIC/Common/时序测试|时序测试方法]]
- [[30.areas/PMIC/Buck/Buck_测试项目总览|Buck 测试项目总览]]
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能测试]]
