---
title: "USB/CAN/LIN 测试详解"
tags:
  - mcu
  - usb
  - can
  - lin
  - ate
created: 2026-07-18
---

# USB / CAN / LIN 测试详解

---

## 一、CAN 测试

### 1.1 CAN 物理层

```
CAN 总线 (ISO 11898):

Node A            Node B
   │                 │
   ├── CANH ─────────┤
   ├── CANL ─────────┤
   │                 │
  GND              GND
  (总线两端 120Ω 终端电阻)
```

| 信号 | 显性 (Dominant) | 隐性 (Recessive) |
|------|----------------|------------------|
| CANH | 3.5V | 2.5V |
| CANL | 1.5V | 2.5V |
| 差分 | +2V | 0V |

### 1.2 CAN 协议要点

```
CAN 帧结构 (标准帧):

SOF | ID (11bit) | RTR | IDE | r0 | DLC | Data (0-8B) | CRC | ACK | EOF

关键参数:
  波特率: 125k / 250k / 500k / 1M bps
  采样点: 75%~87.5% (Sample Point)
  SJW (Synchronization Jump Width)
```

### 1.3 CAN ATE 测试

```
① 电气参数测试 (CAN 收发器):
   - 显性/隐性输出电压
   - 差分电压幅度
   - 共模范围
   - 回环模式 (Loopback) 输出阻抗

② 协议功能测试:
   - 发送: MCU 发帧 → ATE 接收解析 (ID/DLC/Data 比对)
   - 接收: ATE 发帧 → MCU 接收 → 读回验证
   - 滤波: 配置 ID Filter → 只接收匹配帧
   - 错误检测: 注入错误帧 → 错误标志/计数器

③ 波特率测试:
   - 测量位宽 → 计算波特率精度
   - 不同波特率配置验证 (125k~1M)

④ CAN FD (如支持):
   - 数据段高速率 (2M~8M)
   - 64 字节数据帧
```

---

## 二、LIN 测试

### 2.1 LIN 协议要点

```
LIN (Local Interconnect Network):

帧结构:
  Break | Sync (0x55) | ID | Data (1-8B) | Checksum

特征:
  单主多从
  波特率: 1k~20k (典型 19.2k)
  同步机制: 从节点根据 Sync 场校准时钟
  信号线: 单线 (VBAT 电平)
```

### 2.2 LIN ATE 测试

```
① Break Field 检测:
   - ATE 发送 Break (13+ bit 低电平)
   - MCU 是否正确识别帧起始

② Sync 场时钟校准:
   - ATE 发送 Sync (0x55)
   - MCU 校准波特率
   - 后续通信正确性

③ 收发测试:
   - Master 模式: MCU 发帧 → ATE 验证
   - Slave 模式: ATE 发帧 → MCU 响应
   - Checksum 验证 (Classic/Enhanced)

④ 睡眠/唤醒:
   - Sleep 命令 → MCU 进入睡眠
   - Wake-up 信号 → MCU 唤醒
```

---

## 三、USB 测试

### 3.1 USB 物理层 (Full Speed, 12Mbps)

```
USB 信号 (D+/D-):

FS 设备: D+ 上拉 1.5kΩ
LS 设备: D- 上拉 1.5kΩ

信号电平 (FS):
  J 状态 (Idle): D+ > D-
  K 状态: D- > D+
  
数据编码: NRZI + Bit Stuffing
```

### 3.2 USB ATE 测试

```
① 枚举测试 (Enumeration):
   - ATE 模拟 Host
   - 发送 Get Descriptor
   - 验证 Device Descriptor (VID/PID/类)
   - 地址分配 (Set Address)
   - 配置 (Set Configuration)

② 数据传输测试:
   - Control 传输: 枚举过程验证
   - Bulk 传输: 大量数据收发比对
   - Interrupt 传输: 定时数据包
   - Isochronous (如支持): 实时音频

③ 电气参数测试:
   - D+/D- 电平 (VOH/VOL)
   - 上拉电阻值 (1.5kΩ ± 5%)
   - 驱动能力
   - 眼图测试 (HS, 需专用仪器)

④ USB HS (480Mbps, 如支持):
   - 需要 ATE 带高速收发器
   - 眼图/抖动测试
   - 或通过 Loopback 模式简化测试

⑤ USB 时钟:
   - USB 需要 48MHz 时钟 (精度 ±0.25%)
   - 验证 USB 时钟来源 (PLL 配置)
```

### 3.3 USB 测试硬件要点

```
① 专用 USB 测试卡 (或 ATE 数字通道高速化)
② 差分信号处理 (差分探头/差分通道)
③ 阻抗控制走线 (90Ω 差分)
④ USB 连接器/Socket 的接触可靠性
```

---

## 四、测试时间与策略

```
量产策略:

CAN:
  电气参数 + Loopback 收发: 全测 (~100ms)
  协议全功能: 部分测 (代表模式)
  
LIN:
  Loopback 收发 + Break 检测: 全测
  睡眠唤醒: 全测 (功能安全相关)

USB:
  枚举 + Bulk Loopback: 全测 (~200ms)
  全协议测试: Sample
  HS 眼图: Sample (仪器限制)
```

---

## 参考资料

- [[30.areas/MCU/Digital_Peripheral/GPIO_UART_SPI_测试|GPIO/UART/SPI 测试]] — 基础接口
- [[30.areas/MCU/Clock/Clock_OSC_PLL_测试|Clock 系统]] — USB 48MHz 时钟
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
