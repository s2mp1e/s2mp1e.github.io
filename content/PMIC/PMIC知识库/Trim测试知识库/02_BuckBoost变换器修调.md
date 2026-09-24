---
title: Buck-Boost 变换器修调知识库
author: ATE Team
tags: [PMIC, Buck-Boost, Trim, Calibration, DMD, TON, TOFF, EA Clamp, Comparator]
description: PMIC Buck-Boost 变换器所有修调项的原理、测试方法及注意事项
---

# Buck-Boost 变换器修调

## 概述

Buck-Boost 变换器是 PMIC 中核心的功率级拓扑之一，能够在输入电压高于或低于输出电压时稳定工作。由于工艺偏差（Process Variation），芯片内部的参考电压、电流源、电阻电容（RC）定时元件、比较器失调（Offset）等均存在不确定性，需要通过修调（Trim/Calibration）来保证转换器的各项性能指标落在规格范围内。

本文档系统性地覆盖 Buck-Boost 变换器的 11 项修调内容，从底层原理出发，阐述测试方法与工程注意事项。

---

## 1. DMD 点修调 (Duty Mode Detection Threshold Trim)

### 原理

DMD（Duty Mode Detection）用于实时检测 Buck-Boost 的电感电流负载水平，判断当前应工作在 **DCM（Discontinuous Conduction Mode，断续导通模式）** 还是 **CCM（Continuous Conduction Mode，连续导通模式）**。

- DMD 核心是一个**电流检测比较器**，其参考阈值由一个 **Current DAC** 产生。
- 当电感电流（或负载电流）低于设定的 DMD 阈值时，系统进入 DCM 以提高轻载效率；当负载高于该阈值时，系统进入 CCM 以提供足够的输出能力。
- Trim 的目标是将 DMD 比较器的翻转点修调到目标值，例如 **20mA**。即当负载电流等于 20mA 时，DCM/CCM 刚好发生切换。

### 测试方法

1. **设置测试条件**：
   - 配置 Buck-Boost 为固定输出电压（例如 3.3V）。
   - 输入电压 VIN 设置为典型值（如 3.7V）。
   - 电子负载或电流源连接到输出端。
2. **电流扫描 (Current Sweep)**：
   - 从轻载（例如 1mA）开始，逐步增大负载电流至超过预期 DMD 点（例如 50mA）。
   - 每一步保持稳定后，检测以下之一：
     - LX 引脚波形：DCM 时 LX 会出现振铃（Ring）和断续，CCM 时 LX 连续开关无断续间隙。
     - 电感电流过零检测（ZCD）信号状态。
     - 内部 DMD 标志位（如有寄存器可读）。
3. **定位翻转点**：
   - 找到 DCM 到 CCM 的过渡电流值。
   - 通过二分法（Binary Search）或线性扫描，精确确定翻转电流。
4. **Trim 调整**：
   - 读取当前 Trim Code，调整 Current DAC 的码值。
   - 重复扫描，直到翻转点落在目标值 ± 允差内（例如 20mA ± 2mA）。
   - 典型的 DMD 修调范围覆盖 5mA -- 50mA。

### 注意事项

- DMD 翻转点存在**迟滞 (Hysteresis)** 设计，DCM→CCM 和 CCM→DCM 的翻转点可能不同。测试时需明确修调的是哪一个方向的阈值。
- 负载瞬态响应可能影响 DMD 判断，扫描时应等待输出稳定后再记录结果。
- 温度对 DMD 阈值有显著影响，常温修调后需在高温/低温下做 Corner 验证。
- 电感电流纹波大小会影响 DMD 检测精度，测试时需使用标准电感值。

---

## 2. TON 时间修调 (Turn-On Time Trim)

### 原理

TON（Turn-On Time）指 Buck-Boost 功率管在每个开关周期中导通的时间长度，在 **COT（Constant On-Time, 恒定导通时间）** 或 **AOT（Adaptive On-Time, 自适应导通时间）** 控制架构中，TON 由内部定时电路决定：

- 一个**恒流源**向一个内部**电容**充电，电容电压达到参考电平时，比较器翻转，结束 TON。
- TON 与 RC 乘积成正比：`TON = (C × VREF) / ICHG`。
- 工艺偏差会导致片上 RC 有 ±15%--±30% 的变化，因此需要修调使 TON 对准设计目标。
- 目标 TON 通常由应用条件决定：`TON ≈ (VOUT / VIN) × TSW`，典型值在几百纳秒到几微秒之间。

### 测试方法

1. **连接测试设备**：
   - 示波器（带宽 ≥ 200MHz）连接到 LX 引脚和 VOUT。
   - 或者使用 ATE 上的 Time Measurement Unit (TMU) 进行时域测量。
2. **设置稳态工作条件**：
   - VIN 和 VOUT 设定为修调所需的典型比值（例如 VIN=3.7V, VOUT=3.3V）。
   - 负载设为中等值（如 100mA），确保工作在 CCM。
3. **测量导通脉宽**：
   - 在 LX 波形上测量高端功率管导通脉冲的宽度（从 LX 上升沿到下降沿，或根据拓扑中具体开关节点的特征）。
   - 多次取平均（例如 16 次或 32 次）以消除噪声和抖动（Jitter）。
4. **Trim 调整**：
   - 若测得的 TON 偏大，减小充电电流或减小电容 Trim Code；若偏小则反之。
   - 迭代测试直到 TON 达到目标值 ± 允差（例如 ±5%）。

### 注意事项

- TON 与输入电压有关，在 AOT 架构中 TON 会自适应调节 VIN 变化，修调需在指定 VIN/VOUT 条件下进行。
- 示波器探头的地线尽量短，避免地回路引入噪声导致脉宽测量误差。
- 测试时需注意死区时间（Dead Time）不应被误计入 TON。
- 修调 TON 时也会影响开关频率，需要同时验证频率是否落在目标范围内。

---

## 3. TOFF 时间修调 (Turn-Off Time Trim)

### 原理

TOFF（Turn-Off Time）指功率管关断的时间长度。在与 TON 配合时，`TON + TOFF` 决定开关周期。

- 与控制模式相关：在 **恒定关断时间 (Constant Off-Time, COT)** 架构中，TOFF 由片上 RC 定时器决定。
- 定时原理与 TON 类似：电流源充电到比较器阈值，比较器翻转结束 TOFF。
- 片上 RC 工艺偏差同样会使 TOFF 偏离目标值，需要修调。

### 测试方法

1. **测试条件**：与 TON 测试类似的稳态设置，确保 CCM 工作模式。
2. **测量 LX 关断脉宽**：
   - 测量 LX 引脚上功率管关断脉冲的宽度（TON 脉冲之间的低电平时间，具体视拓扑而定）。
   - 使用示波器测量时，取多个周期的平均值。
3. **Trim 调整**：
   - 调整 TOFF 定时器的 Trim Code（通常也是调整充电电流或电容阵列）。
   - 每次调整后重新测量，迭代到目标值。

### 注意事项

- TOFF 在轻载 DCM 下会被跳过或变动，因此修调必须在 CCM 模式下进行。
- 如果 TON 和 TOFF 使用共用的 RC 定时电路，修调其中一个可能会影响另一个，需确认其独立性。
- 部分设计中 TOFF 具有自适应特性（与 VOUT 或 VIN 有关），需按数据手册中的公式确认修调条件。

---

## 4. Min TON 时间修调 (Minimum Turn-On Time Trim)

### 原理

Min TON（Minimum On-Time）是 Buck-Boost 能够可靠输出的最短导通脉宽，是功率管驱动和死区控制能够响应并完成的最小时间。

- 在高 VIN、低 VOUT 的情况下（例如 VIN=12V, VOUT=1.8V），占空比 D 很小，需要的 TON 非常短。
- 如果目标 TON 小于芯片物理上能支持的最小导通时间，输出电压将失控（输出电压高于目标值，即 Output Overvoltage）。
- Min TON 受到内部驱动延迟、电平移位器（Level Shifter）传输时间、栅极驱动（Gate Drive）上下拉能力等因素的限制。
- 修调通过调整一个限制 TON 的比较器阈值或延迟链（Delay Chain）来实现。

### 测试方法

1. **设置极限条件**：
   - 设置 VIN 为最大值，VOUT 为最小值，使占空比最小。
   - 例如 VIN=5.5V, VOUT=1.8V（以实际芯片规格为准）。
   - 空载或极轻载。
2. **测量 LX 脉宽**：
   - 在 LX 上测量功率管的最小导通脉冲宽度。
   - 多次测量取其最小值。
3. **检测输出异常**：
   - 观察 VOUT 是否超过目标值（过压指标）。
   - 如果 VOUT 偏高，说明实际占空比无法进一步减小，需要修调 Min TON 更小。
4. **Trim 调整**：
   - 调整最小导通时间限制电路的 Trim Code。
   - 通常修调的是延迟链中的电容负载或电流源。
   - 重复测试直到 VOUT 保持在规格范围内，且 LX 脉冲宽度符合 Min TON 目标。

### 注意事项

- Min TON 大小受温度影响很大，高温下驱动速度变慢，Min TON 可能增大。需在最高工作温度下验证。
- 修调 Min TON 过小可能导致驱动不完全开启（不完全导通）或可靠性问题（栅极氧化层应力），需留有裕量。
- 测试时需要注意 LX 节点是否存在振铃导致误判脉宽。

---

## 5. Max TOFF 修调 (Maximum Turn-Off Time Trim)

### 原理

Max TOFF（Maximum Off-Time）是 Buck-Boost 在单个开关周期中允许的最长关断时间，主要用于：

- 限制轻载或空载时的最低开关频率。
- 防止轻载下输出电压下降过大。
- 在最坏条件下保证足够的电感能量传递。
- 与 TON 一起构成开关周期的上界，确保系统时钟/频率不会过低（以避免可听噪声或系统不稳定）。

Max TOFF 由定时器电路产生，通常也有一个 RC 振荡器或计数器决定。

### 测试方法

1. **设置测试条件**：
   - 设置 VIN 和 VOUT 为轻载条件，使芯片倾向于进入最大关断时间状态。
   - 例如空载、VIN 略高于 VOUT 的轻载条件。
2. **测量**：
   - 使用示波器测量 LX 上的最长的关断时间（从开关脉冲结束到下一个脉冲开始的时间间隔）。
   - 在 DCM 模式下，观察 skip 周期之间的最大间隔。
3. **Trim 调整**：
   - 调整 Max TOFF 定时器的 Trim Code。
   - 每次调整后测量最长的 TOFF，迭代到目标值。

### 注意事项

- Max TOFF 修调通常在空载或极轻载条件下进行，确保系统不会因频率过低进入可听频段。
- 不同的工作模式（Buck、Boost、Buck-Boost）下 Max TOFF 行为可能不同，需要在对应模式下分别验证。
- Max TOFF 过长可能导致输出纹波过大，过短会导致轻载效率下降。

---

## 6. EA Clamp LOW 修调 (Error Amplifier Low Clamp Trim)

### 原理

EA（Error Amplifier，误差放大器）的输出电压控制着 Buck-Boost 的 PWM 占空比。EA 输出 LOW 钳位（Low Clamp）是指 EA 输出电压能够达到的最低电平。

- EA 输出 LOW 在 Buck-Boost 中对应**电感谷值电流（Valley Current）** 的下限。
- 当 EA 输出被钳位在 LOW 时，PWM 比较器会限制占空比，使能量传递最小化。
- 对于 Buck 模式，EA LOW 钳位对应着峰值电流/谷值电流的下界。
- 修调 EA Clamp LOW 是为了确保在轻载或空载时，EA 不会进入饱和区过深，避免系统反应过慢导致输出过冲。
- 修调通过调整钳位二极管的偏置电流或钳位比较器的参考电压实现。

### 测试方法

1. **强制 EA 输出 LOW**：
   - 设置 VOUT 远高于目标值（例如强制过压条件），使 FB 反馈电压远高于 VREF，迫使 EA 输出饱和到 LOW。
   - 或者通过测试模式（Test Mode）直接读取 EA 输出节点。
2. **测量 EA 输出 LOW 电压**：
   - 直接测量 EA_OUT（如果有测试引脚）或通过内部 ADC 读取。
   - 如果无法直接测量，可以间接测量占空比/谷值电流。
3. **Trim 调整**：
   - 调整 EA Clamp LOW 的 Trim Code（通常是调整钳位电流或参考）。
   - 验证 EA 输出 LOW 电压是否达到目标值。

### 注意事项

- EA 输出 LOW 钳位与 EA 输出 HIGH 钳位是独立的两个电路，修调互不影响。
- 如果钳位过低，EA 恢复时间变长，可能导致负载瞬态响应恶化。
- 注意区分 EA 输出 LOW 电压与 EA 输入失调电压，两者不同。
- 部分设计中 EA 输出 LOW 钳位用于限制最小占空比，需与 Min TON/TOFF 配合验证。

---

## 7. EA Clamp HIGH 修调 (Error Amplifier High Clamp Trim)

### 原理

EA Clamp HIGH 是指 EA 输出电压能够达到的最高电平，它限制了 PWM 比较器允许的最大占空比，对应**电感峰值电流（Peak Current）** 的上限。

- EA 输出 HIGH 钳位相当于间接设置了峰值电流限制（Peak Current Limit）。
- 当系统需要大占空比（如 Boost 模式或者重载），EA 输出上升，HIGH 钳位决定了 EA 能拉高到的最大电平。
- 过高的 EA Clamp HIGH 可能导致过流，过低则限制输出带载能力。
- 修调原理与 LOW 钳位对称：调整钳位电路或参考电压。

### 测试方法

1. **强制 EA 输出 HIGH**：
   - 设置 VOUT 远低于目标值（例如强制欠压条件），使 FB 电压远低于 VREF，迫使 EA 输出饱和到 HIGH。
   - 或通过测试模式强制 EA 输出为 HIGH。
2. **测量 EA 输出 HIGH 电压**：
   - 直接测量 EA_OUT 电压或通过内部 ADC 读取。
   - 间接验证：观察占空比是否被限制在预期最大值。
3. **Trim 调整**：
   - 调整 EA Clamp HIGH 的 Trim Code。
   - 验证 EA 输出 HIGH 电压是否达到目标值。

### 注意事项

- EA Clamp HIGH 修调与系统的过流保护点（OCP）直接相关，修调后需要验证 OCP 是否仍然在规格内。
- 注意在 Buck 模式和 Boost 模式下，EA 的输出范围和控制关系可能不同，建议在两种模式下分别验证。
- EA HIGH 钳位电压过低会导致最大输出电流不足，尤其在高负载时。
- 与其他保护机制（如逐周期限流 Cycle-by-Cycle Current Limit）存在交互，需确认优先级。

---

## 8. BB 输出电压修调 (Output Voltage Trim)

### 原理

Buck-Boost 输出电压精度由内部参考电压 VREF 和反馈电阻分压网络共同决定：

- `VOUT = VREF × (1 + R1/R2)`，其中 R1、R2 是反馈分压电阻。
- 片上电阻和多晶硅电阻的工艺偏差会导致 R1/R2 比例偏移，从而使 VOUT 偏离目标值。
- 修调通过调整一个 **DAC 控制的参考电压** 或修调反馈分压电阻网络来实现。
- 典型做法是将 VREF 设计为一个可编程的电压源（通过 Trim Code 选择不同的 VREF 档位），从而微调输出电压。

### 测试方法

1. **设置带载条件**：
   - VIN 设为典型值。
   - 输出接额定负载（如 100mA 或数据手册中的修调负载条件）。
   - 使能 Buck-Boost 输出。
2. **测量输出电压**：
   - 使用高精度万用表（DMM）或 ATE 的电压测量单元在输出电容两端测量 VOUT。
   - 取稳定后的读数。
3. **Trim 调整**：
   - 读取输出电压误差：`VOUT_Target - VOUT_Measured`。
   - 根据误差查找 Trim Table（VREF DAC Code vs VOUT）。
   - 写入新的 Trim Code，重新测量，迭代到目标值 ± 允差（例如 ±1% 或 ±15mV）。

### 注意事项

- 输出电压修调建议在额定负载下进行，因为负载调节（Load Regulation）也会影响 VOUT。
- 修调时需要让输出电压稳定后再测量，特别是大输出电容时建立时间较长。
- 不同输出电压档位（例如 1.8V / 2.5V / 3.3V）可能需要各自独立的 Trim Code。
- 若芯片支持 I2C 动态电压调节（Dynamic Voltage Scaling, DVS），需确认所有电压点的精度。
- 反馈电阻修调和 VREF 修调不能混淆，需确认芯片采用的修调架构。

---

## 9. BB VO_DET 比较器修调 (Output Voltage Detector Comparator Trim)

### 原理

VO_DET（Voltage Output Detector）是用于监测 Buck-Boost 输出电压状态的比较器，用于产生以下标志：

- **PGOOD（Power Good）**：当 VOUT 在目标电压的 ±X% 范围内时置位。
- **OV（Overvoltage，过压保护）**：当 VOUT 超过某个阈值时触发保护。
- **UV（Undervoltage，欠压保护）**：当 VOUT 低于某个阈值时触发保护。

比较器的参考电压由一个分压网络和 DAC 生成。由于工艺误差，比较器的**输入失调电压（Input Offset Voltage）** 和分压网络的精度都需要通过修调来校准。

### 测试方法

1. **设置测试条件**：
   - Buck-Boost 输出配置为目标电压。
   - 可提供一个外部电源直接驱动 VOUT 引脚（Force VOUT），用于精确控制 VOUT 电平。
2. **扫描 VOUT，测量翻转点**：
   - 从低于目标电压开始，缓慢升高 VOUT。
   - 监控 VO_DET 输出（通常是 GPIO 电平或寄存器标志位）。
   - 记录 VOUT 升高时比较器翻转（如 PGOOD 从低变高）的电压点。
   - 再从高于目标电压开始缓慢降低 VOUT，记录另一个方向的翻转点（迟滞测量）。
3. **Trim 调整**：
   - 比较实测翻转点与设计目标值的差值。
   - 调整比较器失调 Trim Code 或分压网络 Trim Code。
   - 修调目标是使比较器的上下门限（含迟滞）对称于目标电压。

### 注意事项

- VO_DET 比较器通常设计有**迟滞**以避免噪声误触发。修调前需明确迟滞量是固定的还是可调的。
- 测试时 VOUT 变化速率要足够慢（quasi-static），避免比较器响应延迟导致测量误差。
- 比较器的传输延迟（Propagation Delay）会影响动态响应测试，但在静态 trim 时影响不大。
- 温度变化会引入比较器的失调漂移，建议高温和低温下进行 Corner 验证。

---

## 10. BB Sleep 比较器修调 (Sleep Mode Comparator Trim)

### 原理

Sleep 比较器是 Buck-Boost 在 **睡眠模式（Sleep Mode/PFM Mode）** 下使用的低功耗比较器。

- 在轻载或空载时，Buck-Boost 进入睡眠模式，通过一个低带宽、低功耗的比较器监控 VOUT 是否下降到阈值以下。
- 当 VOUT 跌落到 Sleep 阈值以下，比较器唤醒芯片，触发一个开关脉冲将 VOUT 拉回正常范围。
- 由于睡眠模式下静态电流极小（微安级），该比较器必须工作在极低功耗（nA 级偏置电流），因此其失调电压通常比正常比较器大。
- 修调目的是补偿比较器的固有失调，确保睡眠阈值准确。

### 测试方法

1. **进入睡眠模式**：
   - 设置输入电压，使能 Buck-Boost 输出。
   - 空载或极轻载（<1mA），等待芯片进入睡眠/PFM 模式。
   - 确认模式标志位或 LX 脉冲特征（稀疏脉冲）。
2. **施加外部电压或控制负载**：
   - **方法一（静态法）**：断开 Buck-Boost 输出与负载的连接，用外部电源精确控制 VOUT 引脚。
     - 从正常 VOUT 开始，缓慢降低外部电压。
     - 检测 Sleep 比较器的输出翻转点（芯片是否发出下一个开关脉冲）。
   - **方法二（动态法）**：连接电子负载，恒流拉载使 VOUT 自然跌落。
     - 测量 VOUT 上触发下一个开关脉冲时的电压谷值。
3. **Trim 调整**：
   - 调整 Sleep 比较器的 Offset Trim Code（通过 Current DAC 调整输入级的负载电流以抵消失调）。
   - 目标使比较器翻转点与设计 Sleep 阈值一致。

### 注意事项

- Sleep 比较器由于功耗极低，响应速度较慢，翻转点的测量需要足够的稳定时间。
- 睡眠模式阈值与正常工作模式阈值之间可能有切换逻辑，需确认没有逻辑干扰。
- 不同输出电容、ESR 会影响 VOUT 跌落速率，可能导致测得的触发电压有差异。
- 由于比较器电流极小，测试环境噪声和耦合噪声容易引起误触发，测试布局需注意屏蔽。

---

## 11. BB BK_MODE 比较器修调 (Buck/Boost Mode Comparator Trim)

### 原理

BK_MODE（Buck/Boost Mode Detection）比较器用于检测输入电压 VIN 与输出电压 VOUT 之间的关系，从而决定 Buck-Boost 变换器的工作模式：

- **Buck 模式**：VIN >> VOUT（降压模式）。
- **Boost 模式**：VIN << VOUT（升压模式）。
- **Buck-Boost 模式**：VIN ≈ VOUT（降压-升压过渡模式，部分时间段 Buck 部分工作，部分时间段 Boost 部分工作）。

模式切换由比较器检测 VIN 与 VOUT（或分压后的 VIN_SENSE 与 VOUT_SENSE）的比值决定。

- 比较器的参考电压由一个电阻分压网络产生，分压比经过精确设计。
- 工艺偏差导致分压网络和比较器本身存在失调，需要修调以确保模式切换在正确的 VIN/VOUT 比值下发生。
- 典型的模式切换点例如：
  - Buck→Buck-Boost 切换：VIN = VOUT + 200mV
  - Buck-Boost→Boost 切换：VIN = VOUT - 200mV
  （具体值由芯片设计决定）。

### 测试方法

1. **设置测试条件**：
   - VOUT 设置为固定值（例如 3.3V）。
   - VIN 从高于 VOUT 开始（确保为 Buck 模式），通过可编程电源或 ATE 的 VIN 通道控制。
2. **扫描 VIN，检测模式切换**：
   - **Buck → Buck-Boost 切换**：
     - 从高 VIN 开始逐步降低 VIN。
     - 检测 LX 波形或模式标志位：当 LX 波形中出现 Boost 部分（LX 在开关周期中出现负压或反相特征）时，或者模式寄存器标志位改变。
     - 记录切换时的 VIN 电压。
   - **Buck-Boost → Boost 切换**：
     - 继续降低 VIN。
     - 当 LX 波形不再出现 Buck 模式的开关特征，完全变为 Boost 特征时，记录切换 VIN。
   - 反向扫描同样做一遍，记录迟滞。
3. **Trim 调整**：
   - 调整 BK_MODE 比较器的参考电压 Trim Code 或失调 Trim Code。
   - 修调目标是使模式切换点 VIN 与设计目标值的偏差在允差范围内（例如 ±30mV）。

### 注意事项

- Buck-Boost 模式切换点存在原理性**迟滞（Hysteresis）**，避免在 VIN ≈ VOUT 时模式频繁切换。正向和反向的切换点不同，修调时需明确修调的是哪一个方向。
- 模式切换时输出电压可能出现短暂波动，测试时需要给足够的时间让输出稳定。
- 温度变化会影响比较器的失调，建议在典型温度下修调，在极限温度下验证。
- 负载电流也可能会影响模式切换点的实际表现，建议在典型负载下修调。
- 需确认芯片内部的模式切换逻辑是一步切换（直接 Buck↔Boost 切换）还是三步切换（Buck→Buck-Boost→Boost），以选择正确的修调策略。

---

## 附录：修调策略通用原则

### Trim Code 存储

- 修调值通常存储在 **OTP (One-Time Programmable) Memory** 或 **EFuse** 中。
- 修调流程：探针测试（CP Test）→ 计算 Trim Code → 写入 OTP/epoly → 在 FT（Final Test）中回读验证。
- 部分芯片支持 Packaging 后的二次修调。

### 修调优先级

- 先修调基准（VREF / IREF / VBG），再修调 Buck-Boost 相关项。
- 输出电压修调建议在 EA Clamp 修调之后进行，因为 EA Clamp 范围会影响输出的实际控制能力。

### 数据记录

- 每次修调应记录：Die ID、Trim Code、修调前后测量值、温度、测试时间。
- 用于良率分析（Yield Analysis）和后续工艺改进（Process Improvement）。

---

> 本文档对应 Trim.md 中 `BUCKBOOST修调` 章节的 11 项修调内容，是 CP/FT 测试工程师进行相关修调项开发和调试的参考指南。
