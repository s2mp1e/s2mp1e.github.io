---
title: "PMIC Trim 完整指南"
tags:
  - pmic
  - trim
  - ate
  - reference
created: 2026-07-18
---

# PMIC Trim 完整指南 / PMIC Trim Complete Guide

> 修调 (Trim) 是 PMIC 量产测试的核心环节。工艺偏差导致每颗芯片的模拟参数都不同，Trim 通过在 CP 阶段测量→计算→烧录修正码，使所有芯片的最终参数落在规格范围内。

---

## 一、为什么要 Trim？ / Why Trim?

PMIC 是模拟密集型芯片。虽然 Bandgap 可以产生相对稳定的参考电压，但**电阻、电容、MOS 特性、BJT 匹配**等随工艺变化，导致关键参数偏离目标值。

### 典型工艺偏差来源 / Process Variation Sources

| 偏差来源 | 影响参数 | 典型偏差量 |
|---------|---------|-----------|
| **电阻绝对值** (Poly/Nwell R) | OSC 频率、RC Ton、VREF、VOUT | ±15%~±20% |
| **电容绝对值** (MIM/MOM C) | OSC 频率、RC Timer、Soft Start | ±10%~±15% |
| **MOS 阈值电压 Vth** | 电流源精度、ILIM、比较器偏移 | ±50mV~±100mV |
| **BJT VBE 匹配** | Bandgap VREF 绝对值 | ±2%~±5% |
| **电阻比例匹配** | VOUT 分压比、电流镜匹配 | ±0.5%~±2% |
| **芯片间 (Lot-Lot/Wafer-Wafer)** | 所有参数 | — |

### Trim 收益示例

```
Trim 前:
  VREF:  1.200V ± 5%   → 1.140V ~ 1.260V
  FOSC:  2.000MHz ± 15% → 1.700MHz ~ 2.300MHz
  Ton:   100ns ± 18%   → 82ns ~ 118ns

Trim 后:
  VREF:  1.200V ± 0.5%  → 1.194V ~ 1.206V
  FOSC:  2.000MHz ± 3%   → 1.940MHz ~ 2.060MHz
  Ton:   100ns ± 3%    → 97ns ~ 103ns
```

---

## 二、Trim 全流程 / Trim Flow

```
┌─────────────────────────────────────────────────────────┐
│  CP (Chip Probing / 晶圆测试)                             │
│                                                          │
│  ① Pre-Trim Measurement                                 │
│     测量所有需要 Trim 的参数 (默认 Trim Code = 0)          │
│     ↓                                                    │
│  ② Trim Code Calculation                                │
│     根据测量值 vs 目标值，计算每个参数的修正码              │
│     ↓                                                    │
│  ③ OTP / EFUSE Program                                 │
│     将 Trim Code 烧录到 OTP/EFUSE                        │
│     ↓                                                    │
│  ④ Post-Trim Verify                                     │
│     芯片重新上电，读回 Trim Code，验证参数已修正            │
│     ──── End of CP ────                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  FT (Final Test / 成品测试)                               │
│                                                          │
│  ⑤ OTP Readback                                         │
│     芯片上电自动加载 OTP，通过 I2C/SPI 或内部自动读取         │
│     ↓                                                    │
│  ⑥ Trim Verification (关键参数复测)                        │
│     验证 Trim 后的参数确实在规格内                          │
│     ↓                                                    │
│  ⑦ Full Parametric Test                                 │
│     所有 AC/DC/Timing/Protection 测试                     │
└─────────────────────────────────────────────────────────┘
```

---

## 三、存储技术 / Storage Technologies

### 技术对比

| 技术 | 可编程次数 | 存储原理 | 面积 | 可靠性 | PMIC 常用 |
|------|----------|---------|------|--------|----------|
| **Poly Fuse** | 1次 | 大电流熔断多晶硅 | 大 | 高 | 模拟 IC |
| **Metal Fuse** | 1次 | 大电流熔断金属线 | 大 | 高 | 模拟 IC |
| **Gate Oxide OTP** | 1次 | 高压击穿栅氧层 | 小 | 中高 | 数模混合 |
| **E-Fuse** | 1次 | 电迁移熔断金属 | 小 | 高 | 最常见 |
| **Anti-Fuse** | 1次 | 击穿介质层形成通路 | 极小 | 极高 | 高可靠性 |
| **MTP** | 多次(几百~几千) | 浮栅/电荷存储 | 中 | 中 | 研发/小批量 |

### 3.1 E-Fuse 物理原理

```
未烧录:  电阻 ~ 几 Ω (导通)
           ↓
烧录:    施加烧录电流 (~10mA~50mA, ~几 μs)
           ↓
电迁移:   金属原子迁移 → 空洞形成
           ↓
已烧录:  电阻 > 1MΩ (开路)
```

### 3.2 Gate Oxide Anti-Fuse 物理原理

```
未烧录:  阻抗 > GΩ (栅氧完整，不导通)
           ↓
烧录:    施加高压 (~6V~8V, ~几 μs)
           ↓
击穿:    栅氧化层局部击穿 → 导电通道形成
           ↓
已烧录:  阻抗 ~ kΩ (导通)
```

### 3.3 OTP Redundancy (冗余)

```
每个 Trim Bit 有多个备份:

Bit 0:  [Main Cell] [Redundancy Cell 1] [Redundancy Cell 2]

烧录策略:
  1. 先烧 Main Cell → Verify
  2. 若 Main Cell 失败 → 烧 Redundancy 1
  3. 若仍失败 → 烧 Redundancy 2
  4. 全部失败 → Die 判废

提升良率的关键技术
```

---

## 四、各模块 Trim 详解 / Trim by Module

### 4.1 Buck — RC Ton Trim

**修调对象**: RC Timer 的时间常数
**影响参数**: Ton, Fsw, Efficiency

```
测试流程:
  ① 在固定 VIN/VOUT/IOUT 下测量 Ton 或 Fsw
  ② 目标: Ton_target = VOUT / (VIN × Fsw_target)
  ③ 实际: Ton_meas ≠ Ton_target
  ④ 计算 Trim Step:
     每个 Trim Code 改变 ~2%~4% 的 Ton
  ⑤ Code = Round((Target - Actual) / (Target × Step%))
  ⑥ 烧录 → 复测验证
```

**设计要点**:
- 通常 Trim Range: ±20%~±30% (覆盖工艺偏差)
- 通常 Step Size: 1%~3% (精度要求越高，Step 越小)
- Trim Code 位数: 3~5 bits (8~32 档)

详见: [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试|Buck Ton 与 ACT TIME 测试]]

---

### 4.2 Buck / LDO — VOUT Trim

**修调对象**: Feedback 分压电阻比例
**影响参数**: VOUT Accuracy

```
测试流程:
  ① 在额定 VIN/IOUT 下测量 VOUT
  ② 目标: VOUT_target (如 1.800V)
  ③ 实际: VOUT_meas (如 1.820V → +1.1%)
  ④ Trim 通过调整 FB 分压电阻改变反馈点参考
  ⑤ Code = Round((VOUT_meas - VOUT_target) / Step_V)
  ⑥ 烧录 → 复测
```

**两种实现方式**:

| 方式 | 原理 | 优缺点 |
|------|------|--------|
| **电阻梯形网络** | 改变 FB 电阻分压比 | 线性、面积小、DCDC 常用 |
| **Ref DAC** | 改变 Bandgap 输出 | 精度高、面积大、LDO 常用 |
| **VREF Trim** | 直接修 Bandgap | 所有模块共享、一次 Trim |

---

### 4.3 Buck — Ipeak / ILIM Trim (Current Limit Trim)

**修调对象**: 电流检测电路 (SENSE FET / Sense Resistor / DCR)
**影响参数**: OCP 阈值, Current Limit

```
测试流程:
  ① 逐步增加负载直到 OCP 触发
  ② OCP 触发点 = I_LIM_meas
  ③ Target: I_LIM_target (如 2.0A)
  ④ 调整电流检测增益
  ⑤ 烧录 → 复测
```

**注意**:
- ILIM Trim 通常和 Ton Trim 独立
- 不过温度下 ILIM 可能漂移 (Rds_on 正温度系数)
- 部分芯片 ILIM 不需要 Trim (设计余量足够)

---

### 4.4 LDO — ILIM Trim

**修调对象**: LDO 输出电流检测
**影响参数**: LDO OCP 阈值

与 Buck ILIM 类似，但 LDO 的 ILIM 通常较低 (几十 mA ~ 几百 mA)。

---

### 4.5 Charger — VREG Trim (Charge Voltage Trim)

**修调对象**: Charger CV 阶段的目标电压
**影响参数**: 充电终止电压 (VREG)

```
测试流程:
  ① 设置 VBAT = VREG_target (用 SMU Force)
  ② 充电进入 CV 阶段
  ③ 测量实际 VREG = VBAT 引脚电压
  ④ Target: VREG_target (如 4.200V ± 0.5%)
  ⑤ 调整 Bandgap 参考或反馈分压
  ⑥ 烧录 → 复测
```

**为什么 Charger VREG 精度要求很高?**
- Li-Ion 过充 → 安全问题 (爆炸/起火)
- Li-Ion 欠充 → 电池容量不足
- 典型要求: ±0.5% ~ ±1%

---

### 4.6 Charger — ICHG Trim (Charge Current Trim)

**修调对象**: Charger 电流源精度
**影响参数**: CC 阶段充电电流

与传统 Buck 的 ILIM 不同，ICHG Trim 关注 CC 阶段恒定大电流的精度。

---

### 4.7 LED Driver — Current Trim

**修调对象**: LED 电流源精度
**影响参数**: 每路 LED 电流精度、通道间匹配度

```
测试流程:
  ① 设置 LED 电流寄存器 (如 20mA)
  ② 逐路测量实际 LED 电流
  ③ 计算精度和匹配度
  ④ 调整全局电流基准 (和单路匹配)
  ⑤ 烧录 → 复测
```

---

### 4.8 Analog Core — VREF Trim (Bandgap Trim)

**修调对象**: Bandgap 参考电压
**影响参数**: 所有依赖 VREF 的参数 (VOUT, ILIM, OSC, etc.)

这是**最重要**的 Trim，因为 VREF 是所有其他模块的电压基准。

```
测试流程:
  ① 测量 VREF 引脚电压
  ② Target: VREF_target (如 1.200V)
  ③ 通过调整 Bandgap 电阻网络比例修正
  ④ 烧录 → 复测 → 确认所有模块参数同步改善
```

**VREF Trim 策略选择**:

| 策略 | 优点 | 缺点 |
|------|------|------|
| **只修 VREF** | 简单、一次搞定 | 各模块偏差独立 |
| **分模块修** | 精度最高 | 测试时间长 |
| **混合策略** | 折中 | 测试流程复杂 |

---

### 4.9 Analog Core — OSC Trim (Oscillator Frequency Trim)

**修调对象**: RC Oscillator 频率
**影响参数**: Buck/Boost Fsw, Charge Pump Fsw

```
测试流程:
  ① 测量 OSC 输出频率
  ② Target: FOSC_target (如 2.000MHz)
  ③ 调整 OSC 充电电流或电容
  ④ 烧录 → 复测
```

详见: [[30.areas/PMIC/Analog_Core/Oscillator_原理与测试|Oscillator 原理与测试]]

---

### 4.10 OVP / UVLO / OCP Threshold Trim

**修调对象**: 保护功能比较器阈值
**影响参数**: OCP 触发点、OVP 触发点、UVLO 触发点

某些精度要求高的 PMIC 会对保护阈值也做 Trim。

---

### 4.11 TC Trim (Temperature Coefficient Trim)

**修调对象**: Bandgap 的温度系数
**影响参数**: 全温范围内的 VREF 稳定性

```
高温 (125°C) 与低温 (-40°C) 下 VREF 偏差 > 规格时:
  ① 测 VREF @ -40°C (Cold)
  ② 测 VREF @ 25°C (Room)
  ③ 测 VREF @ 125°C (Hot)
  ④ 计算 TC 曲线曲率
  ⑤ 通过二阶补偿修正 (Temperature Compensation Trim)
```

---

## 五、CP Trim vs FT Trim / 策略选择

### CP-only Trim (最常用)

```
优点:
  • 晶圆阶段一次性完成，不需要 Handler
  • Trim Code 已经在封装后自动生效
  • FT 只需验证

缺点:
  • 封装应力可能略微改变参数 (通常可忽略)
  • 某些参数 CP 测不到 (大电流 ILIM 等)
```

### CP Trim + FT Trim (双阶段)

```
适用于:
  • CP 受限的参数 (大电流、高速 Timing)
  • 封装后参数漂移不可忽略
  • 高精度 Trim (如 ±0.5%)
  
流程:
  CP: Pre-Trim Measurement → 粗 Trim
  FT: 测量封装后参数 → 细调 TBEE (Trim Bit Error Estimate) → 验证
```

---

## 六、Trim Code 计算方法 / Calculation Methods

### 方法 1: 阶梯逼近 (Step Approximation)

```
已知: Step = 2%/Code, 共 5 bits (0~31 Code)
Target = 100ns, Measured = 92ns
Error = (92-100)/100 = -8%

Code = -8/2 = -4 (从中值出发)
最终 Code = Mid(16) + (-4) = 12
```

### 方法 2: 查表法 (Look-Up Table)

```
预存储 Trim Code vs 参数对应表:
  Code=0  → Ton=82ns
  Code=1  → Ton=84ns
  ...
  Code=16 → Ton=116ns
  
测量 Ton=92ns
查表: 最近 Code = 5 (Ton=92ns 最接近)
```

### 方法 3: 二分法 (Binary Search)

```
首次: 测试 Mid Code → Ton=97ns (偏小)
二分: 向上找 Mid+8 → Ton=103ns (偏大)
再二分: Mid+4 → Ton=100ns ✓
```

---

## 七、Trim 硬件与 ATE 设置 / Hardware Setup

### 7.1 烧录电压 (VPP)

```
典型 VPP: 5V~8V (Gate Oxide)
        1.8V~3.3V (E-Fuse, 低压)

ATE SMU:
  • VPP 精度: ±1%~±2% (偏差大烧录失败)
  • 电流限: ~100mA (防止意外短路)
  • Ramp rate: 控制 (太快 → 容性负载 > 限流)
```

### 7.2 烧录时序

```
硬件时序:
  VPP Enable → Wait VPP stable (~10μs)
  ↓
  Program Pulse (~1μs~10μs)
  ↓
  Wait (~5μs~10μs)
  ↓
  Verify Read
```

### 7.3 DIB 设计注意

```
Trim 通道:
  • VPP 走线: 短、宽、去耦 (低阻抗)
  • VPP 独立供电 (不与其他电源共用)
  • 避免 VPP 干扰其他通道 (Relay 隔离)
```

---

## 八、常见问题 / Common Trim Pitfalls

| 问题 | 原因 | 解决 |
|------|------|------|
| **Trim 后复测仍超规** | Trim Step 过大 | 减小 Step, 增加 Bits |
| **Trim Code 到边界** | 工艺偏差超预期 | 扩大 Trim Range |
| **烧录失败** | VPP 不足/时序不对 | 检查供电、时序 |
| **FT 读取 OTP 错误** | OTP 数据损坏 | 高温烘烤 Data Ret |
| **Trim 后参数漂移** | 封装应力 | 增加 Guard Band |
| **多模块 Trim 冲突** | VREF 一改全动 | 先修 VREF, 再修模块 |

---

## 九、Trim Guard Band / 安全余量

```
规格上限: ────────────────
          ↑ Guard Band (规格的 20%~30%)
设计目标: ────────────────  ← Trim 目标值
          ↓ Guard Band
规格下限: ────────────────
```

**为什么要 Guard Band?**
- Trim 精度有限 (Step Size 导致的残留误差)
- 温度漂移
- 长期稳定性 (Aging)
- 测试系统误差

---

## 十、Trim 类型速查表 / Quick Reference

| Trim 类型 | 所在模块 | 测量参数 | 调整方式 | 关键页面 |
|-----------|---------|---------|---------|---------|
| RC Ton Trim | Buck/Buck-Boost | Ton / Fsw | RC Timer | [[Buck_Ton与ACT_TIME测试\|Buck Ton]] |
| VOUT Trim | Buck/Boost/LDO | 输出电压 | FB R-divider | [[Buck_基本原理\|Buck]] |
| VREF Trim | Analog Core | Bandgap VREF | BG R-network | [[Bandgap_原理与测试\|Bandgap]] |
| OSC Trim | Analog Core | 振荡频率 | OSC I/C | [[Oscillator_原理与测试\|Osc]] |
| ILIM Trim | Buck/LoadSwitch | OCP 阈值 | Current Sense | [[OVP_OCP_OTP_UVLO\|Protection]] |
| VREG Trim | Charger | 充电终止电压 | CV Ref | [[Charger_原理与测试\|Charger]] |
| ICHG Trim | Charger | 充电恒流 | CC Source | [[Charger_原理与测试\|Charger]] |
| LED I Trim | LED Driver | LED 电流 | Current Sink | [[LED_Driver_原理与测试\|LED Driver]] |
| TC Trim | Bandgap | 温漂系数 | TC Comp | [[Bandgap_原理与测试\|Bandgap]] |
| OTP Read Verify | All | OTP 数据 | — | [[OTP_EFUSE_Trim\|OTP/EFUSE]] |

---

## 参考资料

- [[30.areas/PMIC/Digital_Interface/OTP_EFUSE_Trim|OTP/EFUSE/Trim 测试]] — 存储技术和烧录细节
- [[30.areas/PMIC/Digital_Interface/I2C_SPI_测试|I2C/SPI 测试]] — OTP 读写接口
- [[30.areas/PMIC/Common/FT|FT 测试完整指南]] — FT Trim 验证
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
