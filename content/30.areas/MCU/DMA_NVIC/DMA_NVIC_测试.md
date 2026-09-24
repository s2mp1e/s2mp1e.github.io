---
title: "DMA/NVIC 测试详解"
tags:
  - mcu
  - dma
  - nvic
  - interrupt
  - ate
created: 2026-07-18
---

# DMA / NVIC 测试详解

---

## 一、DMA 测试

### 1.1 DMA 原理

```
DMA (Direct Memory Access):

无 DMA:  CPU 读外设 → 写内存 (每字节 CPU 参与)
有 DMA:  外设 ↔ 内存 直接搬运 (CPU 解放)

DMA 控制器:
  ├── 通道 0: ADC → SRAM
  ├── 通道 1: UART TX ← SRAM
  ├── 通道 2: SPI → SRAM
  ├── 通道 3: SRAM → SRAM
  └── ...
```

### 1.2 DMA 关键测试

```
① Memory-to-Memory 传输:
   - 源: SRAM 区域 A (测试 Pattern)
   - 目的: SRAM 区域 B
   - 传输 N 字节
   - 完成后比对 A 和 B → 完全一致

② Peripheral-to-Memory 传输:
   - 外设数据 (如 ADC 结果) → SRAM
   - 验证数据正确性

③ Memory-to-Peripheral 传输:
   - SRAM → UART TX
   - ATE 接收验证

④ 传输模式:
   - Normal 模式 (单次)
   - Circular 模式 (循环, 用于 ADC 连续采集)
   - 半传输中断 (Half Transfer)
   - 传输完成中断 (TC)

⑤ 地址递增模式:
   - 源/目的地址各自递增/固定
   - 如: 固定外设地址 + 递增内存地址

⑥ 传输宽度:
   - Byte / Half-word / Word 传输
```

### 1.3 DMA 测试方法

```
通过 Test Firmware 实现:

测试程序:
  ① 初始化 DMA (通道/方向/宽度/模式)
  ② 源地址写入测试 Pattern
  ③ 启动 DMA
  ④ 等待完成中断 (或轮询标志)
  ⑤ 读回目的地址数据
  ⑥ 与源数据比对

ATE 侧: 通过 UART/SWD 读取测试结果
```

---

## 二、NVIC 中断控制器测试

### 2.1 NVIC 原理 (Cortex-M)

```
NVIC (Nested Vectored Interrupt Controller):

特性:
  • 优先级分组 (抢占优先级 + 子优先级)
  • 尾链 (Tail-Chaining) 优化
  • 迟来 (Late-Arriving) 优化
  • 中断向量表 (Vector Table)

中断响应:
  CPU 收到中断请求 → 查向量表 → 跳转 ISR
  典型响应时间: 12~16 周期 (Cortex-M3/M4)
```

### 2.2 关键测试

```
① 中断触发与响应:
   - 触发外设中断 (如 GPIO 外部中断)
   - 验证 ISR 执行 (标志置位)
   - 验证返回后程序继续

② 优先级抢占:
   - 低优先级 ISR 执行中
   - 触发高优先级中断
   - 高优先级 ISR 打断低优先级
   - 返回后低优先级继续

③ 中断响应时间:
   - 触发中断到 ISR 第一条指令的时间
   - 测量: GPIO 触发 → ISR 置位引脚
   - 典型: 12~16 周期 + 系统开销

④ 向量表正确性:
   - 每个中断源对应正确 ISR
   - 触发各中断源 → 各自 ISR 执行

⑤ 中断嵌套深度:
   - 多级嵌套 (3 级+)
   - 正确返回
```

### 2.3 测试实现

```
测试程序:
  ① 配置 NVIC (优先级/使能)
  ② 配置中断源 (GPIO/UART/Timer)
  ③ ATE 触发中断源 (如 GPIO 脉冲)
  ④ ISR 中: 置位测试标志引脚 / 写测试变量
  ⑤ 测试程序读取验证

注意:
  • 中断测试需要精确时序控制 (ATE 数字通道)
  • ISR 执行时间测量需要引脚事件标记
```

---

## 三、SysTick 测试

```
SysTick (Cortex-M 核心定时器):

测试:
  ① 配置 SysTick = 1ms 周期
  ② 循环读取计数值
  ③ 验证 1ms 中断周期
  ④ 精度: ±1 周期 (核心时钟精度)

应用:
  • RTOS 时基
  • 延时函数
```

---

## 四、异常处理测试

```
Cortex-M 异常测试:

① HardFault 触发:
   - 访问非法地址 → HardFault
   - 验证进入 HardFault Handler

② 除零异常 (M4F/M7):
   - 浮点除零 → 异常 (配置后)

③ 未定义指令:
   - 执行非法指令 → HardFault/UsageFault

④ 栈溢出 (如支持):
   - 栈指针越界 → 异常
```

---

## 参考资料

- [[30.areas/MCU/Digital_Peripheral/GPIO_UART_SPI_测试|外设测试]] — 中断源 (GPIO/Timer)
- [[30.areas/MCU/Clock/Clock_OSC_PLL_测试|Clock]] — SysTick 时钟
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
