---
title: "异步与同步Buck对比"
source: "https://chatgpt.com/c/6950e939-27c4-8324-af72-760017887cfb"
author:
published:
created: 2026-07-17
description: "ChatGPT conversation with 5 messages"
tags:
  - "clippings"
---
在 Buck 的测试里， **Ton 测试** 和 **ACT TIME（Actual Time，实际时间）测试** 有时容易混淆。核心区别是：

> **Ton 测试：测一个开关周期内，高边 MOS 实际导通了多长时间。**  
> **ACT TIME 测试：测控制器内部设定/产生的实际导通时间，或者实际的开关动作时间。**

但这里要特别注意： **ACT TIME 的具体定义取决于芯片设计和测试程序命名** 。不同公司的测试程序中， `ACT_TIME` 可能指不同节点或不同时间参数。结合你前面提到的 **RC Ton Trim** ，大概率可以这样理解。

---

以 Buck 为例：

```
SW

VIN ────┐      ┌────
        │      │
        │      │
0V ─────└──────┘

        ← Ton →
```

当高边 MOS 导通：

```
VIN
 │
High-Side MOS ON
 │
SW ≈ VIN
```

当高边 MOS 关闭：

```
SW ≈ 0V
```

所以 Ton 通常定义为：

$$
T_{ON}=t_{SW\_fall}-t_{SW\_rise}
$$

也就是：

```
SW上升沿 ───────── SW下降沿
    ↑                  ↑
    │<------ Ton ----->│
```

测试方法可能是：

- 示波器测量
- ATE Timing Measurement
- Frequency Counter
- Digital Capture

例如：

```
目标 Ton = 100 ns

实际测量：
Ton = 103 ns
```

然后判断：

```
Ton Limit：95 ns ~ 105 ns
PASS
```

---

## 2\. ACT TIME 是什么？

如果你们程序里的 `ACT_TIME` 是和 **RC Ton Trim** 配套的，那么它通常更接近：

> **芯片内部实际产生的 On-Time / Active Time。**

可以理解为：

```
控制器内部：

TON Timer
    │
    ▼
Gate Control
    │
    ▼
High-Side MOS
    │
    ▼
SW Node
```

其中：

```
内部产生的时间 → ACT TIME
```

而：

```
SW节点实际波形 → Ton
```

因此二者可能不是完全同一个测量点。

---

## 3\. 最简单的区别

| 项目 | Ton Test | ACT TIME Test |
| --- | --- | --- |
| 测量对象 | SW节点导通时间 | 控制器内部实际时间/动作时间 |
| 关注点 | Power Stage实际开关时间 | Control Logic/Timer实际产生时间 |
| 测量位置 | 外部SW波形 | 内部测试节点或内部状态 |
| 主要影响 | 开关频率、占空比 | Ton Timer、RC Timer、控制逻辑 |
| 常见用途 | 验证实际Buck工作时序 | RC Ton Trim/内部时序校准 |

---

## 4\. 为什么两者可能不一样？

假设内部控制器设定：

```
ACT TIME = 100 ns
```

但经过：

```
控制逻辑
    ↓
Gate Driver Delay
    ↓
MOS Turn-on Delay
    ↓
MOS Turn-off Delay
    ↓
SW波形
```

最终外部测得：

```
Ton = 103 ns
```

所以：

$$
T_{ON,SW}
\neq
T_{ACT}
$$

可以粗略理解为：

$$
T_{ON,SW}
=
T_{ACT}
+
T_{driver}
+
T_{MOS}
$$

因此：

> **ACT TIME更偏“控制器产生了多久的有效动作时间”，Ton更偏“外部功率管真正导通了多久”。**

---

## 5\. 和 RC Ton Trim 的关系

你前面问到的 **RC Ton Trim** ，通常就是修调内部的时间基准：

```
RC Timer
   │
   ▼
ACT TIME
   │
   ▼
Gate Driver
   │
   ▼
SW
   │
   ▼
Ton
```

所以测试流程可能是：

### 第一步：ACT TIME 测试

检查：

```
内部 Timer是否准确
```

例如：

```
ACT_TIME = 100 ns
```

### 第二步：Ton 测试

检查：

```
实际SW波形是否符合要求
```

例如：

```
Ton = 103 ns
```

这两个测试可能分别用于：

- **ACT TIME：验证内部RC/Timer**
- **Ton：验证整个Power Stage实际时序**

---

## 用一句话记忆

> **ACT TIME 是“控制器决定开多久”；Ton 是“功率开关实际开了多久”。**

不过如果你能把你们测试程序里 **`ACT TIME` 的具体测试名称、测试条件，或者对应的 Datasheet/ATE code 片段** 发给我，我可以进一步帮你判断它在你们这颗 Buck 里的准确含义——因为不同芯片的 `ACT_TIME` 命名确实可能不完全一样。

---

ACT TIME不是指测buck的启动时间吗

---

对，你说得对。\*\*如果你们测试程序中的 `ACT TIME` 是在 Buck 启动测试（Startup）模块里，那它通常就是测 Buck 的实际启动时间，而不是我前面说的内部 On-Time。\*\*我前面的解释把 `ACT TIME` 和另一类“Active/Actual On-Time”概念混在了一起了。

## ACT TIME：测 Buck 启动时间

典型过程：

```
EN / Enable
    │
    │ t0
    ▼
Buck开始启动
    │
    │ Soft Start
    │
    ▼
VOUT达到规定电压
    │ t1
```

测试：

$$
T_{ACT}=t_1-t_0
$$

例如：

```
EN ↑
  │
  ├───────────────┐
                  │ VOUT达到90%
                  │
                  ▼

       ← ACT TIME →
```

假设：

- EN 上升沿：0 μs
- VOUT 达到目标值的90%：500 μs

则：

```
ACT TIME = 500 μs
```

---

## 它和 Ton 测试的区别

| 项目 | Ton Test | ACT TIME Test |
| --- | --- | --- |
| 测量对象 | 单个开关周期的高边MOS导通时间 | Buck从启动到输出建立的时间 |
| 时间尺度 | ns级 | μs～ms级 |
| 起始点 | SW上升沿 | EN、启动命令或内部Start信号 |
| 结束点 | SW下降沿 | VOUT达到规定电压 |
| 主要反映 | 开关时序/RC Ton | Soft Start、启动控制、环路建立 |
| 典型用途 | RC Ton Trim、频率测试 | Startup Time、Soft Start验证 |

---

### 用波形看：

#### Ton：

```
SW：

     ┌──────┐
─────┘      └─────
     ← Ton →
```

只看一个周期：

```
Ton ≈ 100ns
```

---

#### ACT TIME：

```
EN：

     ┌────────────
─────┘
     ↑ t0

VOUT：

          /────────
         /
        /
───────┘
        ↑ t1
```

测：

```
ACT TIME = t1 - t0
```

---

所以在你们的 Buck 测试语境下可以直接记：

> **Ton 是“每个周期高边管开多久”；ACT TIME 是“Buck启动后，输出电压建立需要多久”。**

另外， `ACT TIME` 的具体起止点仍要看你们芯片的测试定义，例如可能是：

- EN 上升沿 → VOUT达到90%
- EN上升沿 → Power Good有效
- Start command → VOUT达到目标值
- VIN达到UVLO → VOUT建立

但 **本质上都是启动时间类参数** 。

---

详细描述buck的Ton测试是在测什么，ACT TIME测试又在测什么，区别是什么

---

可以。结合你前面说的 **RC Ton 修调** 和 **Buck Startup / ACT TIME 测试** ，这两个测试虽然都测“时间”，但测的是 **完全不同的时间尺度和电路行为** 。

---

## 一、先看 Buck 的两个时间尺度

Buck 工作时同时存在两个层级：

```
① 启动过程：μs ～ ms
EN ──────► Buck开始工作 ──────► VOUT建立
              ↑
           ACT TIME
```

启动以后：

```
② 正常开关过程：ns ～ μs

SW：
     ┌──────┐      ┌──────┐
─────┘      └──────┘      └──
     ← Ton →
```

所以：

> **ACT TIME 看“Buck从启动到输出建立用了多久”；Ton 看“正常工作时每个开关周期的高边开关导通多久”。**

---

## 二、Ton测试到底在测什么？

## 1\. Ton的物理含义

以同步 Buck 为例：

```
VIN
    │
┌───┴───┐
│ High  │
│ MOS   │
└───┬───┘
    │ SW
    │
    L
    │
  VOUT
```

当 High-Side MOS 打开：

```
VIN → High-Side MOS → SW → L → VOUT
```

此时：

```
SW ≈ VIN
```

当 High-Side MOS 关闭：

```
SW下降
```

因此：

```
SW：

VIN ─────┐      ┌─────
         │      │
         │      │
0V ──────└──────┘

         ↑      ↑
         │      │
       t_start t_end

          ← Ton →
```

Ton就是：

$$
T_{ON}=t_{end}-t_{start}
$$

也就是：

> **High-Side MOS每一个开关周期实际保持导通的时间。**

---

## 三、Ton由什么决定？

在不同架构中，Ton的来源不同。

## 固定频率PWM

大致：

$$
D=\frac{T_{ON}}{T_{SW}}
$$

所以：

$$
T_{ON}=D\times T_{SW}
$$

例如：

```
fsw = 1 MHz
Tsw = 1 μs
Duty = 30%
```

那么：

```
Ton = 300 ns
```

---

## COT / Constant On-Time

在 COT 架构中，Ton可能由：

```
RC Timer
   ↓
Ton Control
   ↓
Gate Driver
   ↓
High-Side MOS
```

决定。

这就是你前面提到的：

> **RC Ton Trim**

如果内部RC存在工艺偏差：

```
目标：100 ns

实际：
Chip A：95 ns
Chip B：108 ns
```

就需要通过：

```
Ton Trim
```

修正。

---

## 四、Ton测试的实际目的

Ton测试主要验证：

### ① RC Ton是否准确

例如：

```
Target = 100 ns
Actual = 102 ns
```

检查是否在规格范围内。

---

### ② 开关频率是否正常

对于固定输入输出条件：

$$
f_{SW}\approx\frac{V_{OUT}}{V_{IN}\times T_{ON}}
$$

例如：

```
VIN = 5V
VOUT = 1V
Ton = 100ns
```

理想情况下：

$$
D\approx20\%
$$

如果 Ton 偏大：

```
Ton ↑
→ Duty ↑
→ 开关频率可能发生变化
→ 电感电流纹波变化
```

---

### ③ 检查开关时序

Ton异常可能意味着：

- RC Timer偏差
- Ton Trim错误
- Comparator问题
- Gate Driver延迟异常
- MOS开关异常
- 温度导致的时序漂移

---

## 五、ACT TIME测试到底测什么？

按照你们测试程序的定义， **ACT TIME是Buck的启动时间（Actual Startup Time）** 。

它不是一个开关周期内的时间，而是：

> **从Buck收到启动条件，到输出电压建立到规定值所经过的时间。**

例如：

```
EN：

      ┌────────────────
──────┘
      ↑
      t0
```

Buck开始启动：

```
VOUT：

             ┌──────── Target
            /
           /
          /
──────────┘
          ↑
          t1
```

那么：

$$
T_{ACT}=t_1-t_0
$$

例如：

```
EN上升：0 μs
VOUT达到90%：500 μs
```

则：

```
ACT TIME = 500 μs
```

---

## 六、ACT TIME中间经历了什么？

ACT TIME并不是简单的“EN到VOUT”的空白时间。

在这段时间内，Buck可能经历：

```
EN有效
  ↓
UVLO确认
  ↓
Bias电路启动
  ↓
Soft Start开始
  ↓
High-Side MOS开始开关
  ↓
电感开始储能
  ↓
VOUT逐步上升
  ↓
达到目标电压
  ↓
PG有效
```

因此 ACT TIME 反映的是整个启动链路：

```
ACT TIME
=
控制逻辑延迟
+
Soft Start时间
+
输出充电时间
+
环路建立时间
```

粗略可以这样理解。

---

## 七、Ton和ACT TIME的核心区别

| 对比项 | Ton Test | ACT TIME Test |
| --- | --- | --- |
| **测量对象** | 单个开关周期的导通时间 | 整个Buck启动过程 |
| **时间尺度** | ns级 | μs～ms级 |
| **起始点** | SW上升沿 | EN/Start有效 |
| **结束点** | SW下降沿 | VOUT达到规定电压 |
| **主要涉及模块** | Ton Timer、RC、Gate Driver、MOS | UVLO、Soft Start、Control Logic、Power Stage、Output Cap |
| **典型修调** | RC Ton Trim | 通常不是直接Trim，而是验证启动时间 |
| **测试目的** | 验证开关时序 | 验证启动响应和软启动行为 |

---

## 八、用一个完整波形看

```
EN：

          ┌────────────────────────
──────────┘
          ↑
          │
          │←──────── ACT TIME ────────→│
          │                             │
          │                             │
VOUT：    │                       ┌─────
          │                    ／
          │                 ／
          │              ／
──────────┴─────────────┘
                                ↑
                            VOUT达到目标

SW：

              ┌──┐    ┌──┐    ┌──┐
──────────────┘  └────┘  └────┘  └──
              ←Ton→
```

你可以看到：

- **ACT TIME** ：从 EN 开始，到 VOUT 建立
- **Ton** ：SW波形中某一个高电平脉冲的宽度

两者完全不是一个层级的参数。

---

## 九、为什么ACT TIME也会受到Ton影响？

虽然两个测试不同，但它们不是完全没有关系。

启动过程中，Buck需要不断开关：

```
Ton
  ↓
每个周期传递的能量
  ↓
电感电流上升
  ↓
VOUT上升速度
  ↓
ACT TIME
```

所以如果：

```
Ton太短
```

可能：

```
每周期传输能量不足
→ VOUT上升慢
→ ACT TIME变长
```

如果：

```
Ton太长
```

可能：

```
电感电流上升过快
→ VOUT过冲
→ 启动行为异常
```

但是：

> **Ton是启动过程中影响ACT TIME的一个因素，而ACT TIME是整个启动过程的最终结果。**

---

## 最后一句话总结

> **Ton测试测的是Buck正常工作时“一个开关周期内High-Side MOS导通了多久”，主要验证RC Ton/开关时序；ACT TIME测试测的是“从Buck接收到启动命令到VOUT建立所花的总时间”，主要验证Soft Start、启动逻辑和输出建立过程。**

对于你做 ATE，可以把它们分别理解为：

```
Ton Test：
时间精度测试
↓
RC Ton Trim / Switching Timing
```
```
ACT TIME：
启动性能测试
↓
Startup / Soft Start / VOUT Rise Time
```

如果你把你们实际 **Ton 和 ACT TIME 的测试条件、limit、测试程序名称或者测试波形** 发给我，我还可以进一步按照你们芯片的实际测试流程，帮你拆解每一个 timing edge 到底是怎么定义的。