---
title: "PC Wafer 与 FAB 制程监控流程"
tags:
  - FAB制造
  - 工艺监控
---

# PC Wafer 与 FAB 制程监控流程

**来源：** 用户提供的制造流程问答。PC Wafer 的缩写和用途可能随 FAB 定义不同，应以厂内流程为准。

## 监控流程示意

```mermaid
flowchart LR
  W[PC Wafer / 监控样片] --> VIS[外观与缺陷检查：AOI等]
  W --> DIM[尺寸 / 薄膜量测：如CD、Film]
  W --> ELEC[WAT / PCM电性测试]
  VIS --> DB[制程数据汇总]
  DIM --> DB
  ELEC --> DB
  DB --> SPC[SPC趋势与控制界限]
  SPC --> DEC{是否有漂移 / 异常?}
  DEC -- 是 --> ADJ[工艺调查与调整]
  ADJ --> W
  DEC -- 否 --> MON[持续监控]
```

## 调试理解

- AOI 等光学 / 缺陷设备主要观察可见缺陷或图形状态；WAT / PCM 主要观察电性结构或参数。两类数据回答的问题不同。
- PC Wafer 可用于过程监控、设备 / 工艺验证或其他厂内目的，不能未经确认就等同于产品晶圆或所有 FAB 通用定义。
- ATE / WAT 数据需记录测试结构、Site、温度、仪器校准、时间和工艺批次，才能与工艺数据可靠关联。

## 排查建议

发现电性漂移时，先核对结构和测试方法、设备校准、接触与温控，再结合 AOI / 薄膜 / CD 等数据判断是否为制程变化。
