---
title: "Buck Ton 与 ACT TIME 测试"
tags:
  - pmic
  - buck
  - timing
  - ate
created: 2026-07-17
---

# Buck Ton 与 ACT TIME 测试详解

> 本文基于实际 ATE 测试场景，详细拆解 Buck Converter 中 **Ton Test** 和 **ACT TIME Test** 的定义、测量方法和区别。

---

## 一、核心区别速览

| 对比项 | Ton Test | ACT TIME Test |
|--------|----------|---------------|
| **测量对象** | 单个开关周期 HS MOS 导通时间 | 整个 Buck 启动过程时间 |
| **时间尺度** | **ns 级** | **μs ~ ms 级** |
| **起始点** | SW 上升沿 | EN / Start 信号有效 |
| **结束点** | SW 下降沿 | VOUT 达到规定电压 |
| **主要涉及模块** | Ton Timer, RC, Gate Driver, MOS | UVLO, Soft Start, Control Logic, Power Stage, Output Cap |
| **典型修调** | RC Ton Trim | 通常不 Trim，只验证 |
| **测试目的** | 验证开关时序 / RC Ton | 验证启动响应 / 软启动行为 |

> 💡 **一句话记忆**: Ton 是"控制器决定开多久"的精度测试；ACT TIME 是"Buck 启动要花多久"的性能测试。

---

## 二、Ton 测试详解

### 2.1 物理含义

Buck 正常工作时，每个开关周期中 High-Side MOS 保持导通的时间：

```
SW:
VIN ─────┐      ┌─────
         │      │
         │      │
0V ──────└──────┘

         ↑      ↑
       t_rise  t_fall

          ← Ton →
```

$$
T_{ON} = t_{SW\_fall} - t_{SW\_rise}
$$

### 2.2 Ton 的架构依赖性

| 控制模式 | Ton 决定方式 |
|----------|-------------|
| **固定频率 PWM** | Ton = D × Tsw (D 由反馈环路决定) |
| **COT (Constant On-Time)** | 由内部 **RC Timer** 直接决定 |
| **COT with PLL** | RC Timer 被 PLL 同步到固定频率 |

### 2.3 ATE 测试方法

```
方法 1: Timing Measurement (ATE 资源)
  - 使用 ATE 的 timing 测量单元
  - 直接测量 SW 波形的脉冲宽度
  - 精度可达几百 ps

方法 2: 频率计数器
  - 测量 Fsw 和 Duty
  - Ton = Duty × Tsw

方法 3: Digital Capture
  - 高速采样 SW 波形
  - 软件计算脉冲宽度
```

### 2.4 测试条件示例

```
VIN = 5V
VOUT = 1V (通过反馈设置)
IOUT = 100mA (轻载)
Fsw = 1MHz (目标)

预期 Ton = (VOUT / VIN) × Tsw = 0.2 × 1μs = 200ns

测量结果:
  Chip A: Ton = 198ns ✓
  Chip B: Ton = 203ns ✓
  Chip C: Ton = 187ns ✗ (超出 -3σ)
```

### 2.5 RC Ton Trim 的关系

当 Ton 精度不达标时，通常通过 **RC Ton Trim** 修正：

```
Trim 前: Ton = 92ns (目标 100ns) → Trim Code=0
Trim 后: Ton = 99ns              → Trim Code=4

判断: PASS (Limit: 95ns ~ 105ns)
```

---

## 三、ACT TIME 测试详解

### 3.1 物理含义

Buck 从收到启动命令到输出电压建立到规定值所经过的**总时间**：

```
EN:
      ┌────────────────
──────┘
      ↑ t0

VOUT:
               ┌──────── Target
              /
             /
            /
────────────┘
            ↑ t1

     ← ACT TIME = t1 - t0 →
```

### 3.2 ACT TIME 内部经历了什么？

```
EN 有效
  ↓
UVLO 确认（输入电压是否足够）
  ↓
Bias 电路启动（内部供电建立）
  ↓
Soft Start 开始（参考电压/电流逐步上升）
  ↓
HS MOS 开始开关（Ton 逐步展开）
  ↓
电感开始储能 → VOUT 逐步上升
  ↓
VOUT 达到目标电压
  ↓
PG (Power Good) 信号有效
```

### 3.3 ACT TIME 的组成

$$
T_{ACT} = T_{logic\_delay} + T_{soft\_start} + T_{charge} + T_{loop\_settle}
$$

| 组成部分 | 典型值 | 影响因素 |
|----------|--------|---------|
| 控制逻辑延迟 | 几 μs | 芯片设计 |
| Soft Start 时间 | 100μs ~ 1ms | Soft Start 斜率、SS 电容 |
| 输出充电时间 | 100μs ~ 几 ms | COUT、负载、电感、Ton |
| 环路建立时间 | 几 μs ~ 几十 μs | 环路补偿 |

### 3.4 ATE 测试方法

```
方法 1: EN → VOUT 阈值比较
  1. 置 EN = HIGH
  2. 启动 Timer
  3. 监测 VOUT 通过比较器
  4. VOUT 达到目标阈值 → 停止 Timer
  5. ACT TIME = Timer 值

方法 2: EN → Power Good
  1. 置 EN = HIGH
  2. 启动 Timer
  3. 监测 PG 信号上升沿
  4. PG 上升 → 停止 Timer
  5. ACT TIME = Timer 值
```

### 3.5 测试条件示例

```
VIN = 5V
VOUT_TARGET = 3.3V
COUT = 10μF
ILOAD = 0mA (空载)
SS_TIME = 500μs (目标)

ACT TIME: 从 EN 上升 → VOUT 达到 3.3V × 90% = 2.97V

预期: ~550μs (SS 500μs + 开销 50μs)
Limit: MAX 1ms

测量: 512μs → PASS
```

---

## 四、Ton 和 ACT TIME 的关联性

虽然两者不同尺度，但存在间接关系：

```
Ton
  ↓
每周期传递能量 (E ≈ VIN × Ton × I_L_avg)
  ↓
电感电流上升斜率
  ↓
VOUT 上升速度 (dVOUT/dt = I_COUT / COUT)
  ↓
ACT TIME
```

**如果 Ton 异常**：
- Ton 过短 → 每周期能量不足 → VOUT 上升慢 → ACT TIME 拉长
- Ton 过长 → 电感电流过大 → VOUT 可能过冲 → 启动异常

---

## 五、ATE 测试程序示例

### Ton 测试伪代码

```
// Ton Test - PWM mode
void Ton_Test() {
    // 1. Setup conditions
    Set_VIN(5.0);
    Set_EN(HIGH);
    Wait(100us);  // Wait for stable switching

    // 2. Measure Ton
    for (i=0; i<16; i++) {
        ton[i] = Measure_PulseWidth(SW, HIGH);
    }
    ton_avg = Average(ton);
    ton_min = Min(ton);
    ton_max = Max(ton);

    // 3. Judge
    if (ton_avg > TON_LOW_LIMIT && ton_avg < TON_HIGH_LIMIT) {
        TEST_RESULT = PASS;
    } else {
        TEST_RESULT = FAIL;
    }
}
```

### ACT TIME 测试伪代码

```
// ACT TIME Test - Startup Time
void ACT_TIME_Test() {
    // 1. Setup conditions
    Set_VIN(5.0);
    Set_EN(LOW);
    Wait(100us);  // Ensure discharge

    // 2. Start measurement
    timer_start = Get_System_Time();
    Set_EN(HIGH);

    // 3. Wait for VOUT ready
    while (VOUT < VOUT_TARGET * 0.9) {
        // Wait comparator
    }
    timer_stop = Get_System_Time();

    // 4. Calculate
    act_time = timer_stop - timer_start;

    // 5. Judge
    if (act_time < ACT_TIME_MAX_LIMIT) {
        TEST_RESULT = PASS;
    } else {
        TEST_RESULT = FAIL;
    }
}
```

---

## 六、常见问题 / FAQ

### Q1: ACT TIME 和 Ton 有可能测同一个东西吗？
**不会**。两者时间尺度差 1000 倍以上 (ns vs μs~ms)，完全不同的电路行为。

### Q2: 启动过程中 SRAM 怎么写？
如果 Ton 测试是在 ATE 的 **Functional Test** 中，启动后需要先写入寄存器配置（如 Trim 值、Mode 设置），再测稳态 Ton。

### Q3: 为什么我的 Ton 在不同的 IOUT 下不一样？
在 PWM 模式下 Ton ≈ D × Tsw 基本不变；但在 PFM/PSM 轻载模式下，Ton 可能随负载变化。

### Q4: ACT TIME 过长可能是什么原因？
- Soft Start 斜率过缓
- COUT 过大
- 负载过重导致充电慢
- Ton 过小导致能量传递不足
- UVLO 或 Bias 启动延迟

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_基本原理|Buck 基本原理]]
- [[30.areas/PMIC/Buck/Buck_测试项目总览|Buck 测试项目总览]]
- [[Clippings/异步与同步Buck对比]] — 基础文章来源
