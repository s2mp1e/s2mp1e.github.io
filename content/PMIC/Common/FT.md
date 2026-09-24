---
title: "FT 测试完整指南"
tags:
  - pmic
  - ft
  - final-test
  - ate
  - reference
created: 2026-07-18
---

# FT 测试完整指南 / Final Test Complete Guide

> FT (Final Test / 成品测试) 是芯片封装的最后一道质量关口。本章节涵盖 PMIC FT 的完整测试流程、硬件方案、测试项目、Bin 策略和数据方法。

---

## 一、什么是 FT？ / What is FT?

FT 在芯片**封装完成 (Singulated & Packaged)** 后进行，通过 ATE + Handler 自动完成每颗芯片的全参数测试。

### CP vs FT 对比

| 维度 | CP (Chip Probing) | FT (Final Test) |
|------|-------------------|-----------------|
| **被测对象** | 晶圆上的裸 Die | 封装好的成品 IC |
| **接触方式** | 探针卡 (Probe Card) | Socket + Handler |
| **电流能力** | 受限 (探针电阻/电感) | 大电流 OK (焊接/弹片接触) |
| **可测温度** | 25°C, Hot (80~110°C) | -40°C, 25°C, 85°C~150°C |
| **测试重点** | DC, Trim, 基础功能 | 全参数 AC/DC/Timing/Protection |
| **Throughput** | 低速 (机械探针) | 高速 (Handler 自动化) |
| **Burn-in 关联** | 无 (Die 无法 Burn-in) | BI 后 FT (高可靠性芯片) |
| **Bin 动作** | 墨点标记 + 地图记录 | Handler 分 Bin |
| **测试时间约束** | 较宽松 | 严格 (成本驱动) |

---

## 二、FT 硬件架构 / FT Hardware

```
┌────────────────────────────────────────┐
│  ATE Tester (UltraFLEX/V93000/etc.)    │
│  [SMU] [Digitizer] [TMU] [Digital]     │
──── Cable / Pogo Tower ──────────────────│
│  Performance Board (PB) / DIB          │
│  ┌─────────────────────────────────┐   │
│  │ Decoupling Caps / Relay Matrix ││   │
│  │ ┌──────────────┐               ││   │
│  │ │ DUT Socket   │               ││   │
│  │ │  ┌───┐       │               ││   │
│  │ │  │DUT│       │               ││   │
│  │ │  └───┘       │               ││   │
│  │ └──────────────┘               ││   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Handler (Plunger/Placer/Rotary)       │
│  [Input Tray] → [Soak/Hot/Cold] →      │
│  [Test Site] → [Bin Out]              │
└────────────────────────────────────────┘
```

### 2.1 Handler 类型

| 类型 | 原理 | 速度 (UPH) | PMC 适用场景 |
|------|------|:----------:|------------|
| **Pick & Place** | 机械臂拾放 | 2000~8000 | 小型封装 (QFN/WLCSP) |
| **Gravity** | 重力下滑 | 10000~40000 | DIP/SOP 等插件 |
| **Turret** | 旋转塔 | 30000~80000 | 超高速，小型封装 |
| **Strip** | 排测 / 并测 | 极高 (并测) | QFN Strip, 多 Site |

### 2.2 Socket 类型

| 类型 | 特点 | 适用 |
|------|------|------|
| **Pogo Pin Socket** | 弹簧针、可更换 | QFN/QFP |
| **Elastomer Socket** | 导电橡胶、低电感 | WLCSP/BGA |
| **Kelvin Socket** | 4-Wire 到引脚 | 大电流需要 |
| **Open-Top Socket** | Handler 直接接触 | 量产主流 |

---

## 三、FT 测试流程 / FT Test Flow

### 3.1 完整流程图

```
Handler Input
    ↓
Temp Soak (温控平衡: Cold/25°C/Hot)
    ↓
┌── Socket Insert ──┐
│   ↓               │
│ ① Continuity       │  开短路测试 (所有引脚)
│   ↓               │
│ ② Leakage          │  漏电流测试 (输入/输出引脚)
│   ↓               │
│ ③ OTP Readback     │  读回 OTP Trim Code
│   ↓               │
│ ④ Power-On / SRAM  │  上电、加载寄存器默认值
│   ↓               │
│ ⑤ Digital I/F      │  I2C/SPI 读写验证
│   ↓               │
│ ⑥ DC Static        │  VOUT, Iq, Isd, Load/Line Reg
│   ↓               │
│ ⑦ Timing           │  Fsw, Ton, Startup, Dead Time
│   ↓               │
│ ⑧ Dynamic          │  Load Transient, Ripple
│   ↓               │
│ ⑨ Protection       │  OCP, SCP, OVP, UVLO, OTP func
│   ↓               │
│ ⑩ Efficiency       │  Spot Check (1~3 点)
│   ↓               │
│ ⑪ Trim Verify       │  验证 Trim 生效 (关键参数)
│   ↓               │
│ ⑫ Functional       │  系统级功能 (Sequencing, Mode)
│   ↓               │
│ Bin Decision       │
│   ↓               │
└── Socket Eject ────┘
    ↓
Handler Bin Out
```

### 3.2 测试顺序设计原则

| 原则 | 说明 |
|------|------|
| **Fail-Fast** | Continuity > Leakage > Power-On → 快速筛掉坏品 |
| **低成本优先** | DC 在 Timing 前 (DC 测试时间短) |
| **依赖前置** | OTP Readback 必须在所有参数测试前 |
| **状态独立** | 每项测试后恢复默认状态 |
| **Bin 分级** | 致命缺陷 → Bin1/2/3; 参数偏差 → Bin4 |

---

## 四、FT 测试项详解 / Test Items by Category

### 4.1 Continuity Test / 开短路测试

**目的**: 确认封装引脚没有开路或短路。

```
方法: Force Current → Measure Voltage (FIMV)

测试:
  ① 每根引脚 Force 100μA → 测电压
  ② 电压 ≈ 0.7V (封装的 ESD 保护二极管)
  ③ 若电压 ~0V → 引脚短路到地
  ④ 若电压 ~Clamp → 引脚开路
  ⑤ GND 引脚再单独验证 (Force -100μA)

Pass Limit: 0.3V < V_pin < 1.5V (典型值，取决于 ESD 结构)
```

### 4.2 Leakage Test / 漏电流测试

**目的**: 确认输入/输出引脚在高阻态下的漏电流在规格内。

```
方法:
  ① 输入引脚: Force VIN_max → Measure IIN
  ② 输出引脚: Force VOUT_max → Measure IOUT
  ③ 高阻态 / 关断状态下测量

典型 Limit: Ileak < 1μA (高可靠性 < 100nA)
```

### 4.3 OTP Readback / Trim Code 加载

**目的**: 确认 OTP Trim Code 正确加载。

```
流程:
  ① 芯片上电 (POR)
  ② 读取 OTP 区域寄存器 (通过 I2C/SPI 或 Test Mode)
  ③ 验证:
     - 已烧录: Trim Code ≠ 0x00 / ≠ 0xFF
     - 校验和: OTP 校验正确
     - Redundancy: 主位和冗余位逻辑正确
  ④ 确认 Trim Code 加载到的目标寄存器
```

详见: [[30.areas/PMIC/Common/Trim|PMIC Trim 完整指南]]

### 4.4 DC Static Tests

#### VOUT Accuracy

```
每个电源轨 (Buck1/2/3, LDO1/2, etc.):

条件:
  VIN = Nominal
  IOUT = 中载 (如 50% of max)
  
测量: VOUT

判断: VOUT_target ± 2% (Trim 后 ± 0.5%~±1%)
```

#### Quiescent Current (Iq)

```
条件:
  所有模块使能、空载
  PWM mode / PSM mode 分别测

测量: IIN_total

注意:
  • 不同模式下 Iq 不同 (PWM vs PSM)
  • 需要高精度 SMU (μA 级别)
```

#### Shutdown Current (Isd)

```
条件:
  EN = LOW (芯片完全关断)
  VIN = Max (最大输入电压)

测量: IIN

判断: Isd < 1μA (典型)
```

#### Load Regulation

```
条件: VIN固定, IOUT从0→100%调
测量: VOUT_MAX - VOUT_MIN
判断: ΔVOUT < 1% ~ 3%
```

#### Line Regulation

```
条件: IOUT固定, VIN从MIN→MAX调
测量: VOUT_MAX - VOUT_MIN
判断: ΔVOUT < 0.5%/V
```

### 4.5 Timing Tests

#### Switching Frequency (Fsw)

```
每个 Buck/Boost:
条件: 额定 VIN/VOUT/IOUT
测量: 用 TMU 测量 SW 波形周期
判断: Fsw_target ± 10% (Trim 后 ± 5%)
```

#### Ton / Duty Cycle

```
条件: 同上
测量: SW 脉冲宽度 (TMU)
判断: 对应 Fsw 计算的目标 Duty
```

详见: [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试|Buck Ton 与 ACT TIME 测试]]

#### Startup Time (ACT TIME)

```
条件: EN=LOW → HIGH, 监测 VOUT
测量: EN 上升沿 → VOUT 达到 90% 的时间
判断: < ACT_TIME_MAX
```

#### Dead Time

```
条件: 正常开关
测量: HS Gate ↓ → LS Gate ↑ 之间的时间
判断: 不能为 0 (直通保护), 不能太大 (效率低)
```

#### PG Delay

```
条件: EN 上升
测量: PG 上升沿相对于 VOUT 建立后的延迟
```

### 4.6 Dynamic Tests

#### Load Transient (可选的 FT 测项)

```
条件: IOUT 从 10% → 90% 跳变 (Handler 内置电子负载)
测量: VOUT 过冲幅度、恢复时间

量产 FT 中可能不测全 Load Transient (耗时长)
→ 只在 Sample Level 或 QA Gate 测
```

#### Output Ripple

```
条件: 额定负载
测量: AC 耦合测量 VOUT 纹波 (mVpp)
判断: Ripple < Spec (如 30mVpp)
```

### 4.7 Protection Tests

在 FT 中保护功能**全部测试** (CP 阶段通常不测)：

#### OCP Test

```
条件: 逐步增加负载电流
触发: IOUT > OCP_TH → VOUT 下降/限流
判断: OCP 触发点在规格内

循环: 撤掉过载 → 确认恢复 (Hiccup/Auto-Recovery)
```

#### SCP Test

```
条件: 通过 Relay 将 VOUT 直接短路
触发: 短路电流 < SCP_TH
判断: 芯片进入安全模式

循环: 短路移除 → 确认恢复
```

#### OVP Test

```
条件: 通过 SMU 强行抬高 VOUT 电压
触发: VOUT > OVP_TH → HS 关断
判断: OVP 触发电压在规格内
```

#### UVLO Test

```
条件: VIN 从高到低 Sweep
触发: VIN < UVLO_TH → 芯片关断
判断: UVLO 阈值和迟滞在规格内
```

#### OTP Functional Test

```
FT 中通常只测 OTP 功能 (PASS/FAIL), 不测精确阈值

方法:
  ① 芯片正常工作
  ② 热板/风枪加热芯片
  ③ OTP 触发 → 芯片关断
  ④ 冷却 → 自动恢复
```

#### PG Test

```
条件: 所有 Rails 正常
测量: PG 引脚高电平

单路故障时 PG 低电平 (AND logic)
```

详见: [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能测试详述]]

### 4.8 Digital Interface Tests

#### I2C / SPI Protocol

```
条件: 连接数字接口
测试:
  ① I2C: Slave Addr 验证
  ② I2C: 关键寄存器 Write/Read
  ③ SPI: Mode (CPOL/CPHA) 验证
  ④ SPI: 关键寄存器 Write/Read

全地址 R/W: 遍历所有寄存器确认功能
```

详见: [[30.areas/PMIC/Digital_Interface/I2C_SPI_测试|I2C/SPI 接口测试]]

#### OTP Read Verify

```
条件: 上电后自动加载 OTP
测试:
  ① 读回 OTP 区域所有位
  ② 确认 Trim Code 正确
  ③ 确认 OTP 数据完整性 (Checksum)
```

### 4.9 Efficiency Spot Check

```
条件: 典型负载点 (如 25%, 50%, 100%)
计算: Eff = (VOUT × IOUT) / (VIN × IIN) × 100%
判断: > 效率下限

FT 通常只测 1~3 个典型点而非全负载曲线
```

### 4.10 Trim Verification

```
FT 必须验证 Trim 生效:

① VREF Trim → 读 VREF/测 VOUT
② OSC Trim → 测 Fsw
③ Ton Trim → 测 Ton
④ VOUT Trim → 测 VOUT
⑤ ILIM Trim → 测 OCP 点
⑥ Charger Trim → 测 VREG/ICHG

若 Trim 验证失败 → 无法通过 FT (潜在 Bin 分级)
```

### 4.11 Functional Test

```
完整系统级功能验证:

① Power-Up Sequence 验证
   - 各 Rail 上电时序是否合规
② Mode Switching
   - PWM ↔ PSM ↔ PFM 切换是否正常
③ Multi-Rail Interaction
   - 交叉影响在规格内
④ Fault Handling
   - OCP/OVP 后各 Rail 行为
```

---

## 五、FT Bin 策略 / Bin Strategy

```
┌────────┐
│ Input  │  所有封装好的 IC
└───┬────┘
    ↓
┌───────────────┐
│ FT Test Flow  │
└───┬───────────┘
    ↓
    ├── Bin 1 (Good)              → 出货 / 编带
    ├── Bin 2 (Retest Fail)       → 复测
    ├── Bin 3 (Parametric Fail)   → QA 分析/降级销售
    ├── Bin 4 (Hard Fail)         → 报废
    ├── Bin 5 (Leakage/Cont)      → 封装问题
    ├── Bin 6 (Protection Fail)   → 设计/工艺问题
    ├── Bin 7 (Trim Fail)         → CP 或烧录问题
    └── Bin 8 (QA Sample)         → 抽检 (QA Gate)
```

### Bin 命名惯例

| Bin | 含义 | 后续处理 |
|:---:|------|---------|
| **Bin 1** | 良品 | 编带出货 |
| **Bin 2~3** | 重测品 | 再次 FT (排除接触/偶然问题) |
| **Bin 4+** | 不良品 | 分析/报废 |
| **Bin N (QA)** | QA 抽检 | 第三方复测或更严格测试 |

---

## 六、三温 FT / Triple Temp FT

### 6.1 三温测试策略

| 温度 | 典型值 | 测试重点 | Handler 方式 |
|------|--------|---------|-------------|
| **Cold** | -40°C / 0°C | 低温启动、低温参数偏移 | Cold Handler / LN2 |
| **Room** | 25°C | 基准参数、Trim Verify | Ambient Handler |
| **Hot** | 85°C / 125°C | 高温参数、OTP、Q100 | Hot Handler |

### 6.2 三温实现方式

```
方式 A (最常用): 分站式
  Handler 1 (Cold) → Test → Handler 2 (Room) → Test → Handler 3 (Hot) → Test
  
方式 B: 单机循环
  一台 ATE + Handler, 循环切换温度 (速度慢)

方式 C: 只测两温
  Room + Hot, Cold 只做 Sample
```

### 6.3 全温参数 Trim (3-Temp Trim)

```
对于高精度 PMIC:
  • CP 在 25°C 完成基础 Trim
  • FT 在 Hot/Cold 下测量参数漂移
  • 平均误差: Code @ 25°C 可能不是最优 @ Hot/Cold
  • 可能需要在 CP 同时考虑全温优化
```

---

## 七、FT 测试时间优化 / Test Time Optimization

### 7.1 优化策略

| 策略 | 说明 | 收益 |
|------|------|------|
| **Parallel Test** | 多路电源同时测 DC | 50%~70% 节省 |
| **Scan Mode** | 多 Rail 轮流快速采样 | 30%~40% 节省 |
| **Spot Check** | 效率、谐波等只测少量点 | 10%~20% 节省 |
| **Adaptive Test** | 通过则跳过后续详细测试 | 视良率而定 |
| **Site Parallel** | 多 Site 同时测 | 线性提升 |
| **Relay Optimization** | 减少 Relay 切换时间 | 5%~10% 节省 |

### 7.2 典型 FT 时间分配

```
PMIC (4 Buck + 4 LDO + Charger) FT 时间预估:

Continuity/Leakage:    200ms    (5%)
Power-On + OTP Read:   300ms    (8%)
Digital I/F:           400ms    (10%)
DC Tests (all rails):  800ms    (20%)
Timing Tests:          600ms    (15%)
Protection Tests:      600ms    (15%)
Dynamic:               300ms    (8%)
Efficiency:            300ms    (8%)
Trim Verify:           200ms    (5%)
Functional:            250ms    (6%)
─────────────────────────────────
Total:               ~4.0s / DUT
```

---

## 八、FT DIB 设计关键 / FT DIB Design

### 8.1 Kelvin Connection (4-Wire)

```
Force 线: 大电流供电 (不测电压)
Sense 线: 高阻测量 (不通过大电流)

原理:
  大电流在 Force 线上产生压降
  Sense 线直接从引脚端测量 (不流过电流)
  → 消除线阻压降对测量的影响
  
PMIC 中所有 VOUT 测量和 ILIM 测试都需要 Kelvin
```

### 8.2 Relay Matrix

```
场景: PMIC 有 10+ 路输出, ATE SMU 只有 4 路

Relay Matrix:
  10路 DUT 输出 → 4路 SMU
  通过 Relay 切换, 分时测量

设计要点:
  • 每次切换后等待稳定 (几 ms)
  • Relay 数量 × 切换次数 = 测试时间
  • 控制信号的 Relay 避免引入噪声
```

### 8.3 电源去耦

```
典型 DIB 去耦方案:

VIN 引脚:
  10μF (Bulk) + 1μF (Ceramic) + 0.1μF (HF) 
  → 放置在离 DUT Socket 尽可能近的地方

VOUT 引脚:
  1μF + 0.1μF (近 Socket)
  → 也可以利用芯片外部推荐电容值

去耦不良的后果:
  • 纹波测量不准确
  • 开关噪声干扰其他测试
  • 不稳定/振荡 (LDO)
```

### 8.4 特殊考虑: PMIC 大电流供电

```
For PMIC with BUCK @ 5A:

VIN 走线: 至少 2oz 铜皮 + 多层并联
Socket 端子: 至少 2 pins 并联 (电流分摊)
Connector: 使用 Power 专用连接器

连续大电流测试时:
  DIB 温度上升 → 电阻增加 → 测量漂移
  需要散热设计 (加散热片, 风冷)
```

---

## 九、FT 数据与质量管理 / Data & Quality

### 9.1 关键数据指标

| 指标 | 公式 | 目标 |
|------|------|------|
| **Yield** | Good / Total × 100% | > 95% |
| **Retest Rate** | Retested / Total | < 5% |
| **Cpk** | (USL-μ)/(3σ) 或 (μ-LSL)/(3σ) | > 1.33 |
| **First Pass Yield** | 一次过 FT 的比例 | > 90% |

### 9.2 SBL (Statistical Bin Limit) / PBL

```
SBL: 基于统计分布的 Bin 判断
  → 参数需在 Mean ± K × σ 内
  → 动态调整 Spec Limit (不适用固定 Limit 的产线)

PBL (Part Average Test):
  → 对参数进行 Part Average 判断
  → 检测异常离群值 (Outlier)
```

### 9.3 QA Gate

```
FT Line 最后一步:
  从 Bin 1 (Good) 中抽样 (如 200/ Lot)
  → 在这批抽样上运行 QA Test Program
  → QA Program 通常比 Production 更严格 (更多测点)
  → 若 QA Gate Fail → Lot Hold → 分析
```

---

## 十、常见 FT 问题 / Common FT Issues

| 问题 | 可能原因 | 调查方向 |
|------|---------|---------|
| **Continuity Fail (高失效率)** | Socket 接触不良 | 检查 Socket 清洁/Pin 状态 |
| **Yield 突变** | Wafer Lot 变异 / 测试漂移 | Lot 追踪、Golden Unit 验证 |
| **OTP Read Fail (一定比例)** | 烧录问题 | 复测、检查 OTP 完整性 |
| **I2C/SPI Fail** | 通信时序 / Socket 阻抗 | 检查 SCK/SCL 波形 |
| **VOUT 偏高/偏低** | Trim Issue | 检查 VREF Trim |
| **Fsw 偏差** | OSC Trim Issue | 检查 OSC Trim |
| **高温 FT Yield 低** | 热问题 / 参数 TC | 分析高温参数偏移 |
| **Retest Rate 高** | 接触问题 / 测试边界 | 检查 Socket 设计/测试 Limit |
| **多 Site 间 Yield 差异** | DIB Site 不均衡 | 各 Site 交叉验证 |

---

## 参考资料

- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]] — ATE 平台和资源
- [[30.areas/PMIC/Common/时序测试|时序测试方法]] — Timing 测量原理
- [[30.areas/PMIC/Common/Trim|PMIC Trim 完整指南]] — Trim 全流程
- [[30.areas/PMIC/Buck/Buck_测试项目总览|Buck 测试项目总览]] — Buck 完整测试清单
- [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO|保护功能测试详述]] — 保护测试方法
- [[30.areas/PMIC/PMU/PMU_架构与测试|PMU 架构与测试]] — 多路 PMU FT 策略
- [[30.areas/PMIC/Thermal/Thermal_原理与测试|Thermal 热管理]] — 三温策略
