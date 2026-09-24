---
title: "PMU 架构与测试"
tags:
  - pmic
  - pmu
  - system
  - ate
created: 2026-07-17
---

# PMU 架构与测试

---

## 一、PMU 测试的核心挑战

相比单一模块，PMU 测试有独特的复杂性：

### 1. 多轨协同

```
时序要求:
VOUT_A (Buck1):  ──┐      ┌────────────
                   │      │
VOUT_B (LDO1):    ───┐   ┌┴────────────
                     │   │
VOUT_C (Buck2):     ───┐│──────────────
                       ││
VOUT_D (Boost):       ─┘└─────────────

                    t0  t1  t2  t3
```

每路输出有严谨的 **Power Sequencing** 要求。

### 2. 交叉耦合

- Buck1 的负载变化 → LDO1 输入电压波动 → LDO1 输出影响
- Charger 工作时 → 电池供电轨的噪声干扰
- 多路 Buck 同时开关 → 地弹 (Ground Bounce)

### 3. 热管理

- 多路同时输出 → 总功耗大
- 热分布不均匀 (热点 Hot Spot)
- 封装热阻限制

### 4. 测试时间

- 多路输出 → 测试项多 → 测试时间长
- CP 和 FT 测试时间直接影响成本

---

## 二、PMU ATE 测试策略

### 2.1 Parallel vs Sequential

| 策略 | 优点 | 缺点 |
|------|------|------|
| **Sequential (串行)** | 简单、可靠 | 测试时间长 |
| **Parallel (并行)** | 时间短 | 资源多、干扰复杂 |
| **Hybrid** | 折中 | 需精心设计 |

### 2.2 常见 Hybrid 策略

```
Phase 1: 上电 + 数字 (所有模块)
  - I2C Verify
  - Register Default Check

Phase 2: 并行测基础 DC
  - 各 Buck VOUT (同时测)
  - 各 LDO VOUT (同时测)
  - Iq / Isd (分别测)

Phase 3: 串行测性能
  - 每个 Buck 的 Ton/Fsw
  - 每个 LDO 的 Load Reg
  - 保护功能

Phase 4: 特殊功能
  - Charger (需要电池模拟)
  - OTP Program
  - Trim Verify
```

---

## 三、PMU 特定测试项

### 3.1 Power Sequencing

```
条件: 所有 EN 按指定时序
步骤:
  1. 配置各 rail 的 delay register
  2. 发送全局使能 (Global EN)
  3. 用多通道示波器/捕获每个 VOUT 上升沿
  4. 测量各 rail 之间的延迟
  5. 确认在规格窗口内
```

### 3.2 Cross Regulation

```
条件: Buck1 满负载, Buck2 空载
步骤:
  1. 设定 VOUT_Buck2 固定
  2. 跳变 Buck1 负载 (10%→90%)
  3. 测量 Buck2 VOUT 变化
判断: 交叉影响 < 规格值
```

### 3.3 Total Supply Current

```
条件: 所有模块使能, 各负载轻载
步骤:
  1. 测量 VIN_BAT 总输入电流
  2. 减去各输出电流之和
  3. 总 Iq = IIN_total - Σ(IOUT*VOUT/VIN)
```

### 3.4 Global Protection

```
条件: 某一路 OCP
步骤:
  1. 使能所有输出
  2. 逐步加载某一路到过流
  3. 观察: 该路限流
  4. 确认: 其他路不受影响
  5. 过流解除后恢复
```

---

## 四、硬件设计考虑

PMU 的 DIB/DUT Board 设计比单模块复杂：

| 需求 | 方案 |
|------|------|
| 多路大电流 | 多层 PCB, 加厚铜皮, Kelvin 连接 |
| 多通道测量 | ATE 资源复用 (Relay Matrix) |
| 动态负载 | 板上电子负载 + 快速切换 |
| 时序观测 | 多通道示波器 / 并行 TMU |
| 热管理 | Heatsink / 风冷 / 液冷 |
| 电源去耦 | 多级去耦电容 (bulk + decoupling) |

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_测试项目总览|Buck 测试项目]]
- [[30.areas/PMIC/Power_Sequencer/_index|Power Sequencer]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
- [[30.areas/PMIC/Thermal/_index|热管理]]
