---
title: "LDO 低压差线性稳压器修调"
tags:
  - pmic
  - ldo
  - trim
  - ate
  - calibration
  - knowledge-base
created: 2026-07-24
---

# LDO 低压差线性稳压器修调 / LDO Trim & Calibration

> LDO (Low Dropout Regulator) 的修调是 PMIC 量产测试中的核心环节。由于工艺偏差导致反馈电阻绝对值、误差放大器 (Error Amplifier, EA) 失调电压、基准电压 (VREF) 等参数偏离设计值，必须通过 Trim 将输出电压调整到规格范围内。本章深入讲解 LDO Normal 模式与 Eco 模式输出电压修调的原理、测试方法及工程注意事项。

---

## 目录

1. [LDO 基本架构与工作原理](#一ldo-基本架构与工作原理)
2. [LDO Normal 电压输出修调](#二ldo-normal-电压输出修调)
3. [LDO Eco 电压输出修调](#三ldo-eco-电压输出修调)
4. [LDO 修调策略与工程考量](#四ldo-修调策略与工程考量)
5. [常见问题与调试指南](#五常见问题与调试指南)

---

## 一、LDO 基本架构与工作原理

### 1.1 核心架构 / Core Architecture

一个典型的 PMIC 片上 LDO 包含以下关键模块：

```
                        ┌──────────┐
VIN ──┬────────────────┤ Pass FET ├────┬── VOUT
       │                │ (PMOS)   │    │
       │                └─────┬────┘    │
       │                      │         │
       │               ┌──────┴──────┐  │
       │               │   Error     │  │
       │               │ Amplifier   │  │
       │               └──────┬──────┘  │
       │                      │         │
       │                 ┌────┴────┐    │
       │                 │  VREF   │    │
       │                 └─────────┘    │
       │                     R1         │
       │                ┌───[===]───┬───┘
       │                │           │
       │                │    R2     │
       │                └───[===]───┴──── GND
       │                     │
       │                     FB (Feedback Node)
       └─────────────────────┘
```

### 1.2 稳压原理 / Regulation Principle

LDO 通过负反馈环路实现稳压：

**输出电压公式：**

$$
V_{OUT} = V_{REF} \times \left(1 + \frac{R_1}{R_2}\right)
$$

其中：
- **VREF**: 带隙基准 (Bandgap) 产生的参考电压，典型值 0.6V ~ 1.2V
- **R1/R2**: 反馈分压电阻网络，决定输出电压的比例
- **Pass FET**: 调整管 (通常为 PMOS)，工作在线性区作为压控电阻

**反馈环路工作过程：**

1. FB 节点电压与 VREF 在误差放大器输入端比较
2. 若 VOUT 下降 → FB 电压下降 → EA 输出降低 → PMOS 栅极电压降低 → PMOS 导通增强 → VOUT 回升
3. 若 VOUT 上升 → FB 电压上升 → EA 输出升高 → PMOS 栅极电压升高 → PMOS 导通减弱 → VOUT 回落
4. 系统在 FB = VREF 时达到稳态平衡

### 1.3 Normal 模式 vs Eco 模式 / Normal vs Eco Mode

| 特性 | Normal 模式 | Eco 模式 |
|------|-----------|---------|
| **偏置电流 (Bias Current)** | 高 (几 μA ~ 几十 μA) | 低 (几百 nA ~ 几 μA) |
| **EA 增益** | 高 (60dB ~ 80dB) | 低 (40dB ~ 60dB) |
| **PSRR** | 高 (50dB ~ 80dB @ 1kHz) | 低 (20dB ~ 40dB @ 1kHz) |
| **负载调整率** | 优 (< 0.5%/A) | 一般 (1%~2%/A) |
| **瞬态响应** | 快 | 慢 |
| **静态电流 (Iq)** | 高 | 低 |
| **应用场景** | 性能敏感负载 (RF, PLL, Sensor) | 低功耗待机 (RTC, Sleep IO) |

### 1.4 为什么要修调 / Why Trim LDO?

**工艺偏差来源：**

| 偏差来源 | 典型偏差量 | 对 VOUT 的影响 |
|---------|-----------|---------------|
| **R1/R2 电阻绝对值偏差** | ±15%~±20% | 比例匹配好，但绝对值偏差影响... |
| **R1/R2 比例匹配偏差** | ±0.5%~±2% | 直接影响 VOUT 精度 ← **主要影响** |
| **VREF Bandgap 偏差** | ±2%~±5% | 所有 LDO 输出同向偏移 |
| **EA 输入失调 Vos** | ±1mV~±10mV | 等效为 VREF 误差，影响 VOUT |
| **EA 有限增益误差** | 增益不足导致稳态误差 | 通常 < 0.1%，可忽略 |

**关键洞察：** 即使 R1/R2 比例匹配良好，VREF 的绝对偏差和 EA 的失调电压也会导致 VOUT 偏离目标值。因此 Trim 是不可或缺的步骤。

---

## 二、LDO Normal 电压输出修调

### 2.1 原理 / Principle

#### 2.1.1 Trim 实现方式

Normal 模式 VOUT Trim 通常通过以下几种方式实现：

**方式 A：FB 分压电阻网络修调 (最常见)**

```
                          ┌─── R1a ───┐
                          │           │
                    ┌─────┤  R1b      ├───── Switch Mux
                    │     │  ...      │
                    │     └───────────┘
FB ────────────┬───┤
               │   │     ┌─── R2a ───┐
               │   └─────┤  R2b      ├───── Switch Mux
               │         │  ...      │
               │         └───────────┘
              GND
```

- 通过开关选择不同的 R1/R2 支路，改变分压比
- 每步改变量通常为 0.5%~2% 的 VOUT
- Trim Range: ±5%~±15%
- Trim Code 位数: 3~6 bits (8~64 档)

**方式 B：VREF DAC 修调**

```
Bandgap ──► DAC ──► EA(+) Reference
               ▲
               │
            Trim Code
```

- 直接调整送入 EA 正端的参考电压
- 精度更高，但面积更大
- 通常用于多路 LDO 共享一个 VREF DAC 的场景

**方式 C：VREF 全局修调 + LDO 独立精修**

- 先修全局 Bandgap VREF（影响所有 LDO）
- 再对每路 LDO 独立细调 FB 分压比
- 混合策略，兼顾效率和精度

#### 2.1.2 Trim 的物理本质

从电路角度，Trim 是通过改变以下等式中的某个变量来调整 VOUT：

$$
V_{OUT} = V_{REF} \times \left(1 + \frac{R_1}{R_2}\right)
$$

- **修 R1/R2 比例** → 改变括号内的增益因子
- **修 VREF** → 改变基准电压本身
- **修 EA 输入偏移** → 在 EA 输入端叠加一个可调偏移电压（较少见）

### 2.2 测试方法 / Test Method

#### 2.2.1 标准 Normal 模式 Trim 流程

```
┌───────────────────────────────────────────────────────────────┐
│  LDO Normal 模式 Trim 流程                                    │
│                                                               │
│  Step 1: 上电配置                                             │
│    ├─ VIN = VOUT_NOM + VDO_margin (通常 VOUT_NOM + 0.3V~0.5V) │
│    ├─ LDO 使能，设置输出电压寄存器到目标 VOUT                   │
│    └─ 强制 LDO 进入 Normal 模式                                │
│                                                               │
│  Step 2: 施加负载                                             │
│    ├─ 连接电子负载: ILOAD = I_TRIM (通常 10mA)                 │
│    └─ 等待 VOUT 稳定 (等待时间取决于缓起时间和环路建立时间)      │
│                                                               │
│  Step 3: 测量 VOUT                                            │
│    ├─ 用 SMU/ADC 测量 VOUT 引脚电压                            │
│    ├─ 记录: VOUT_meas @ Trim_Code = Default                   │
│    └─ 判断: VOUT_meas 是否在目标范围内                         │
│                                                               │
│  Step 4: 计算 Trim Code                                       │
│    ├─ Error = VOUT_meas - VOUT_target                         │
│    ├─ 已知 Step_Size (mV/Code)                                │
│    ├─ Code_Delta = Round(Error / Step_Size)                   │
│    └─ Final_Code = Default_Code + Code_Delta                  │
│                                                               │
│  Step 5: 烧录 / 验证                                          │
│    ├─ 写入 Final_Code 到 Trim 寄存器 (OTP Program 或寄存器测试) │
│    ├─ 芯片复位/重新加载 Trim Code                              │
│    └─ 复测 VOUT → 确认在目标范围内 (Post-Trim Verify)           │
└───────────────────────────────────────────────────────────────┘
```

#### 2.2.2 Trim Code 搜索策略

**策略 A：单点测量 + 线性计算 (最常用)**

```
已知: Step_Size = 10mV/Code, VOUT_target = 1.800V
实测: VOUT_meas = 1.825V (Trim_Code = 16, Mid-Code)
误差: Error = 1.825 - 1.800 = +25mV
需要: Code_Delta = 25mV / 10mV = 2.5 ≈ 3 (向减小方向)
最终: Final_Code = 16 - 3 = 13

注意：Step_Size 的非线性可能导致一次计算不够精确，
     需要迭代 1~2 次验证后微调
```

**策略 B：多点扫描 + 最佳值选取**

```
1. 遍历所有 Trim Code (或部分子集)
2. 对每个 Code 测量 VOUT
3. 选取 VOUT 最接近 VOUT_target 的 Code
4. 优势: 可发现非线性段，选择最佳 Code
5. 劣势: 测试时间更长

适用场景: 高精度 LDO (精度要求 < ±1%)、Trim Step 非线性严重
```

**策略 C：二分法搜索**

```
1. 测量 Mid-Code → VOUT 偏大
2. 测量 Mid - N/4 → VOUT 偏小  
3. 测量 Mid - N/8 → VOUT ≈ Target ✓
4. 总共只需 log2(N) 次迭代

优势: 测试时间短
劣势: 需要 Trim Step 单调性保证
```

#### 2.2.3 关键测试条件

| 参数 | 建议值 | 说明 |
|------|-------|------|
| VIN | VOUT_NOM + 0.3V~0.5V | 保证 Pass FET 在线性区，同时不过压 |
| ILOAD | 10mA (或轻载) | 轻载条件下 VOUT 最接近空载值（无 IR Drop 影响） |
| 温度 | 25°C (室温) | 基准测试条件，温度影响单独验证 |
| 测量精度 | ±0.05% 量程以上 | VOUT 精度通常要求 ±1%~±2%，测量系统需有 10× 裕量 |
| 稳定等待时间 | > 100μs | 确保 LDO 环路建立稳定，缓起 (Soft Start) 完成 |

### 2.3 注意事项 / Important Notes

1. **负载电流设定：** Trim 时负载电流必须在规格书中明确指定。不同负载下 VOUT 不同（Load Regulation），同一颗芯片在不同负载下测得的 VOUT 差异可达 0.5%~2%。

2. **VIN 电压选择：** VIN 必须高于 VOUT + VDO_min，保证 LDO 正常工作；但 VIN 过高会导致 Pass FET 上的压降过大，芯片功耗增加，自热效应 (Self-Heating) 可能改变 VOUT。

3. **Trim Code 单调性验证：** 在量产前需确认 Trim Code 与 VOUT 的关系是单调的（Monotonic）。非单调的 Trim Step 会导致搜索算法失效，甚至无法收敛到目标范围内。

4. **电阻网络非线性：** 在 Trim Range 的边界处，由于电阻开关的导通电阻 (Ron) 和寄生效应，Step_Size 可能偏离设计值。建议在中段使用线性近似，边界处增加 Guard Band。

5. **EA Offset 影响分离：** VOUT 偏差通常是 VREF 偏差 + R 比例偏差 + EA Offset 的综合结果。如果多路 LDO 同向偏差，优先怀疑 VREF 全局偏差；如果单路 LDO 偏差与其他路不同向，优先怀疑该路 FB 分压或 EA 失调。

6. **寄存器写入验证：** 对于 OTP 修调，在烧录前需要通过寄存器写入临时验证 Trim Code 是否正确，确认后再烧录 OTP。

---

## 三、LDO Eco 电压输出修调

### 3.1 原理 / Principle

#### 3.1.1 Eco 模式 VOUT 偏移的根源

Eco 模式（低功耗模式）与 Normal 模式之间的 VOUT 偏差主要来自以下因素：

**因素 1：EA 偏置电流降低**

```
Normal 模式:  EA Bias = 5μA  →  Gain = 80dB, Vos = ±1mV
Eco 模式:     EA Bias = 200nA →  Gain = 50dB, Vos = ±5mV
```

- 偏置电流降低 → EA 输入对管的 gm 下降 → 增益下降 → 环路增益降低
- 有限增益导致稳态误差：VOUT 偏离理想值
- 失调电压 Vos 增大：由于输入对管匹配程度在低偏置下变差

**因素 2：反馈网络负载效应**

- 正常模式下，EA 输出级驱动能力充足，反馈网络的分流电流影响可忽略
- Eco 模式下，EA 输出级驱动能力降低，R1/R2 网络的电流抽取可能改变环路工作点

**因素 3：参考缓冲器偏移**

- 部分 LDO 设计中，VREF 通过一个缓冲器 (Buffer) 送入 EA
- Eco 模式下 Buffer 偏置降低，其输出偏移可能发生变化

**因素 4：Pass FET 栅极驱动强度**

- Normal 模式下 Pass FET 栅极驱动强，VGS 可快速调整
- Eco 模式下栅极驱动弱，VGS 建立精度下降

#### 3.1.2 两种模式 VOUT 差异示例

```
实测数据示例（同一芯片，不同模式）:

Normal 模式: VOUT = 1.800V (Trim Code = 16, Mid-Code)
Eco 模式:   VOUT = 1.788V (同 Trim Code)

差异: ΔVOUT = -12mV (-0.67%)

原因: Eco 模式下 EA 增益降低 → 有限增益误差增大
      Vos 偏移 → 等效 VREF 变化
```

#### 3.1.3 Eco Trim 的两种场景

| 场景 | 设计类型 | Trim 策略 | 复杂度 |
|------|---------|----------|--------|
| **共享 Trim** | Normal/Eco 共用同一组 FB 电阻 | 仅修 Normal，Eco 由设计保证在规格内 | 低 |
| **独立 Trim** | Normal/Eco 有独立的 Trim 寄存器 | 分别测量、分别计算、分别烧录 | 高 |

### 3.2 测试方法 / Test Method

#### 3.2.1 标准 Eco 模式 Trim 流程

```
┌───────────────────────────────────────────────────────────────┐
│  LDO Eco 模式 Trim 流程                                       │
│                                                               │
│  Step 1: 上电配置                                             │
│    ├─ VIN = VOUT_NOM + VDO_margin (与 Normal 模式一致)         │
│    ├─ LDO 使能，设置输出电压寄存器到目标 VOUT                   │
│    └─ 强制 LDO 进入 Eco/Low-Power 模式（通过寄存器配置）         │
│                                                               │
│  Step 2: 施加负载                                             │
│    ├─ 连接电子负载: ILOAD = I_ECO_TRIM (通常 1mA，轻载)         │
│    └─ 等待 VOUT 稳定 (Eco 模式环路响应更慢，需更长等待时间)      │
│                                                               │
│  Step 3: 测量 VOUT                                            │
│    ├─ 用 SMU/ADC 测量 VOUT 引脚电压                            │
│    └─ 记录: VOUT_eco_meas @ 当前 Trim Code                     │
│                                                               │
│  Step 4: 计算 Trim Code                                       │
│    ├─ Error_eco = VOUT_eco_meas - VOUT_target                 │
│    ├─ 使用该模式的 Step_Size (可能与 Normal 模式不同)           │
│    └─ Final_Code_eco = Current_Code + Code_Delta              │
│                                                               │
│  Step 5: 交叉验证                                             │
│    ├─ 切换回 Normal 模式，验证 VOUT_nor 仍在规格内              │
│    └─ 如果 Normal 模式被 Eco Trim 影响，需要折中或迭代          │
│                                                               │
│  Step 6: 烧录 / 验证                                          │
│    ├─ 写入 Eco Trim Code（可能为独立寄存器或共用寄存器）         │
│    └─ 复测 Eco 和 Normal 模式的 VOUT                           │
└───────────────────────────────────────────────────────────────┘
```

#### 3.2.2 共享 Trim 场景的折中方法

当 Normal 和 Eco 共用同一组 Trim 寄存器时，需要找到两个模式都能接受的 Trim Code：

**方法 1：中心化折中**

```
Normal 模式 Trim 结果: Code = 13 → VOUT_nor = 1.800V ✓
Eco 模式 @ Code = 13: VOUT_eco = 1.788V (偏差 -12mV, 超下规格)

解决方案：尝试调整 Code 到 14 → VOUT_nor = 1.810V, VOUT_eco = 1.798V
         两者都在规格内 ✓
```

**方法 2：Normal 优先，Eco 验证**

```
策略:
  1. 先 Trim Normal 模式到目标值
  2. 在 Normal Trim Code 下测量 Eco 模式 VOUT
  3. 如果 Eco VOUT 在规格内 → 通过
  4. 如果 Eco VOUT 超规格 → 微调 Trim Code 使两个模式都在规格内
  5. 如果无法两全 → 晶圆判废 (设计问题)
```

#### 3.2.3 独立 Trim 场景的流程

```
┌───────────────────────────────────────────────────────────┐
│  Step 1: Normal 模式 Trim                                 │
│    测量 → 计算 → 写入 Normal_Trim_Code                     │
│    验证 VOUT_nor ∈ Target 范围                             │
│                                                           │
│  Step 2: Eco 模式 Trim                                    │
│    切换到 Eco 模式                                         │
│    测量 VOUT_eco @ Normal_Trim_Code                       │
│    如果偏差在规格内 → Eco_Trim_Code = Normal_Trim_Code     │
│    如果偏差超规格 → 计算 Eco 专用 Trim Code                 │
│    写入 Eco_Trim_Code（独立寄存器）                         │
│                                                           │
│  Step 3: 最终交叉验证                                      │
│    验证 Normal 模式 VOUT（确保 Eco Trim 不影响 Normal）     │
│    验证 Eco 模式 VOUT（确保 Eco Trim 修正正确）             │
└───────────────────────────────────────────────────────────┘
```

### 3.3 注意事项 / Important Notes

1. **Eco 模式更长的稳定时间：** Eco 模式下 EA 的偏置电流和带宽都降低，环路建立时间可能是 Normal 模式的 10~100 倍。测试时需确保等待时间足够长，避免读取到非稳态的 VOUT 值。

2. **负载条件差异：** Eco 模式通常用于轻载场景（1mA 以下），因此 Trim 时负载电流应选择轻载（典型值 1mA），与 Normal 模式 Trim 的负载（典型值 10mA）不同。

3. **模式切换时的瞬态效应：** 从 Normal 切换到 Eco 模式时，VOUT 可能出现短暂的下冲或过冲。应等待足够时间直到 VOUT 完全稳定后再测量。

4. **Trim 寄存器独立性：** 需明确 Normal 和 Eco 模式的 Trim 寄存器是独立的、共享的、还是通过额外偏移量 (Offset) 寄存器控制的。不同的架构需要不同的测试策略。

5. **Eco 模式下 PSRR 降低：** Trim Code 的选择可能影响 EA 的工作点 → 影响 PSRR。在 PSRR 敏感的应用中，需要在 VOUT 精度和 PSRR 之间做 trade-off。

6. **Eco 模式的温度敏感性：** 由于 Eco 模式使用更低的偏置电流，EA 的 Vos 温度漂移通常比 Normal 模式更显著。室温 Trim 后需在高温和低温下验证。

---

## 四、LDO 修调策略与工程考量

### 4.1 Trim 流程策略 / Trim Flow Strategy

#### 4.1.1 推荐的总体策略

```
VREF 全局 Trim（影响所有 LDO）
        │
        ▼
LDO-1 Normal Trim（Normal Trim Code 确定）
        │
        ▼
LDO-1 Eco 检查（检查 Eco 偏移量）
   ├── 规格内 → 无需独立 Eco Trim
   └── 超规格 → 独立 Eco Trim
        │
        ▼
LDO-2, LDO-3, ...（逐路 Trim，与 LDO-1 相同流程）
        │
        ▼
交叉验证（每路 LDO 的 Normal 和 Eco 模式）
```

#### 4.1.2 执行顺序建议

1. **先修 Bandgap VREF**：所有 LDO 的参考基准，全局影响最大
2. **再修每路 LDO Normal 模式**：建立基础输出电压精度
3. **后检每路 LDO Eco 模式偏移**：根据实际偏移量决定是否需要独立处理
4. **最后交叉验证**：确认所有模式、所有负载条件下 VOUT 在规格内

### 4.2 负载调整率影响 / Load Regulation Impact

#### 4.2.1 原理

Load Regulation 定义为负载电流变化时 VOUT 的变化量：

$$
\text{Load Regulation} = \frac{\Delta V_{OUT}}{\Delta I_{LOAD}}
$$

影响因素：
- **环路增益**：增益越高，Load Regulation 越好
- **Pass FET 输出阻抗**：Rout 越大，负载调整率越差
- **封装寄生电阻**：Rbon 和引脚电阻上的 IR Drop

#### 4.2.2 对 Trim 的影响

```
关键概念: Trim 时的负载条件必须明确

示例:
  芯片 A @ Trim (10mA):  VOUT = 1.800V  ← 修到此值
  芯片 A @ Full Load:    VOUT = 1.788V  (Load Regulation = 1.2mV/mA)
  芯片 A @ No Load:      VOUT = 1.802V

如果 Trim 时负载与实际应用负载不同，
则 VOUT 精度在应用中可能偏移。

建议:
  • Trim 负载 = 实际应用中的典型负载
  • 或在 Trim 后测量 Load Regulation 并计入 Guard Band
```

#### 4.2.3 不同负载下的 Test Condition

| 负载类型 | 典型值 | 适用场景 |
|---------|-------|---------|
| **空载 (No Load)** | 0mA | 待机验证、Iq 测试 |
| **轻载 (Light Load)** | 1mA~10mA | Trim 条件、Eco 模式验证 |
| **中载 (Medium Load)** | 50mA~100mA | Normal 模式典型应用 |
| **重载 (Heavy Load)** | 200mA~500mA | OCP、Dropout、热测试 |

Trim 通常选择轻载条件，因为：
- 重载下 IR Drop 和自热效应会干扰 Trim 精度
- 轻载下 VOUT 最接近理想开环值
- 重载下的偏差由 Load Regulation 表征而非 Trim 修正

### 4.3 温度效应 / Temperature Effects

#### 4.3.1 VOUT 温度漂移的来源

LDO VOUT 的全温漂移是多个温度系数的叠加：

| 来源 | 温度系数 | 方向 |
|------|---------|------|
| VREF Bandgap TC | ±20~±50 ppm/°C | 典型抛物线 |
| EA Vos TC | ±1~±5 μV/°C | 可正可负 |
| R1/R2 电阻 TC | 正 (P+) 或 负 (N-) | 取决于电阻类型 |
| Pass FET Vth TC | -2~-4 mV/°C | 负温度系数 |

#### 4.3.2 Trim 温度策略

```
室温 (25°C) Trim  →  高温 (85°C/125°C) 验证  →  低温 (-40°C) 验证

典型结果:
  VOUT @ 25°C:  1.800V ✓ (Trim 目标)
  VOUT @ 125°C: 1.792V (偏差 -0.44%)
  VOUT @ -40°C: 1.809V (偏差 +0.50%)

如果全温偏差在规格内 → Trim 完成
如果全温偏差超规格 → 需要温度补偿 Trim (TC Trim)
```

#### 4.3.3 温度相关的注意事项

- **Trim 温度一致性：** 所有芯片的 Trim 步骤必须保持相同温度（通常 25°C ±2°C），避免温度引入的测量误差和 Trim Code 偏差
- **自热效应 (Self-Heating)：** 大负载电流下芯片结温升高，VOUT 动态漂移。Trim 时负载不宜过大
- **不同模式的温度行为差异：** Eco 模式下 EA 偏置低，Vos 的温漂更大。Eco Trim 后需特别注意全温验证
- **Guard Band 分配：** 将温度漂移的预算从 Total Error Budget 中预留出来，例如：

```
VOUT Total Error Budget: ±2.0%
  分配:
    • Trim 残留误差:   ±0.5%
    • 温度漂移:        ±0.8%
    • 负载调整率:      ±0.3%
    • 线调整率:        ±0.2%
    • 老化余量:        ±0.2%
```

### 4.4 线性调整率影响 / Line Regulation Impact

#### 4.4.1 原理

Line Regulation 衡量 VIN 变化时 VOUT 的稳定性：

$$
\text{Line Regulation} = \frac{\Delta V_{OUT}}{\Delta V_{IN}}
$$

主要影响因素：
- **EA 的电源抑制能力**：EA 的 PSRR 在高频下降
- **Pass FET 的 Early Effect**：VDS 变化导致输出电流变化
- **VREF 的 Line Sensitivity**：VREF 本身随 VIN 变化的程度

#### 4.4.2 对 Trim 的影响

```
影响说明:
  Trim 时 VIN = VOUT + 0.3V
  应用中 VIN 可能变化 (如电池电压从 4.2V → 3.4V)
  
  如果 Line Regulation = 0.5%/V:
  VIN 变化 0.8V → VOUT 变化 0.4%
  
  这个偏移是在 Trim 后额外叠加的，
  需要在 Total Error Budget 中考虑。
```

#### 4.4.3 建议

- Trim 时 VIN 应选择应用中的典型值
- 在 Datasheet 中明确标注 Trim 条件 (VIN, ILOAD, Temp)
- 量产测试中需在不同 VIN 下验证 VOUT（Line Regulation 测试项）

### 4.5 Normal 与 Eco 模式相关性 / Mode Correlation

#### 4.5.1 偏差来源对比

| 模式 | 主要 VOUT 偏差来源 | 典型偏差量 | 可修正性 |
|------|------------------|-----------|---------|
| **Normal** | R 比例偏差 + VREF 偏差 + EA Vos | ±1%~±3% | FB Trim 可直接修正 |
| **Eco** | R 比例偏差 + VREF 偏差 + EA Vos + **低增益误差** + **额外 Vos 偏移** | ±2%~±5% | 可能需要独立修正 |

#### 4.5.2 相关性分析

```
统计相关性（同一芯片 Normal vs Eco VOUT 偏差）:

  强相关场景:
    • R1/R2 比例偏差 → Normal 和 Eco 的 VOUT 同向偏移
    • VREF 偏差 → 两种模式同向偏移
  
  弱相关场景:
    • EA 低增益误差 → 仅影响 Eco
    • EA Vos 低偏置偏移 → 仅影响 Eco
  
  结论:
    • Normal Trim 可以消除 R 比例偏差和 VREF 偏差
    • Eco 模式下剩余的偏差主要来自 EA 的增益和失调变化
    • 如果设计良好，Normal Trim 后 Eco 偏移量通常 < ±1%
```

#### 4.5.3 量产数据示例

```
统计 10000 颗芯片的量产数据:

Normal 模式 VOUT (Trim 后):
  Mean = 1.8002V, Sigma = 3.2mV (0.18%)
  Cpk = 2.1 ✓

Eco 模式 VOUT (共享 Trim，未独立修正):
  Mean = 1.791V, Sigma = 5.8mV (0.32%)
  Cpk = 1.2 (需关注)
  Δ(Normal - Eco) = 9.2mV (0.51%)

如果 Eco 模式规格为 ±2% (36mV):
  Cpk = 1.2 → 基本满足，需持续监控
  如果部分芯片 Eco VOUT 超下规格 → 考虑独立 Eco Trim
```

### 4.6 AC 参数影响 / AC Parameter Impact

#### 4.6.1 PSRR 受 Trim Code 的影响

Trim Code 的变化不仅改变 DC VOUT，还可能影响 LDO 的 AC 性能：

**影响机制：**

1. **EA 工作点偏移：** Trim Code 改变 FB 分压比 → FB 节点 DC 电压变化 → EA 输入对管的工作电流和跨导改变 → EA 增益和带宽变化 → PSRR 变化

2. **Pass FET VGS 调整：** VOUT 变化后，Pass FET 的 VGS 会自适应调整 → 输出阻抗 Rout 变化 → PSRR 变化

3. **环路增益变化：** 不同 Trim Code 下环路的 DC 增益和单位增益带宽 (UGBW) 可能有微小差异

#### 4.6.2 PSRR 与 Trim Code 的关系示例

```
实测数据 (某款 LDO):

Trim Code | VOUT    | PSRR @ 1kHz | PSRR @ 100kHz
----------|---------|------------|-------------
 8 (Min)  | 1.770V  | 62dB       | 38dB
12        | 1.785V  | 65dB       | 40dB
16 (Mid)  | 1.800V  | 67dB       | 41dB  ← 最佳
20        | 1.815V  | 66dB       | 40dB
24 (Max)  | 1.830V  | 64dB       | 39dB

趋势: Mid-Code 附近 PSRR 最优，边界 PSRR 下降 2~3dB
原因: Trim 在边界值工作时，EA 和 Pass FET 偏离最佳偏置点
```

#### 4.6.3 其他受影响的 AC 参数

| AC 参数 | 受 Trim 影响程度 | 说明 |
|---------|----------------|------|
| **PSRR** | 中度 | Trim Code 改变 EA 偏置点 |
| **输出噪声** | 轻度 | EA 偏置变化影响噪声谱密度 |
| **瞬态响应** | 轻度 | 环路 UGBW 微小变化 |
| **相位裕度** | 极轻微 | 通常可忽略 |
| **缓起时间** | 无影响 | 独立于 Trim 电路 |

#### 4.6.4 建议

- 在 Trim Code 选择时，除了 DC 精度外，应验证 AC 性能是否在规格内
- 对于 PSRR 敏感的 LDO (如 RF 供电)，应选择 PSRR 最优的 Trim Code 区间
- 必要时需在 DC 精度和 PSRR 之间做 trade-off

### 4.7 Guard Band 与 Error Budget

#### 4.7.1 完整的 VOUT Error Budget 示例

```
VOUT Target: 1.800V
VOUT Spec:  ±2.0%  (±36mV)

Error Budget 分配:

误差来源                    │ 典型值    │ 占比
───────────────────────────│──────────│──────
Trim 残留误差 (Step 精度)    │ ±0.3%    │ 15%
Trim 测量系统误差            │ ±0.1%    │ 5%
温度漂移 (0°C ~ 85°C)      │ ±0.6%    │ 30%
负载调整率 (0~200mA)       │ ±0.4%    │ 20%
线性调整率 (3.0V~4.2V)     │ ±0.2%    │ 10%
老化 (Aging, 10年)          │ ±0.2%    │ 10%
封装应力                    │ ±0.1%    │ 5%
OTHERS (PSRR, Noise, etc.) │ ±0.1%    │ 5%
───────────────────────────│──────────│──────
总和 (RSS)                  │ ±0.86%   │
总和 (Worst Case)           │ ±2.0%    │
                             │
Trim 目标: VOUT = 1.800V ± 0.3%
                           (保留 Guard Band 给其他误差源)
```

#### 4.7.2 Guard Band 设置建议

- **Trim Guard Band:** 规格的 20%~30%（即 Trim 到目标的 ±1.4% 以内，而不是 ±2%）
- **温度 Guard Band:** 根据实测 TC 数据和温度分布设置
- **负载 Guard Band:** 根据实测 Load Regulation 和负载范围设置

---

## 五、常见问题与调试指南

### 5.1 Trim 相关问题速查

| 问题 | 可能原因 | 检查方向 |
|------|---------|---------|
| **Trim 后 VOUT 不变化** | Trim 寄存器未正确写入 | 确认 I2C/SPI 通信正常 |
| | Trim 未使能（需额外 Enable Bit） | 检查 Trim Enable 寄存器 |
| | OTP 烧录后未重新上电加载 | 执行 POR 或 Reset |
| **Trim Code 到边界仍不够** | 工艺偏差超出设计 Trim Range | 扩大 Trim Range（需改版） |
| | VREF 偏差太大 | 先修 VREF 再修 LDO |
| **Normal Trim 后 Eco 偏差大** | EA 低增益偏移过大 | 检查 EA 设计 |
| | Eco 模式下 Vos 过大 | 考虑独立 Eco Trim |
| **Trim 后 PSRR 显著下降** | Trim Code 在边界导致偏置点偏移 | 改用靠近 Mid-Code 的 Trim 值 |
| **Trim 后 VOUT 不稳定/振荡** | Trim Code 改变了环路稳定性 | 检查相位裕度 |
| | 负载条件导致 LDO 进入不稳定区 | 检查 Load/Line 条件 |
| **高温/低温下 Trim 失效** | Trim Code 温度漂移 | 增加 TC Trim 或调整 Guard Band |
| | Trim 存储单元高温数据丢失 | 检查 OTP Data Retention |
| **同一晶圆不同 Die VOUT 差异大** | Wafer 均匀性问题 | 检查工艺边缘区域 |
| | 探针接触电阻不一致 | 检查 Probe Card 状况 |

### 5.2 ATE 调试检查清单

```
□  Trim 寄存器映射表是否确认？
   - 地址、默认值、Bit 位宽、读写属性

□  Trim Enable 条件是否满足？
   - 是否需要特殊 Key/Sequence
   - 是否需要额外供电 (VPP)

□  Trim 前后测量条件是否一致？
   - VIN, ILOAD, 温度, 等待时间

□  OTP 烧录条件是否验证？
   - VPP 电压、脉宽、温度范围

□  Normal/Eco 模式切换方式？
   - 寄存器 Bit → 切换时序 → 稳定等待时间

□  Trim 良率是否有监控？
   - Trim Code 分布直方图
   - Post-Trim VOUT 分布
   - Normal/Eco 偏移量分布

□  FT 中 Trim 验证流程？
   - Trim Code Re-Read
   - VOUT Verification Test
   - Guard Band 是否足够
```

### 5.3 良率优化建议

1. **Trim Code 分布监控：** 量产初期绘制 Trim Code 直方图，确认 Trim Code 集中在中段区域。若 Trim Code 分布在边界附近，提示工艺偏移或设计余量不足。

2. **多路 LDO 偏差模式分析：** 如果所有 LDO 同向偏差，优先修 VREF；如果单路 LDO 异常，检查该路的 FB 电阻或 EA。

3. **Normal/Eco 偏移量跟踪：** 长期监控 Normal vs Eco 的偏移量（ΔVOUT = VOUT_eco - VOUT_nor），若均值显著偏离零，需要调整 Eco 模式 Trim 策略。

4. **温度漂移特性表征：** 在 characterization 阶段充分测量不同 Trim Code 下的温度特性，确保极端温度下 Trim 仍有效。

5. **Step Size 验证：** 量产验证阶段实际测量 Trim Step 的有效性，确认 Step_Size 与设计值一致，不存在缺失码或非单调段。

---

## 参考资料

- [PMIC Trim 完整指南](PMIC/Trim.md) — 全模块 Trim 方法大全
- [FT 测试完整指南](PMIC/FT.md) — FT 中的 Trim 验证流程
- [LDO 原理与测试](LDO_原理与测试.md) — LDO 基本原理和测试
- [OTP/EFUSE/Trim 测试](OTP_EFUSE_Trim.md) — 存储技术和烧录细节
- [Bandgap 原理与测试](Bandgap_原理与测试.md) — VREF Trim 参考
- [ATE 测试基础](ATE测试基础.md) — ATE 测试方法论
