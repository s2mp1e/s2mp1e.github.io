---
title: "I2C/SPI 接口测试"
tags:
  - pmic
  - digital
  - i2c
  - spi
  - ate
created: 2026-07-17
---

# I2C/SPI 接口测试

---

## 一、I2C 协议要点

### I2C 时序

```
SCL: ──┐    ┌──┐    ┌──┐    ┌──┐    ┌──
       │    │  │    │  │    │  │    │
       └────┘  └────┘  └────┘  └────┘

SDA: ──┐  ┌──────┐  ┌────┐  ┌────┐──
       │  │      │  │    │  │    │
       └──┘      └──┘    └──┘    └──
       ↑↑      ↑  ↑    ↑            ↑
       ST Bit7  ACK  ...           SP
```

### 关键时序参数

| 参数 | 描述 | 标准模式 | 快速模式 |
|------|------|---------|---------|
| **fSCL** | 时钟频率 | 100kHz | 400kHz |
| **tHD:STA** | START 保持时间 | 4.0μs | 0.6μs |
| **tSU:STA** | START 建立时间 | 4.7μs | 0.6μs |
| **tHD:DAT** | 数据保持时间 | 0~3.45μs | 0~0.9μs |
| **tSU:DAT** | 数据建立时间 | 250ns | 100ns |
| **tBUF** | STOP-STOP 总线空闲 | 4.7μs | 1.3μs |

---

## 二、I2C ATE 测试方法

### 2.1 Slave Address 验证

```
条件: SCL, SDA 连接到 ATE 数字通道
步骤:
  1. 发送 Slave Addr + W (如 0x60)
  2. 检查 ACK (第9个SCL周期SDA被拉低)
  3. 发送 Slave Addr + R
  4. 检查 ACK
  5. 发送错误地址 → 确认 NACK
```

### 2.2 Register Write/Read

```
条件: 芯片使能, I2C 通信正常
步骤:
  1. Write: 发送 RegAddr + Data
  2. Read: 发送 RegAddr → Restart → Read
  3. 对比 Read back 数据 = 写入数据
  4. 遍历所有寄存器 (sweep)
判断: 全地址 R/W 一致
```

### 2.3 I2C Timing 测试

```
条件: ATE 数字通道可调 SCL 速率
步骤:
  1. 在 fSCL = 100kHz, 400kHz, 1MHz 下分别测试
  2. 调整 SCL 高/低比例, 建立/保持时间
  3. 确认芯片在时序规格边界的通信可靠性
  4. (Margin Test) 逐渐拉伸/压缩时序直到通信失败
```

### 2.4 多设备冲突

```
条件: 总线上挂载多颗设备
步骤:
  1. 发送不同 Slave Addr
  2. 确认每个 Addr 只有对应芯片 ACK
  3. 发送 Broadcast (General Call) 如果支持
```

---

## 三、SPI 协议要点

### SPI 模式 (CPOL/CPHA)

| Mode | CPOL | CPHA | 时钟极性 | 采样沿 |
|------|------|------|---------|-------|
| 0 | 0 | 0 | 空闲 LOW | 上升沿采样 |
| 1 | 0 | 1 | 空闲 LOW | 下降沿采样 |
| 2 | 1 | 0 | 空闲 HIGH | 下降沿采样 |
| 3 | 1 | 1 | 空闲 HIGH | 上升沿采样 |

### 关键时序参数

- **fSCK**: 时钟频率 (典型 1MHz~20MHz)
- **tCSS (CS Setup)**: CS 到第一个 SCK 的建立时间
- **tCSH (CS Hold)**: 最后一个 SCK 到 CS 释放的保持时间
- **tSU (Data Setup)**: MOSI 数据建立时间
- **tHD (Data Hold)**: MOSI 数据保持时间
- **tACC (Access Time)**: CS 到 MISO 有效的时间

---

## 四、SPI ATE 测试方法

```
条件: CS, SCK, MOSI, MISO 连接 ATE 数字通道
步骤:
  1. 测试 4 种 Mode (CPOL/CPHA 组合)
  2. CS 时序: 建立/保持时间测试
  3. SCK 频率: 全速通信
  4. Write + Read Back (Loopback)
  
注意: SPI 的 MISO 在 multi-slave 下要三态控制
```

---

## 参考资料

- [[30.areas/PMIC/Digital_Interface/OTP_EFUSE_Trim|OTP/EFUSE/Trim 测试]]
- [[30.areas/PMIC/Common/时序测试|时序测试]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
