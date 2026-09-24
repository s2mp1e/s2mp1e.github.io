---
title: "Scan/DFT 测试详解"
tags:
  - mcu
  - dft
  - scan
  - bist
  - ate
created: 2026-07-18
---

# Scan / DFT 测试详解

---

## 一、Scan Test 原理

### 1.1 为什么需要 Scan？

MCU 数字逻辑规模庞大（数十万~数百万门），直接通过功能测试无法达到高覆盖率。

```
功能测试: 通过引脚施加激励 → 覆盖有限 (受引脚和时序限制)
Scan 测试: 内部触发器串成移位寄存器 → 直接读写内部状态
```

### 1.2 Scan Chain 结构

```
正常模式:
  D ──→ [FF] ──→ Q ──→ 组合逻辑 ──→ D' ──→ [FF]

Scan 模式:
  SI ──→ [FF] → [FF] → [FF] → ... → SO
  (所有触发器串成一条移位链)

测试流程:
  ① Shift In: 通过 SI 移入测试激励 (几百~几千周期)
  ② Capture:  一个时钟周期, 捕获组合逻辑输出
  ③ Shift Out: 通过 SO 移出结果, 同时移入下一组激励
  ④ 比较 SO 数据与预期值 (Pattern 比对)
```

### 1.3 ATPG (Automatic Test Pattern Generation)

```
ATPG 工具自动生成测试 Pattern:

输入: 网表 (Netlist) + 故障模型
输出: Scan Pattern 文件 (STIL/WGL)

故障模型:
  • Stuck-At Fault (固定 0/1)
  • Transition Fault (时序故障)
  • Path Delay Fault (路径延迟)

覆盖率目标: > 98% Stuck-At
```

---

## 二、Scan 测试在 ATE 上的实现

### 2.1 测试配置

```
ATE 数字通道:
  ├── Scan Clock (专用时钟引脚)
  ├── Scan Enable (SE)
  ├── Scan In (SI)
  ├── Scan Out (SO)
  └── Test Mode 控制

MCU 侧:
  测试模式引脚 (TEST/BOOT 组合) → 进入 Scan 模式
  或通过 JTAG 接口进入
```

### 2.2 测试流程

```
① 上电, 进入 Test Mode
② 加载 Scan Chain 配置
③ 逐 Pattern 执行:
   Shift In → Capture → Shift Out
④ ATE 比对 SO 数据
⑤ 全部 Pattern 通过 → PASS
⑥ 任一 Pattern 失败 → FAIL (记录失败 Pattern 号)
```

### 2.3 Pattern 规模

```
典型 MCU (100K 触发器):

  Scan Chain 数量: 50~200 条
  每条链长度: 500~2000 FF
  Pattern 数量: 2000~10000 个
  测试时间: 1~5 秒

并行加载: 多条链并行 Shift → 缩短时间
```

---

## 三、MBIST 测试

### 3.1 原理

MBIST 在芯片内部生成测试 Pattern，不需要 ATE 提供海量数据：

```
测试流程:
  ① ATE 写 BIST 控制寄存器 → 启动
  ② BIST 控制器自动执行 March 算法
  ③ BIST 完成 → 状态寄存器置位
  ④ ATE 读结果: PASS/FAIL + 失败地址

优点:
  • ATE Pattern 数据量小
  • 测试速度快 (内部高速时钟)
  • 覆盖率高 (March 算法完备)
```

详见: [[30.areas/MCU/Memory/Flash_SRAM_测试|Flash/SRAM 测试详解]]

---

## 四、IDDQ 测试

### 4.1 原理

CMOS 电路静态时几乎无电流。缺陷（桥接、栅氧泄漏）会导致异常静态电流：

```
测试:
  ① 芯片置于已知状态 (静态)
  ② 测量 VDD 静态电流
  ③ IDDQ < 阈值 (如 10μA) → PASS
  ④ IDDQ > 阈值 → 存在缺陷

检测目标:
  • 桥接故障 (Bridging)
  • 栅氧化层缺陷
  • 泄漏路径
```

### 4.2 IDDQ 在 MCU 中的应用

```
结合 Scan 的 IDDQ 测试:
  ① Shift In 一组状态
  ② 等待静态稳定
  ③ 测量 IDDQ
  ④ 多个状态点重复 (如 10~20 个点)

注意: 先进工艺 (28nm 以下) 漏电大, IDDQ 测试受限
```

---

## 五、JTAG (IEEE 1149.1) 测试

### 5.1 JTAG 功能

```
① 边界扫描 (Boundary Scan):
   - 测试引脚互连 (封装/PCB 级)
   
② 内部测试访问:
   - 通过 JTAG 进入 Scan/BIST 模式
   
③ 调试接口:
   - SWD/JTAG 是 MCU 开发调试的标准接口
```

### 5.2 MCU 的 JTAG/SWD 应用

```
量产测试中 JTAG/SWD 的用途:

① 加载测试程序 (Test Firmware)
   - 测试程序下载到 SRAM
   - CPU 执行测试程序 (配置外设/ADC 等)

② Flash 编程
   - 通过 SWD 直接编程 Flash
   - 写入测试 Pattern

③ 测试模式进入
   - 通过 JTAG 进入内部测试模式
```

---

## 六、测试模式 (Test Mode) 设计

```
MCU 通常通过引脚组合进入测试模式:

模式进入示例:
  TEST 引脚 = HIGH + BOOT 引脚特定组合
  → 进入 Test Mode

Test Mode 提供:
  ① 内部信号引出 (Mux 到引脚)
     - 内部时钟观测
     - 内部电压观测
     - 内部状态观测
  ② 模拟测试路径
     - ADC 直接输入 (绕过 MUX)
     - DAC 直接输出
  ③ 特殊功能
     - Flash Margin Read
     - 修调寄存器访问
```

---

## 七、DFT 测试流程总结

```
MCU 量产测试的 DFT 部分:

┌──────────────────────────────────────┐
│ ① Continuity/Leakage (所有引脚)       │
│ ② JTAG ID Code 验证                   │
│ ③ Scan Test (数字逻辑)               │
│ ④ MBIST (SRAM)                       │
│ ⑤ IDDQ (可选)                        │
│ ⑥ Flash 功能测试                     │
│ ⑦ 模拟模块测试 (ADC/DAC/PGA...)       │
│ ⑧ 外设功能测试                        │
│ ⑨ 功耗测试 (Idd)                     │
│ ⑩ Trim 验证                           │
└──────────────────────────────────────┘
```

---

## 参考资料

- [[30.areas/MCU/Memory/Flash_SRAM_测试|Flash/SRAM 测试详解]] — MBIST 算法
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
- [[30.areas/MCU/Common/MCU_FT|MCU FT 完整指南]]
