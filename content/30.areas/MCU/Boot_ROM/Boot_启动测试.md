---
title: "Boot 启动测试详解"
tags:
  - mcu
  - boot
  - bootloader
  - isp
  - ate
created: 2026-07-18
---

# Boot / 启动流程测试详解

---

## 一、MCU 启动流程

### 1.1 典型上电启动序列

```
上电 → POR 释放
    ↓
① 读取 BOOT 引脚状态
    ↓
② 选择启动区域:
   BOOT0=0: Main Flash (用户程序)
   BOOT0=1: System Memory (Boot ROM)
    ↓
③ 初始化堆栈指针 (SP) — 从向量表读
    ↓
④ 跳转到复位向量 (Reset_Handler)
    ↓
⑤ 系统时钟初始化 (HSI → PLL 可选)
    ↓
⑥ 执行用户程序 或 Bootloader
```

### 1.2 Boot 模式

| 模式 | 启动源 | 用途 |
|------|--------|------|
| **Main Flash** | 用户程序区 | 正常运行 |
| **System Memory** | 内置 Bootloader | ISP 烧录 |
| **SRAM** | 内部 SRAM | 调试/特殊应用 |

---

## 二、启动测试项目

### 2.1 启动时间测试

```
测量: POR 释放 → 用户程序第一条指令执行

方法:
  ① 测试程序首条指令置位 GPIO
  ② ATE 测量: 上电 → GPIO 置位的时间
  ③ 分解:
     T_startup = T_POR + T_boot_logic + T_clock + T_fetch

典型值: 几十 μs ~ 几 ms (取决于时钟初始化)
```

### 2.2 Boot 模式切换测试

```
测试各 Boot 模式的正确性:

① Flash Boot:
   - BOOT 引脚 = Flash 模式配置
   - 预写测试程序到 Flash
   - 上电 → 程序正常执行

② System Memory Boot (ISP):
   - BOOT 引脚 = System Memory 模式
   - 上电 → 进入 Bootloader
   - UART 发送握手命令 → 收到响应
   - 验证 ISP 协议

③ SRAM Boot (如支持):
   - BOOT 引脚 = SRAM 模式
   - 预加载程序到 SRAM (通过 SWD)
   - 上电 → 从 SRAM 执行
```

### 2.3 ISP (In-System Programming) 测试

```
ISP 烧录流程测试:

① 进入 Bootloader (System Memory 启动)
② 握手: ATE 发送 0x7F → MCU 回复 ACK (0x79)
③ 发送烧录命令 (Write Memory)
④ 传输固件数据
⑤ MCU 编程 Flash
⑥ 验证: 读回比对
⑦ 跳转: 执行新固件

测试点:
  • 握手协议正确性
  • 数据完整性 (Checksum)
  • 烧录速度
  • 错误处理 (错误命令/错误地址)
  • 读保护下的行为
```

### 2.4 空 Flash 启动测试

```
场景: 出厂 Flash 为空 (全 0xFF)

测试:
  ① 擦除 Flash (全 FF)
  ② 上电
  ③ MCU 行为:
     - 向量表全 FF → SP/PC 非法
     - 应进入 HardFault 或安全状态
     - 不出现异常电流/死机
  ④ 验证: 芯片不损坏, 可通过 ISP 恢复
```

### 2.5 安全启动测试 (Secure Boot, 如支持)

```
安全启动流程:
  ① 上电 → Boot ROM
  ② 验证固件签名 (SHA/RSA)
  ③ 签名有效 → 执行固件
  ④ 签名无效 → 拒绝执行 (锁定/恢复模式)

测试:
  ① 合法签名固件 → 正常启动
  ② 非法签名固件 → 拒绝启动
  ③ 篡改检测 → 安全响应
```

---

## 三、Boot 测试与 ATE 的集成

### 3.1 量产测试中的 Boot 应用

```
Boot 在量产测试中的双重角色:

① 作为测试对象:
   - 启动时间
   - 模式切换
   - ISP 功能

② 作为测试工具:
   - 通过 ISP 快速烧录测试固件
   - 通过 Bootloader 与 ATE 通信
```

### 3.2 测试固件烧录方案对比

| 方案 | 速度 | 灵活性 | 量产适用 |
|------|------|--------|---------|
| **SWD 下载** | 快 (4MHz+) | 高 | ✅ 最常用 |
| **ISP (UART)** | 中 (115200) | 中 | 可选 |
| **ISP (USB)** | 快 | 中 | USB MCU 常用 |
| **预烧 Flash** | 最快 (免下载) | 低 | 大批量 (烧录厂) |

---

## 四、常见问题

| 问题 | 可能原因 | 解决 |
|------|---------|------|
| 启动失败 (不跑程序) | Flash 空/损坏 | 检查向量表/重烧 |
| 启动时间超规 | 时钟初始化慢 | 检查 PLL 配置 |
| ISP 连接失败 | 波特率/时序 | 检查握手时序 |
| 偶发启动失败 | POR 时序 | 检查复位电路 |
| Boot 模式判断错误 | BOOT 引脚电平 | 检查上下拉配置 |

---

## 参考资料

- [[30.areas/MCU/Memory/Flash_SRAM_测试|Flash 测试]] — 烧录相关
- [[30.areas/MCU/System/Idd_电源_复位_测试|POR 测试]] — 启动前提
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]] — 固件加载方案
