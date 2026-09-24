---
title: "MCU ATE 测试基础"
tags:
  - mcu
  - ate
  - fundamentals
created: 2026-07-18
---

# MCU ATE 测试基础 / MCU ATE Test Fundamentals

---

## 一、MCU 测试的特点

MCU 是**数字为主、模拟为辅**的混合信号芯片，测试特点与 PMIC 显著不同：

| 维度 | PMIC | MCU |
|------|------|-----|
| 核心 | 功率转换 | 计算+控制 |
| 数字逻辑规模 | 小 (几万门) | 大 (几十万~几百万门) |
| 模拟模块 | 电源类 | 采集类 (ADC/DAC/PGA) |
| 电流量级 | A 级 | mA 级 |
| DFT 依赖 | 低 | **极高** (Scan/BIST) |
| 测试程序 | 直接配置寄存器 | 需要加载 Test Firmware |
| 测试时间 | 秒级 | 十几秒~几十秒 |
| Pattern 数据量 | 小 | 大 (Scan Pattern) |

---

## 二、ATE 平台选择

| 平台 | 厂商 | MCU 适用性 |
|------|------|-----------|
| **UltraFLEX / J750** | Teradyne | 主流 MCU 测试 (数字能力强) |
| **V93000** | Advantest | 高端 SoC/MCU |
| **93K / J750** | — | 模拟/混合信号 |
| **ETS-800** | Chroma | 电源为主 (MCU 数字能力弱) |
| **D10 / 93000** | 国产替代 | 中低端 MCU |

---

## 三、MCU 测试程序加载方案

MCU 测试的关键是**如何让芯片执行测试程序**：

### 3.1 SWD/JTAG 加载 (最常用)

```
ATE ──SWD/JTAG──→ MCU
                   │
                   ① 通过调试口下载 Test Firmware 到 SRAM
                   ② CPU 执行 Test Firmware
                   ③ Test Firmware 配置外设/模块
                   ④ 通过 UART/SPI/GPIO 与 ATE 交互
```

**优点**: 灵活、快速、复用开发工具链
**缺点**: 需要调试口引脚、Firmware 开发维护

### 3.2 Boot ROM 测试模式

```
芯片内置 Boot ROM:
  ① 上电时 Boot 引脚特定组合
  ② 进入 Boot ROM 测试模式
  ③ Boot ROM 内固化测试例程
```

**优点**: 无需下载 Firmware
**缺点**: 功能受限 (取决于 Boot ROM 设计)

### 3.3 直接寄存器控制 (Scan 模式)

```
通过 Scan Chain 直接控制内部寄存器:
  ① 完全绕过 CPU
  ② ATE 直接访问任意寄存器
```

**优点**: 快速、精确控制
**缺点**: 需要设计支持、调试复杂

---

## 四、MCU 测试分类

### 4.1 数字测试 (Digital)

| 测试项 | 方法 | 覆盖 |
|--------|------|------|
| **Scan Test** | ATPG Pattern | 逻辑故障 >98% |
| **Functional Pattern** | 功能向量 | 关键功能路径 |
| **MBIST** | 内建自测试 | SRAM |
| **IDDQ** | 静态电流 | 桥接/泄漏缺陷 |

### 4.2 模拟测试 (Analog)

| 测试项 | 方法 | 精度要求 |
|--------|------|---------|
| **ADC 静态** | Histogram / Servo | 0.1 LSB |
| **ADC 动态** | FFT | 0.5 dB |
| **DAC 静态** | 全码扫描 | 0.5 LSB |
| **PGA** | 增益/失调测量 | 0.1% |
| **Comparator** | 阈值扫描 | 1mV |
| **OSC** | 频率测量 | 0.1% |

### 4.3 存储测试 (Memory)

| 测试项 | 方法 |
|--------|------|
| **Flash 功能** | Program/Erase/Read Pattern |
| **Flash 可靠性** | Margin Read / Retention / Endurance |
| **SRAM** | MBIST |
| **EEPROM** | 字节读写/耐久 |

### 4.4 系统测试 (System)

| 测试项 | 方法 |
|--------|------|
| **Idd** | 各功耗模式电流 |
| **POR/BOD** | 阈值扫描 |
| **Clock** | 频率/Jitter/Lock |
| **外设** | UART/SPI/I2C/Timer 功能 |

---

## 五、CP vs FT 分工 (MCU)

| 测试 | CP | FT |
|------|-----|-----|
| Scan | ✅ 全部 | 部分复测 |
| MBIST | ✅ | 部分复测 |
| Flash 功能 | ✅ | ✅ |
| Flash Margin | ✅ | — |
| ADC Trim | ✅ | 验证 |
| ADC 性能 | ✅ (部分) | ✅ (全参数) |
| OSC Trim | ✅ | 验证 |
| 外设功能 | 有限 (引脚少) | ✅ 全面 |
| Idd | 有限 | ✅ |
| POR/BOD | ✅ | 复测 |
| 封装相关 | — | ✅ (Continuity 等) |

---

## 六、测试硬件要点

```
MCU DIB 设计要点:

① 模拟区隔离:
   - ADC/DAC 信号走线远离数字高速线
   - 模拟地/数字地分区

② 高速信号:
   - SWD/JTAG 时钟 (可达几十 MHz)
   - 阻抗匹配、短走线

③ 电源去耦:
   - VDD/VDDA/VBAT 分别去耦
   - 内核电源 (1.2V) 大电容

④ 参考电压:
   - VREF 引脚需要高精度源 (0.01%)
   - 低噪声 (影响 ADC 测试)

⑤ 晶振:
   - XTAL OSC 测试需要 DIB 上放置晶振
```

---

## 参考资料

- [[30.areas/MCU/DFT/Scan_DFT_测试|DFT 测试详解]]
- [[30.areas/MCU/Common/MCU_Trim|MCU Trim 完整指南]]
- [[30.areas/MCU/Common/MCU_FT|MCU FT 完整指南]]
- [[30.areas/PMIC/Common/ATE测试基础|PMIC ATE 基础]] — SMU/TMU 资源通用
