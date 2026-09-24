---
title: "GPIO/UART/SPI/I2C/Timer 测试详解"
tags:
  - mcu
  - gpio
  - uart
  - spi
  - i2c
  - timer
  - ate
created: 2026-07-18
---

# GPIO / UART / SPI / I2C / Timer 测试详解

---

## 一、GPIO 测试

### 1.1 GPIO 结构

```
                 ┌──────────┐
                 │ Pull-Up  │ (可配置上拉)
                 └────┬─────┘
                      │
寄存器控制 ──→ 驱动电路 ┼── Pin
(输入/输出/复用)       │
                      │
                 ┌────┴─────┐
                 │ Pull-Down│ (可配置下拉)
                 └──────────┘
```

### 1.2 关键参数与测试

| 参数 | 描述 | 测试方法 | 典型规格 |
|------|------|---------|---------|
| **VIH** | 输入高电平阈值 | 输入电压扫描, 找读 "1" 阈值 | 0.7×VDD |
| **VIL** | 输入低电平阈值 | 输入电压扫描, 找读 "0" 阈值 | 0.3×VDD |
| **VOH** | 输出高电平 | Force 负载电流, 测 VOUT | VDD-0.4V @ 4mA |
| **VOL** | 输出低电平 | Force 负载电流, 测 VOUT | 0.4V @ 8mA |
| **IOH/IOL** | 驱动能力 | 逐步加大电流到电平退化 | 4~20mA |
| **Ileak** | 漏电流 | 高阻态下 Force VDD/0V 测电流 | < ±1μA |
| **Pull-Up R** | 上拉电阻 | Force 电流, 测压降 | 30~50kΩ |
| **Pull-Down R** | 下拉电阻 | 同上 | 30~50kΩ |
| **Toggle Speed** | 翻转速率 | 输出方波, 测最大频率 | > 10MHz |

### 1.3 GPIO 测试流程

```
① Input Mode 测试:
   - 配置 GPIO 为输入
   - VIH/VIL 扫描 → 读寄存器验证

② Output Mode 测试:
   - 配置 GPIO 为输出 (高/低)
   - 测 VOH/VOL, 驱动能力

③ 复用功能 (AF) 测试:
   - 配置为 UART TX → 输出波形验证
   - 配置为 SPI CLK → 时钟输出验证

④ 中断功能测试:
   - 配置中断 → 触发边沿 → 读中断标志
```

---

## 二、UART 测试

### 2.1 关键参数

| 参数 | 描述 | 典型 |
|------|------|------|
| **Baud Rate** | 波特率 | 9600~115200~1M+ |
| **Baud Rate Error** | 波特率精度 | < ±2% (Trim 前 ±5%) |
| **数据格式** | 8N1, 8E1, 8O1 | 多种 |
| **TX/RX 功能** | 收发正确性 | 全数据比对 |

### 2.2 测试方法

```
① Baud Rate 测试:
   - MCU 发送固定字符 (如 0x55)
   - ATE 测 TX 波形位宽
   - Baud = 1 / Bit_Width
   - Error = (Baud_actual - Baud_target) / Baud_target

② TX 功能测试:
   - MCU 发送测试 Pattern (0x00~0xFF)
   - ATE 数字通道接收 → 比对

③ RX 功能测试:
   - ATE 发送测试 Pattern
   - MCU 接收 → 通过寄存器/内存读回比对

④ 校验功能:
   - 奇偶校验、帧错误检测
```

---

## 三、SPI 测试

```
① 4 种 Mode (CPOL/CPHA) 测试
② 主模式: MCU 发时钟, 收 MISO 数据
③ 从模式: ATE 发时钟, MCU 响应
④ 数据全模式比对 (0x00~0xFF, 全0, 全1)
⑤ 时序参数: Setup/Hold Time (从模式)
```

详见: [[30.areas/PMIC/Digital_Interface/I2C_SPI_测试|I2C/SPI 测试 (PMIC)]] — 协议基础通用

---

## 四、I2C 测试

```
① 主模式: MCU 读写 ATE 模拟的 I2C 从设备
② 从模式: ATE 作为主设备读写 MCU
③ Slave Address 验证
④ 时钟拉伸 (Clock Stretch) 行为
⑤ 总线仲裁 (多主模式, 如有)
```

---

## 五、Timer / PWM 测试

### 5.1 Timer 计数精度

```
测试:
  ① 配置 Timer 为向上计数, 时钟 = HCLK/1
  ② Timer 计数到 N 时输出事件 (Compare Match)
  ③ ATE 测量事件间隔
  ④ T_expected = N / F_clk
  ⑤ Error = (T_meas - T_expected) / T_expected

本质: 验证 Timer 时钟链正确 (含分频器)
```

### 5.2 PWM 频率与占空比

```
测试:
  ① 配置 PWM: Frequency = 1kHz, Duty = 50%
  ② ATE TMU 测量输出波形
  ③ F_meas: 1kHz ± 1%
  ④ Duty_meas: 50% ± 1%

多配置点测试:
  Duty: 10%, 25%, 50%, 75%, 90%
  Frequency: 1kHz, 10kHz, 100kHz
```

### 5.3 输入捕获 (Input Capture)

```
测试:
  ① ATE 产生方波 (已知频率/脉宽)
  ② MCU Input Capture 测量
  ③ 通过寄存器读回 MCU 测量的值
  ④ 与 ATE 实际值比对
```

---

## 六、Watchdog (WDT) 测试

```
① WDT 超时复位:
   - 使能 WDT, 不喂狗
   - 测量超时时间
   - 确认 MCU 复位

② WDT 喂狗正常:
   - 定期喂狗
   - 确认 MCU 不复位

③ WDT 窗口模式 (如支持):
   - 早喂/晚喂 → 都复位
   - 窗口内喂 → 不复位
```

---

## 七、测试注意事项

```
① 外设时钟配置: 测试前确认时钟树正确
② 引脚复用: 确认 AF 配置不影响其他测试
③ 测试程序: 通过 SWD/JTAG 加载, 或 Boot ROM
④ 高速信号: UART/SPI 高速时的 DIB 走线质量
⑤ 中断向量: 测试中断时确认向量表正确
```

---

## 参考资料

- [[30.areas/PMIC/Digital_Interface/I2C_SPI_测试|I2C/SPI 协议基础 (PMIC)]] — 协议时序通用
- [[30.areas/MCU/Clock/Clock_OSC_PLL_测试|Clock 系统]] — 外设时钟源
- [[30.areas/MCU/Common/MCU_ATE测试基础|MCU ATE 测试基础]]
