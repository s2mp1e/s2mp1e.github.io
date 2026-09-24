---
title: "Flash/SRAM 测试详解"
tags:
  - mcu
  - memory
  - flash
  - sram
  - ate
created: 2026-07-18
---

# Flash / SRAM / EEPROM 测试详解

---

## 一、Flash 工作原理

### 1.1 Flash Cell

```
浮栅晶体管 (Floating Gate):

        Control Gate (CG)
              │
        ┌─────┴─────┐
        │  Floating │  ← 存储电荷
        │    Gate   │
        └─────┬─────┘
              │
        Source ─┬─ Drain
                │
            Substrate

擦除后 (无电荷): Vth 低 → 读 "1"
编程后 (有电荷): Vth 高 → 读 "0"
```

### 1.2 基本操作

| 操作 | 作用 | 典型时间 |
|------|------|---------|
| **Read** | 读取数据 | ~10ns/Word |
| **Program (Page)** | 页编程 (1→0) | 1~5ms/Page |
| **Erase (Sector)** | 扇区擦除 (0→1) | 10~100ms/Sector |
| **Blank Check** | 检查擦除状态 | 快速 |

---

## 二、Flash 测试项目

### 2.1 功能测试

```
Program → Read Verify → Erase → Blank Check 循环

测试 Pattern (覆盖不同数据模式):
  Checkerboard: 0xAA / 0x55
  All 0: 0x00
  All 1: 0xFF
  March Pattern: 多种组合
  Random: 随机数据
```

### 2.2 测试流程 (CP 阶段)

```
① 擦除整个 Flash (或测试区域)
② Blank Check → 确认全 FF
③ 写入 Pattern 1 (如 0xAA55AA55)
④ Read Verify → 对比
⑤ 擦除
⑥ 写入 Pattern 2 (如 0x55AA55AA)
⑦ Read Verify
⑧ 擦除 → 完成
```

### 2.3 Program Time 测量

```
条件: 擦除状态
步骤:
  ① 发送 Program 命令 (1 Page)
  ② 测量从命令开始到 Program 完成的时间
  (通过 RDY/BSY 引脚或 Status Polling)
判断: T_prog < 规格 (如 5ms/Page)
```

### 2.4 Erase Time 测量

```
条件: 已编程状态
步骤:
  ① 发送 Sector Erase 命令
  ② 测量完成时间
判断: T_erase < 规格 (如 50ms/Sector)
```

### 2.5 编程/擦除电流

```
测量 Flash Program/Erase 时的电源电流:

典型: 3~10mA (Flash 内部电荷泵工作)
判断: < 规格上限
```

---

## 三、Flash 可靠性测试

### 3.1 Retention (数据保持)

```
目的: 验证数据长期保持能力

方法 (加速测试):
  ① 编程测试 Pattern
  ② 高温烘烤 (如 150°C × 24~48 小时)
  ③ 冷却到室温
  ④ 读取验证数据

原理: 高温加速电荷泄漏
  Arrhenius 方程: 150°C/24h ≈ 85°C/10年 (激活能 ~1.1eV)
```

### 3.2 Endurance (擦写寿命)

```
目的: 验证重复擦写能力

方法 (Sample Level):
  ① 选定测试 Sector
  ② 循环: Program → Erase (1 万次)
  ③ 每次循环后验证
  ④ 完成后做 Retention 测试

典型规格: 10k 次 (工业级) / 100k 次 (汽车级)
```

### 3.3 Read Margin (读余量)

```
目的: 验证存储单元的余量

方法:
  ① 编程后, 改变读取条件 (降低读出电压/电流)
  ② 在 Margin 条件下读取
  ③ 通过 → 单元有足够余量
  ④ 失败 → 边缘单元 (Marginal Cell)

量产中: 测试模式 (Test Mode) 提供 Margin Read
```

---

## 四、SRAM 测试

### 4.1 MBIST (Memory Built-In Self-Test)

MCU 的 SRAM 通过内建自测试电路测试：

```
MBIST 架构:

BIST Controller
      │
      ├── 地址生成器 (Address Generator)
      ├── 数据生成器 (Data Generator)
      ├── 比较器 (Comparator)
      └── 控制状态机 (FSM)
              │
        ┌─────┴─────┐
        │   SRAM    │
        └───────────┘

测试流程:
  ① CPU 或 ATE 启动 BIST (写控制寄存器)
  ② BIST 自动执行 March 算法
  ③ 完成后读结果寄存器
  ④ PASS / FAIL 标志
```

### 4.2 常用 March 算法

```
March C- (最常用):

  ↑ w0          全部写 0 (上升地址)
  ↑ r0, w1      读 0 写 1
  ↑ r1, w0      读 1 写 0
  ↓ r0, w1      读 0 写 1 (下降地址)
  ↓ r1, w0      读 1 写 0
  ↓ r0          读 0

覆盖故障:
  • Stuck-At Fault (固定故障)
  • Transition Fault (转换故障)
  • Coupling Fault (耦合故障)
  • Address Decoder Fault (译码故障)
```

### 4.3 SRAM Retention Test

```
目的: 验证数据保持 (低电压模式)

方法:
  ① 写 Pattern 到 SRAM
  ② 降低 SRAM 供电电压到保持电压 (如 1.2V→0.9V)
  ③ 等待 (如 100ms)
  ④ 恢复电压
  ⑤ 读取验证
```

---

## 五、EEPROM 测试

```
与 Flash 的区别: 字节级擦写

测试项目:
  ① Byte Write / Read
  ② Page Write (如有)
  ③ Endurance (100k~1M 次, Sample)
  ④ Retention (烘烤, Sample)
  ⑤ 写保护功能 (WP 引脚)
```

---

## 六、ATE 测试硬件要点

```
Flash 测试的特殊硬件需求:

① 高压源 (VPP): 6V~10V 编程电压 (外部编程方案)
   → 需要专用 SMU 或高压通道

② 快速测量: Flash Program/Erase 时间测量
   → 需要高精度 Timer

③ 电流测量: 编程电流监控
   → 高精度 SMU

④ 数据通路: Pattern 写入/读出
   → 使用 ATE 数字通道或通过 CPU 执行程序

⑤ 测试程序加载: MCU Flash 测试通常需要:
   - 通过调试口 (SWD/JTAG) 加载测试程序
   - 或 Boot ROM 进入测试模式
   - 或 ATE 直接控制 Flash 控制器
```

---

## 七、量产测试策略

| 测试阶段 | 测试内容 | 覆盖度 |
|---------|---------|--------|
| **CP** | 全容量功能测试 (Pattern) | 100% |
| **CP** | Program/Erase 时间 | 100% |
| **CP** | Read Margin | 100% |
| **CP** | SRAM MBIST | 100% |
| **FT** | Flash 功能复测 (部分) | 100% |
| **FT** | 数据验证 | 100% |
| **QA** | Retention (烘烤) | Sample |
| **QA** | Endurance | Sample |

---

## 参考资料

- [[30.areas/MCU/DFT/Scan_DFT_测试|DFT 测试]] — BIST 实现细节
- [[30.areas/MCU/Common/MCU_FT|MCU FT 完整指南]] — FT 流程中的 Memory 测试
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
