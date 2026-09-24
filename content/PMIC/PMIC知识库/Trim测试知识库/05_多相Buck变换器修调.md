---
title: 多相Buck变换器修调
tags: [PMIC, Buck, Multiphase, Trim, Calibration]
author: ATE Team
---

# 多相Buck变换器修调 (Multiphase Voltage-Mode Buck Trim/Calibration)

---

## 一、多相Buck变换器概述 (Multiphase Buck Overview)

### 1.1 什么是多相Buck

多相Buck变换器是将多个相同的Buck功率级（phase）并联运行，各相之间以固定的相位差交替开关，共同向负载输出电流的一种DC-DC变换器拓扑。多相Buck广泛用于CPU/GPU供电、PMIC中大电流输出 rails 等需要高效率、高电流密度、快速瞬态响应的场景。

**基本原理 (Basic Principle)：**

多相Buck的每一相都是一个标准的电压模式控制Buck（voltage-mode buck），包括功率管（HS-FET / LS-FET）、输出电感（Lx）、PWM比较器、误差放大器（EA）、斜坡发生器（ramp generator）等。各相的PWM时钟相位错开 360°/N（N为相数），实现交错运行（interleaving）。

### 1.2 多相Buck的核心优势

| 优势 | 解释 |
|------|------|
| **相间交错 (Phase Interleaving)** | 各相PWM时钟错开，输入/输出电流纹波相互抵消，等效开关频率为 N × f_sw |
| **输出纹波减小 (Reduced Ripple)** | 纹波抵消效应使输出电容上的电压纹波大幅降低，可用更少输出电容 |
| **更好的瞬态响应 (Better Transient Response)** | 等效开关频率提高，环路带宽可以设计得更高，对负载阶跃的响应更快 |
| **均流运行 (Current Sharing)** | 每相承担部分负载电流，热分布均匀，可靠性高 |
| **更高的总输出电流 (Higher Total Output Current)** | N相并联，总输出电流为单相的N倍，突破单相功率管和电感的电流极限 |
| **效率优化 (Efficiency Optimization)** | 轻载时可关闭部分相（phase shedding），降低开关损耗 |

### 1.3 电压模式控制与电流模式控制的区别

多相Buck可采用电压模式控制（voltage-mode control）或电流模式控制（current-mode control）。本文聚焦于**电压模式控制（Voltage-Mode PWM Control）**，其特点为：

- EA输出直接与斜坡信号（ramp）比较产生PWM，无需电流环
- 对噪声更敏感，但环路设计简单
- 需要精确的斜坡发生器（ramp generator）和PWM比较器偏移修调

---

## 二、修调项总览 (Trim Item Overview)

多相电压模Buck的修调确保各相参数一致、输出精度高、保护功能准确。主要修调项包括：

| 编号 | 修调项 | 英文名称 | 核心目的 |
|------|--------|----------|----------|
| 1 | 时钟频率测试 | Clock Frequency Test | 确保相间相位关系准确 |
| 2 | PWM比较器修调 | PWM Comparator Trim | 消除比较器失调，保证PWM占空比精度 |
| 3 | Ramp Buffer修调 | Ramp Buffer Trim | 校准斜坡信号的DC电平和幅度 |
| 4 | 三角波电阻修调 | Triangle Wave Resistor Trim | 补偿ramp发生器工艺偏差 |
| 5 | EA钳位范围修调 | EA Clamp Trim | 限制峰值电感电流，防止饱和 |
| 6 | Current Sense修调 | Current Sense Trim | 开路校准offset，闭环校准增益 |
| 7 | 状态切换OCP修调 | State-Transition OCP Trim | 模式切换时防止OCP误触发 |
| 8 | POCP修调 | Peak OCP Trim | 峰值电流限流阈值校准 |
| 9 | NOCP修调 | Negative OCP Trim | 反向电流限流阈值校准 |
| 10 | 负DMD修调 | Negative DMD / Zero-Cross Trim | DCM模式下零电流检测 |
| 11 | 均流修调 | Current Share Trim | 校准各相电流检测偏移，实现均衡 |
| 12 | 输出电压精度修调 | Output Voltage Accuracy Trim | 保证VOUT在目标精度范围内 |

---

## 三、详细修调项

---

### 1. 测试多相Buck的Clock时钟频率 (Phase Clock Frequency Test)

#### 原理 (Principle)

多相Buck的时钟系统由一个主振荡器（通常为锁相环PLL或内部RC振荡器）产生。主时钟经分频/移相后生成各相PWM的触发信号：

- **PLL方案**：通过锁相环将内部时钟同步到外部参考时钟（如32kHz、38.4MHz晶振），频率精度高，相移精确
- **内部RC振荡器方案**：依靠片上RC充放电产生时钟，无需外部时钟输入，但频率精度受工艺、电压、温度（PVT）影响大

时钟频率的精度直接影响：
- 各相之间的相位关系（决定纹波抵消效果）
- 开关频率是否在目标范围内（影响EMI和效率）
- 与外部系统的同步能力

#### 测试方法 (Test Method)

1. **配置Buck进入开关状态**：设置目标输出电压，使能Buck，接适当负载使CCM工作
2. **选择测试节点**：
   - 直接测量CLK输出pin（如有专门时钟输出）
   - 测量任意一相的LX开关节点（switching node），获取该相开关频率
   - 通过内部测试多路复用器（test mux）将时钟信号路由到GPIO/TEST pin
3. **频率测量**：
   - 使用频率计（frequency counter）或示波器测量频率
   - 对于多相系统，依次测量各相LX频率，确认均为 N × f_sw
4. **判断标准**：频率误差应在目标值 ±X% 以内（通常要求 < ±5%）

#### 注意事项 (Considerations)

- 负载太轻可能进入DCM（ discontinuous conduction mode），此时LX频率偏低或呈脉冲串（burst），应加载保证CCM运行
- 如果使用PLL外同步，需要先确认PLL已锁定（lock），通常需要检查lock flag
- 测试环境噪声（特别是探头的地环路）可能耦合到LX测量结果中，需使用差分探头或短地弹簧
- 如果设计支持展频（spread spectrum / frequency hopping），测试时应禁用该功能

---

### 2. 修调多相电压模Buck PWM比较器（NOR/ECO） (PWM Comparator Trim)

#### 原理 (Principle)

电压模式Buck的PWM调制过程：误差放大器（EA）的输出电压 V_EA 与斜坡信号 V_RAMP 送入PWM比较器进行比较。当 V_RAMP > V_EA 时，比较器翻转，关断HS-FET。

PWM比较器的**输入失调电压（input offset voltage, V_os）** 会直接改变PWM的翻转点，导致占空比偏离理论值，进而造成：
- 输出电压偏离目标
- 各相之间占空比不一致（加剧电流不平衡）
- 不同模式（Normal / Eco）下输出跳变

由于Normal模式和Eco模式下比较器的偏置电流（bias current）和速度要求不同，通常需要分别修调（separate trim codes）。

#### 测试方法 (Test Method)

1. **断开EA与PWM比较器的连接**：通过测试模式（test mode）或模拟多路开关断开EA输出，改用外部已知电压源（或片上DAC）直接驱动PWM比较器输入端
2. **Normal模式修调**：
   - 设置比较器进入Normal模式（高偏置电流）
   - 设置 V_RAMP 为固定斜坡信号
   - 从外部向比较器输入端施加电压 V_IN
   - 扫描 V_IN，检测PWM输出翻转时的 V_IN 值
   - 翻转点与理论值之差即为 offset，调整trim code使offset归零
3. **Eco模式修调**：
   - 切换比较器进入Eco模式（低偏置电流，轻载优化）
   - 重复上述扫描过程
   - 修调到独立的eco trim code

#### 注意事项 (Considerations)

- Normal和Eco模式的trim code相互独立，需分别存储和加载
- 修调时用的斜坡信号幅度和斜率应与实际工作条件一致，否则修调结果会有偏差
- 比较器输入端的寄生电容可能引起测量延迟，扫描时应降低步长、增加稳定时间（settling time）
- 如果PWM比较器带有迟滞（hysteresis），需要从两个方向扫描（上升沿和下降沿），取平均值消除迟滞影响

---

### 3. 修调多相电压模Buck Ramp Buffer（NOR/ECO） (Ramp Buffer Trim)

#### 原理 (Principle)

Ramp buffer是电压模式Buck中的关键模拟模块。它产生一个周期性线性上升的斜坡电压 V_RAMP，与EA输出比较生成PWM信号。

**斜坡信号的要求：**
- **DC电平**（ramp DC level）：决定占空比为零时的PWM输出状态
- **幅度**（ramp amplitude / peak-to-peak）：决定PWM调制增益，影响环路稳定性
- **线性度**（linearity）：非线性会导致环路增益变化

为了兼顾效率和精度，通常设计两种模式：
- **Normal模式**：高偏置电流，斜坡精度高，用于重载
- **Eco模式**：低偏置电流，斜坡精度略低但功耗低，用于轻载

Ramp buffer内的运算放大器存在输入失调（input offset），该失调会叠加到斜坡信号的DC电平上，需要修调移除。

#### 测试方法 (Test Method)

1. **测试模式配置**：将ramp buffer输出通过测试mux路由到测试pin（或通过内部ADC采样）
2. **DC电平测量**：
   - 冻结斜坡信号（强制ramp buffer输出为恒定DC电平，不进行充放电）
   - 测量输出端电压，与设计目标值比较
   - Normal模式和Eco模式分别测量
3. **幅度测量**：
   - 使能斜坡运行（ramp running），测量V_RAMP的峰值和谷值
   - 峰峰值 = V_peak - V_valley
   - 与设计目标比较
4. **修调**：调整ramp buffer的offset trim code，使DC电平和幅度误差最小化
   - 通常先修DC电平（offset），再检查幅度（如果幅度也受offset影响）

#### 注意事项 (Considerations)

- Normal和Eco模式有独立的trim code，不能混用
- 测量斜坡幅度时需要足够带宽的示波器或ADC（斜坡上升时间很短）
- 注意探头的负载效应——高阻抗探头是必须的（>10MΩ || <10pF）
- 如果无法直接测量斜坡信号（没有测试mux），可以通过PWM占空比间接推算——但这会混入PWM比较器的offset，需要先完成PWM比较器修调

---

### 4. 修调多相电压模Buck三角波电阻 (Triangle Wave Resistor Trim)

#### 原理 (Principle)

电压模式Buck的斜坡发生器通常采用**恒定电流给电容器充电**的方式产生三角波/锯齿波：

- 充电电流 I_charge = V_REF / R_trim
- 斜坡幅度 V_ramp_pp = I_charge × T_charge / C_ramp

其中 R_trim 是一个可修调的片上电阻（trimmed resistor）。制造工艺中电阻的绝对精度较差（可能偏差 ±20%~±30%），而电容器的绝对精度也有限，导致斜坡幅度在不同芯片间差异大。

通过修调 R_trim 的阻值（即调整 trim code 改变并联/串联电阻网络的总阻值），可以校准斜坡幅度到目标值。

#### 测试方法 (Test Method)

1. **使能斜坡发生器**：启动Buck的斜坡模块，但不一定需要PWM开关（具体取决于芯片设计）
2. **测量斜坡幅度**：
   - 使用示波器或片上ADC直接测量V_RAMP信号的峰峰值
   - 或者通过测试mux将V_RAMP路由到ATExxx pin
3. **调整trim code**：
   - 测量当前V_ramp_pp
   - 计算目标值与测量值的比值
   - 确定R_trim的修调方向（增大阻值 → 减小充电电流 → 减小幅度）
   - 写入trim code，重新验证
4. **多次迭代**步进调整直到幅度在目标值 ±X% 以内

#### 注意事项 (Considerations)

- 如果斜坡幅度和DC电平都受同一组修调影响，需协调修调顺序（通常先修幅度再修DC level，或反之——取决于电路架构）
- 温度对修调结果有影响：修调通常在常温（25°C）进行，但芯片在实际工作温度下斜坡幅度会漂移。需要考虑温度系数补偿或在热态下验证
- 修调电阻的step size决定了修调分辨率，步长太大可能导致无法收敛到目标值
- 一些设计中斜坡电阻修调与振荡器频率修调共用同一电阻网络，需要考虑耦合影响

---

### 5. 修调多相电压模Buck EA的钳位范围（EA CLAMP） (Error Amplifier Clamp Trim)

#### 原理 (Principle)

误差放大器（EA）的输出电压 V_EA 直接送入PWM比较器，控制PWM占空比。如果V_EA过高或过低，PWM占空比将达到极限值（接近0%或100%），此时**峰值电感电流可能失控**，导致电感饱和或输出过冲。

为防止这种情况，EA输出端设计有钳位电路（clamp circuit）：
- **High Clamp（上限钳位）**：限制V_EA的最大值 → 限制最大占空比 → 限制峰值电感电流
- **Low Clamp（下限钳位）**：限制V_EA的最小值 → 限制最小占空比 → 防止负电流过大

钳位电压的精度受工艺偏差影响，需要修调来保证限流点的一致性。

#### 测试方法 (Test Method)

1. **High Clamp（上钳位）修调**：
   - 强制EA正向饱和（例如，设置 V_OUT 远低于 V_REF，或直接通过测试模式强制 EA 输入差模电压）
   - 测量 EA 输出端电压 V_EA
   - 此时 V_EA 应被钳位在 V_CLAMP_HIGH 附近
   - 读取当前值，与目标比较，修调 high clamp trim code
2. **Low Clamp（下钳位）修调**：
   - 强制EA反向饱和（设置 V_OUT 远高于 V_REF）
   - 测量 V_EA，被钳位在 V_CLAMP_LOW 附近
   - 修调 low clamp trim code
3. **非侵入式方法**（如果不能直接访问EA输出）：
   - 逐步增加负载电流，监测PWM占空比或LX波形
   - 当占空比不再随负载增加而变化时，EA已进入钳位
   - 此时占空比对应的EA电压可以间接推算

#### 注意事项 (Considerations)

- High clamp 和 low clamp 可能有独立的 trim code，也可能共享——需查看数据手册
- 钳位点的修调需要配合OCP/POCP的修调结果，确保EA钳位在OCP触发之前（或之后——取决于保护策略）
- 修调时EA的输出负载（即PWM比较器的输入电容）会影响钳位电压的建立时间，需确保settling time足够
- High clamp修调不当可能导致：上钳位太低 → 负载能力不足；上钳位太高 → 失去限流保护作用

---

### 6. 修调多相电压模Buck Current Sense (Current Sense Trim)

#### 6a. Current Sense开环修调 (Open-Loop Current Sense Trim)

##### 原理 (Principle)

Current Sense放大器监测每个功率相的电流（通常通过检测LS-FET的R_DS(on)压降或串联sense电阻的电压），生成一个与相电流成比例的电压 V_CS。

开环修调（offset calibration）的目标是**消除sense放大器的输入失调电压**，使零电流时 V_CS = 0。

##### 测试方法 (Test Method)

1. **确保零电流条件**：
   - Buck disable 或高阻态（Hi-Z）
   - 或者强制电感电流为零（通过特殊的test mode）
2. **测量Current Sense输出**：
   - 读取 V_CS（或通过测试mux）
   - 理想情况应为0V（或设计指定的零电流参考电压）
3. **修调偏移**：
   - 逐档调整offset trim code
   - 使 V_CS 尽可能接近目标零电流值

##### 注意事项 (Considerations)

- 必须在电感电流确实为零时进行，否则会错误地把真实电流当作offset修掉
- 如果芯片不支持强制电感电流为零，可以测量某一已知低电流点后通过外推计算offset
- 如果CS放大器有PGA增益设置（programmable gain），每个增益档位可能需要独立的offset trim

---

#### 6b. Current Sense闭环修调 (Closed-Loop Current Sense Trim)

##### 原理 (Principle)

闭环修调校准电流检测通路的总增益（total gain），使 V_CS 与真实电感电流的比值精确等于设计值。开环修调移除了offset，但gain误差仍然存在。

增益误差来源于：
- Sense电阻/R_DS(on)的工艺偏差
- CS放大器的增益误差
- 后续ADC/比较器的参考电压误差

闭环修调需要一个已知的参考电流源（通常是一个外部精密负载或片上已知电流源）。

##### 测试方法 (Test Method)

1. **注入已知电流**：
   - 给Buck接上精密电子负载，强制输出一个已知电流 I_REF（例如 1A）
   - 或利用芯片内部的校准电流源注入CS通路
2. **测量CS输出**：
   - 读取 V_CS 值
   - 计算：gain_error = V_CS_measured / (R_sense × I_REF)
3. **修调增益**：
   - 调整gain trim code（可能改变反馈电阻网络或电流源）
   - 使 V_CS = 设计增益 × I_REF
4. **多电流点验证**：分别在低电流、中电流、高电流下验证线性度

##### 注意事项 (Considerations)

- 闭环修调应在开环修调（offset trim）完成后进行，否则结果相互干扰
- 如果使用外部负载，需要确保负载电流的精度高于修调精度要求（至少高3~5倍）
- 大电流下电感铜损和功率管自热效应会改变感测路径的电阻，影响修调准确性——建议使用脉冲电流（pulsed current）避免自热
- 多相Buck中每相各有独立的CS放大器，需逐相独立修调

---

### 7. Vbuck状态切换OCP修调电流（小OCP Trim）+ POCP_SW点修调 (State-Transition OCP Trim)

#### 原理 (Principle)

多相Buck在不同工作模式间切换时（例如 Eco mode → CCM mode），电感电流可能出现**瞬态尖峰（current spike）**。这是因为：
- 模式切换瞬间，各相PWM时序重新同步
- EA输出突然变化导致占空比跳变
- 环路尚未稳定

如果OCP（过流保护）阈值在切换过程中保持不变，这些瞬态尖峰可能触发OCP误保护，导致系统异常关机。

因此，在模式切换瞬间，芯片会临时抬高OCP阈值（或禁用OCP），等环路稳定后再恢复到正常阈值。这个**切换期间的OCP阈值**需要修调，既要足够高避免误触发，又不能太高失去保护作用。

POCP_SW（switching point）是状态切换时OCP行为的开关点，需要配合小OCP trim一起修调。

#### 测试方法 (Test Method)

1. **触发模式切换**：
   - 设置Buck在轻载条件下运行于Eco模式（或PFM模式）
   - 突然增加负载（load step），强制切换到CCM模式
2. **监测OCP Flag**：
   - 读取OCP中断/标志位
   - 如果OCP flag在切换瞬间被置位（但实际电流并未达到静态OCP阈值），说明需要修调
3. **小OCP修调（state-switch OCP trim）**：
   - 调整切换期间使用的临时OCP阈值trim code
   - 重复load step试验，直到切换不再误触发OCP
4. **POCP_SW点修调**：
   - POCP_SW决定切换时是否启用临时OCP阈值
   - 修调该开关点以确保在正确的负载水平下启用/禁用临时OCP

#### 注意事项 (Considerations)

- 需要一定数量的重复测试以确保统计可靠性（误触发可能是概率性的）
- Load step的斜率（di/dt）会影响瞬态尖峰的幅度，测试条件应覆盖最差情况（worst-case）
- 小OCP trim值不能设置得过高，否则在模式切换期间发生的真实过流会无法被检测
- 不同模式之间的切换（Eco→CCM, CCM→Eco, 相数切换）可能需要各自独立的修调

---

### 8. Buck POCP修调 (Peak Over-Current Protection Trim)

#### 原理 (Principle)

POCP（Peak Over-Current Protection）检测每个开关周期内**电感电流的峰值**。当峰值电流超过设定的阈值时，POCP比较器立即关断HS-FET，防止电流继续上升。

POCP的精度直接影响：
- 最大输出电流能力（set too low → 负载能力受限）
- 电感/功率管的安全裕量（set too high → 可能损坏器件）

POCP阈值由电流检测通路的增益和比较器的参考电压决定，两者都有工艺偏差，因此需要修调。

#### 测试方法 (Test Method)

1. **准备测试条件**：
   - Buck使能，输出接电子负载
   - 禁用其他保护（如过热保护、NOCP等），防止干扰
2. **逐步增加负载**：
   - 线性或步进增大负载电流
   - 监测POCP标志（flag）或LX波形（HS-FET提前关断的特征）
3. **检测触发点**：
   - 当POCP触发时，记录此时的输出电流 I_TRIP
   - 可以通过LX节点的脉冲宽度变窄（pulse skipping）来识别POCP动作
4. **修调**：
   - 比较 I_TRIP 与目标阈值
   - 调整POCP trim code，使触发电流收敛到目标值
5. **多温度点验证**（如果需要）：在hot和cold条件下重复测试

#### 注意事项 (Considerations)

- POCP的触发延迟（propagation delay）会导致实际触发电流高于理论值——修调时应考虑这一"over-shoot"并预留余量
- 如果电流检测使用R_DS(on)感测，温度对R_DS(on)的影响很大（~0.4%/°C），POCP阈值在高温下会显著降低。修调可能在常温下标定，但需在高温下验证
- 多相Buck中各相POCP需要分别修调，因为每相有独立的sense通路和比较器
- 一些设计支持POCP软件可编程（通过I²C写阈值），硬件trim则设定trim code的默认值

---

### 9. Buck NOCP修调 (Negative Over-Current Protection Trim)

#### 原理 (Principle)

NOCP（Negative Over-Current Protection）也称为**反向过流保护**或**负电流限流**。在同步Buck中，当LS-FET导通时，电感电流可能反向（从输出流向地），特别是在轻载DCM模式或输出短路的瞬态过程中。

过大的反向电流会：
- 增加功耗，降低轻载效率
- 在输出短路时造成大的反向电流应力
- 可能导致电感饱和或输出电压异常

NOCP比较器监测电感电流的反向值，当反向电流超过 NOCP 阈值时，提前关断LS-FET，进入DCM模式。

#### 测试方法 (Test Method)

1. **准备测试条件**：
   - Buck使能输出，但负载为电流源（主动从输出抽电流或推电流，使电流反向）
   - 或使用低负载电阻使输出电压低于目标值（导致反向电流）
2. **强制反向电流**：
   - 使用有源负载（active load）或另一个电源作为电流源，将电流从输出端拉向Buck的LX节点，使电感电流反向
   - 逐步增加反向电流
3. **检测NOCP触发**：
   - 监测NOCP标志
   - 或监测LS-FET的栅极驱动信号（NOCP触发时LS-FET提前关断）
   - 记录触发时的反向电流值 I_NOCP_TRIP
4. **修调**：
   - 调整NOCP trim code，使触发阈值达到目标值

#### 注意事项 (Considerations)

- NOCP通常在DCM模式下才启用（CCM模式下不会触发，因为反向电流是正常现象），测试前需要确认NOCP使能条件
- 反向电流的检测精度受sense路径offset和增益误差影响——NOCP修调通常在前述current sense修调完成之后进行
- 注意测试安全：强制大反向电流可能导致输出电容反向充电或芯片损坏，建议从零逐步增加并设置硬电流上限
- 对多相Buck，NOCP可能在每相独立检测，也可能总电流检测——需要了解架构

---

### 10. 电压模Buck负DMD修调 (Negative DMD / Zero-Cross Trim)

#### 原理 (Principle)

DMD（Diode Emulation Mode / 二极管仿真模式）是Buck在轻载时进入的一种工作模式，通过检测电感电流过零点（zero-cross），在电流反向之前关断LS-FET，使Buck工作在DCM（断续导通模式），以提高轻载效率。

**负DMD修调**的目标是校准**零电流检测比较器（zero-cross comparator, ZCD）** 的偏移电压。ZCD比较器监测LX节点电压（或通过sense放大器监测电流），在电感电流下降至接近0A时给出关断LS-FET的信号。

如果ZCD偏移为正值：LS-FET关断过早，输出电流能力略降，但效率略高。
如果ZCD偏移为负值：LS-FET关断过晚，部分反向电流流过（负电流），损耗增加，效率降低。

因此需要精确修调ZCD的比较器偏移，使DCM切换点尽可能接近真正的零电流。

#### 测试方法 (Test Method)

1. **设置轻载条件**：
   - Buck使能，输出接极小负载（例如几mA到几十mA）
   - 确保Buck工作在DCM模式
2. **监测LX波形**：
   - 使用示波器测量LX节点对GND波形
   - 在DCM下，LX在LS-FET关断后会呈现振荡（ringing），直到下一个周期开始
3. **检测DCM进入点**：
   - 减小负载直至电流刚好进入DCM → 可以通过LX波形的死区时间判断
   - 记录进入DCM时的负载电流 I_DCM_ENTRY
   - 此电流值与理论值之差反映了ZCD比较器偏移
4. **修调**：
   - 调整负DMD trim code（即ZCD offset trim）
   - 使 I_DCM_ENTRY 接近理论零电流点
5. **效率验证**：在多个轻载点测量效率，确认DCM效率最优

#### 注意事项 (Considerations)

- 负DMD修调不当时，如果ZCD触发太晚（负偏移），反向电流会使空载时输出电容充电，导致输出电压升高（输出电压"boosting"），可能触发OVP
- 一些PMIC将负DMD和NOCP的修调共享同一通路，需协调修调顺序
- 测量LX振荡时需要使用短地弹簧探头（ground spring），减少地环路引入的噪声
- 对多相Buck，轻载时可能关闭部分相，负DMD修调对工作的各相分别进行

---

### 11. 多相Buck均流修调 (Current Sharing Trim)

#### 原理 (Principle)

均流（current sharing / current balance）是多相Buck的核心要求之一。理想情况下，N相并联的Buck每一相承担 I_OUT / N 的电流。但实际上，由于以下因素各相电流会不平衡：

1. **各相Sense放大器偏移不同**：电流检测结果不同，导致均流环路（active current sharing loop）的调节基线与实际电流不匹配
2. **PWM比较器偏移差异**：各相占空比存在微小差异
3. **功率级参数差异**：各相电感DCR、功率管R_DS(on)不一致
4. **PCB布局差异**：寄生电阻/电感不同

多相Buck通常有**主动均流环路**（active current sharing loop），该环路比较各相电流检测值，生成矫正信号调整各相PWM占空比。

均流修调的核心是修掉各相电流检测的**offset失配**，使均流环路在零电流或已知电流下达到平衡。

#### 测试方法 (Test Method)

1. **准备测试条件**：
   - Buck使能，所有相均工作，输出接中等负载（例如额定电流的50%）
2. **逐相测量电流**：
   - 通过测试mux依次读取各相的电流检测值 V_CS[i]（i = 1..N）
   - 或者测量各相的电感电流（使用电流探头）
3. **计算偏差**：
   - 平均电流 I_AVG = (Σ I_phase[i]) / N
   - 各相偏差 ΔI[i] = I_phase[i] - I_AVG
4. **修调**：
   - 调整各相的current sense offset trim code
   - 将 ΔI[i] 减小到最小
   - 通常以某一相为"master"，调整其他相的offset与之匹配
5. **多负载点验证**：分别在轻载、半载、满载下验证均流效果

#### 注意事项 (Considerations)

- 均流修调的质量最终要通过各相电流差异来评价——通常要求各相电流差异 < 10%~20% 额定电流
- 如果使用R_DS(on)感测，各相的温度差异会导致感测结果差异，均流度随温度变化可能劣化
- 均流修调只能在current sense开环和闭环修调（第6项）全部完成之后进行，否则sense读数是错误的，修调也无意义
- 修调后需要验证瞬态过程中的均流度——一些offset只有在特定工作点才显著
- 如果芯片支持相数可编程（例如 1/2/3/4 相配置），各相数组合下都需要验证均流

---

### 12. 多相Buck输出电压精度修调 (Output Voltage Accuracy Trim)

#### 原理 (Principle)

Buck的输出电压精度是PMIC最关键的性能指标之一。对于多相Buck，VOUT的精度取决于：

1. **反馈电阻分压比（Feedback resistor divider）**：VOUT经R1/R2分压后送入EA的负输入端，与V_REF比较。R1/R2的比值精度直接影响VOUT
2. **内部参考电压V_REF的精度**（通常来自前面修调好的带隙基准VBG）
3. **EA本身的输入失调电压**
4. **负载调整率（load regulation）和线性调整率（line regulation）的残余误差**

输出电压精度修调通常通过以下方式之一或组合进行：
- **修调反馈电阻**：修调分压器R1或R2的电阻trim code
- **修调参考DAC**：调整V_REF的DAC code
- **修调电压定位（load line/Vdroop）**：校准输出阻抗

修调通常在**标称负载**下进行（如额定电流的50%），以保证最佳精度。

#### 测试方法 (Test Method)

1. **准备测试条件**：
   - Buck使能，输出设为目标电压 V_TARGET
   - 接标称负载（例如 50% I_RATED）
   - 保证输入电压在标称值
2. **测量VOUT**：
   - 使用精密万用表（DMM）在输出电容两端（sense point）测量VOUT
   - 四线开尔文连接（Kelvin sensing）消除线阻影响
3. **计算误差**：
   - Error = VOUT_measured - V_TARGET
   - 以百分比表示
4. **修调**：
   - 根据误差方向和大小确定trim code调整量
   - 如果使用电阻分压器修调：增大R2（相对于R1）→ VOUT升高
   - 如果使用V_REF DAC修调：增加DAC code → VREF升高 → VOUT升高
5. **重新验证**：写入trim code后再次测量VOUT，确认在目标精度范围内

#### 注意事项 (Considerations)

- 修调后需在全负载范围内验证（空载到满载），确保负载调整率（load regulation）也满足要求
- 不同输出电压档位（如 0.6V, 0.8V, 1.0V, 1.2V 等）可能需要各自独立的trim code
- 在多相Buck中，如果输出电压由**主从架构**控制（master-slave），只需要修调master相的反馈通路
- 温度对输出电压有影响——V_REF的温漂和电阻的温漂都会导致VOUT变化。trim后需要在高温和低温下回测
- 一些PMIC支持**动态电压调节（Dynamic Voltage Scaling, DVS）**，修调应保证整个电压范围内的精度，而非仅一个静态点

---

## 四、修调流程建议 (Recommended Trim Flow)

多相Buck的修调各项之间存在依赖关系，推荐的修调顺序如下：

```
Phase 1: 基础修调 (Fundamental Trims)
  1. 时钟频率测试 / 三角波电阻修调 ─────────── (依赖: 无)
  2. PWM比较器修调 (NOR/ECO) ───────────────── (依赖: 三角波幅度稳定)
  3. Ramp Buffer修调 (NOR/ECO) ──────────────── (依赖: 无)

Phase 2: 检测通路修调 (Sense Path Trims)
  4. Current Sense开环修调 (Offset) ────────── (依赖: 无)
  5. Current Sense闭环修调 (Gain) ──────────── (依赖: 开环修调完成)
  6. EA Clamp修调 ──────────────────────────── (依赖: PWM比较器修调完成)

Phase 3: 保护功能修调 (Protection Trims)
  7. POCP修调 ──────────────────────────────── (依赖: CS修调完成)
  8. NOCP修调 ──────────────────────────────── (依赖: CS修调完成)
  9. 状态切换OCP / POCP_SW修调 ─────────────── (依赖: POCP修调完成)
  10. 负DMD修调 ────────────────────────────── (依赖: 无独立依赖)

Phase 4: 系统修调 (System Trims)
  11. 均流修调 ─────────────────────────────── (依赖: CS开环+闭环修调完成)
  12. 输出电压精度修调 ─────────────────────── (依赖: 均流修调完成)
```

---

## 五、常见问题与调试指南 (Common Issues & Debugging Guide)

### 5.1 修调后输出电压仍偏大/偏小
- **确认基准电压V_REF已单独修调**：输出电压精度修调是基于V_REF的，如果V_REF本身偏差大，调反馈无济于事
- **检查负载条件**：负载电流偏差导致IR drop差异，建议在相同负载电流下验证
- **检查遥测点位置**：板级sense点和芯片内部sense点之间的路径电阻（bond wire、PCB走线）会造成误差

### 5.2 均流修调后各相电流仍然不平衡
- **确认各相PWM比较器偏移已修调**：各相PWM占空比差异是均流误差的源头之一
- **检查电感DCR差异**：如果PCB上各相电感布局不对称，DCR差异可能导致电流测量和真实电流的不匹配
- **温度梯度**：如果某一相靠近热源，其温度高于其他相，R_DS(on)增大 → 感测到的电流偏大 → 均流环路降低该相电流 → 实际电流偏小

### 5.3 OCP触发过早或过晚
- **先确认current sense修调正确**：OCP阈值依赖于电流检测的精度
- **考虑传播延迟**：OCP比较器+逻辑的延迟导致实际触发电流高于阈值，需留出延迟余量
- **温度敏感性**：高温下R_DS(on)增大，POCP阈值降低，属于正常物理特性但需要通过修调补偿

### 5.4 DCM进入点不正确或轻载效率差
- **检查负DMD/ZCD修调**：偏移朝向正方向 → LS-FET关断过早 → 效率略降但安全
- **偏移朝向负方向** → 反向电流增加 → 可能在空载时导致输出过压
- **确认负载条件**：如果负载电流远低于DCM深度，可能进入burst模式而非纯DCM

---

## 六、术语表 (Glossary)

| 术语 | 英文 | 说明 |
|------|------|------|
| 多相Buck | Multiphase Buck | 多个Buck单元并联运行，各相相位交错 |
| 电压模式控制 | Voltage-Mode Control | PWM通过EA输出与斜坡信号比较产生 |
| 均流 | Current Sharing | 各相电流平衡分配 |
| PWM比较器 | PWM Comparator | 比较EA输出与斜坡信号产生PWM脉冲 |
| Ramp Buffer | Ramp Buffer | 产生斜坡信号的缓冲器 |
| EA | Error Amplifier | 误差放大器，放大V_REF与V_FB之差 |
| EA Clamp | EA Clamp | EA输出电压的上下限钳位 |
| Current Sense | Current Sense | 电流检测放大器 |
| POCP | Peak Over-Current Protection | 峰值过流保护 |
| NOCP | Negative Over-Current Protection | 负向过流保护 |
| DMD | Diode Emulation Mode | 二极管仿真模式，即DCM |
| ZCD | Zero-Cross Detection | 零电流检测 |
| CCM | Continuous Conduction Mode | 连续导通模式 |
| DCM | Discontinuous Conduction Mode | 断续导通模式 |
| PLL | Phase-Locked Loop | 锁相环，用于精确时钟同步 |
| DVS | Dynamic Voltage Scaling | 动态电压调节 |
| Load Line | Load Line / Vdroop | 输出电压随负载线性下降的特性 |
| Trim Code | Trim Code | 修调寄存器数值，N位二进制码 |
| Test Mux | Test Multiplexer | 测试多路复用器，将内部信号路由到测试pin |

---

## 七、参考文献 (References)

1. R. W. Erickson and D. Maksimovic, *Fundamentals of Power Electronics*, 3rd ed., Springer, 2020.
2. M. T. Zhang, "Multiphase Buck Converters for Voltage Regulators," *IEEE Trans. Power Electron.*, 2005.
3. Intersil Application Note AN1324: *Multiphase Buck Converter Design Guidelines*.
4. TI Application Report SLVA882: *Understanding Multiphase Buck Converters*.
5. 各PMIC芯片Datasheet及ATE测试规范（Confidential）。
