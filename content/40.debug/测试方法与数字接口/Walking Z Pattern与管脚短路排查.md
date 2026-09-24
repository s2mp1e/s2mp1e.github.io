---
title: "Walking Z Pattern 与管脚短路排查"
tags:
  - ATE测试方法/OS
  - Pattern
---

# Walking Z Pattern 与管脚短路排查

**来源：** 用户提供的 Walking Z 问答。实际测试序列按项目 Pattern 和 Pin Electronics 配置确认。

## 概念

Walking Z 通常逐个释放 / 改变 Pin 状态，使相邻 Pin 或 Pin 与电源轨之间的意外连接更容易显现。`Z` 常表示高阻状态，但其具体电气行为由资源配置决定。

```mermaid
flowchart LR
  A[所有相关Pin设为规定初态] --> B[选中Pin 1进入Z]
  B --> C[其他Pin保持定义状态]
  C --> D[检查Pin间及电源轨响应]
  D --> E[轮换到下一个Pin]
  E --> B
```

## 可能检出的连接

| 故障类型 | 需要的状态组合 |
|---|---|
| Pin 与邻近 Pin 短路 | 一端驱动 / 终端，另一端按序释放或改变状态 |
| Pin 与 VDD 短路 | Pin 状态与电源轨形成可区分的偏置 / 量测条件 |
| Pin 与 VSS 短路 | Pin 状态与地形成可区分的偏置 / 量测条件 |

## 调试建议

确认每一步的被测 Pin、其余 Pin 状态、Z 的实际电气定义、等待时间、Active Load / PPMU 路径和比较阈值。Walking Z 的覆盖能力由序列和硬件实现决定，不能只看名称判断。
