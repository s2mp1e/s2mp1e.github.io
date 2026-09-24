---
title: "OTP/EFUSE/Trim 测试"
tags:
  - pmic
  - otp
  - efuse
  - trim
  - ate
created: 2026-07-17
---

# OTP/EFUSE/Trim 测试

---

## 一、为什么要 Trim？

PMIC 是模拟芯片，工艺偏差导致实际参数偏离设计值：

```
参数        设计值      晶圆A       晶圆B
VREF        1.200V      1.195V      1.208V
FOSC        1.000MHz    0.985MHz    1.012MHz
RC Ton      100ns       95ns        108ns
```

**Trim 流程**:
1. 在 CP (晶圆测试) 中测量实际值
2. 计算需要调整的 Trim Code
3. 将 Code 烧录到 OTP/EFUSE
4. FT (成品测试) 时读回 Trim Code → 芯片按修调值工作

---

## 二、存储技术对比

| 技术 | 可编程次数 | 面积 | 工艺 | PMIC 应用 |
|------|----------|------|------|----------|
| **OTP (One-Time)** | 1次 | 小 | 标准 CMOS | 最常用 |
| **EFUSE** | 1次 | 小 | 标准 CMOS | 高可靠性 |
| **MTP (Multi-Time)** | 多次 | 中 | 需额外工艺 | 研发阶段 |
| **OTP with Redundancy** | 1次+备份 | 中 | 标准 CMOS | 良率提升 |

---

## 三、EFUSE 工作原理

### 3.1 Gate Oxide Breakdown OTP

```
高压 → 击穿栅氧化层
  → 阻抗从 GΩ 级降到 kΩ 级
  → 读出: 击穿=0/1, 未击穿=1/0
```

### 3.2 Metal Fuse / Poly Fuse

```
大电流 → 熔断金属/多晶硅
  → 熔断前: 低阻抗 (几 Ω)
  → 熔断后: 高阻抗 (> 1MΩ)
```

---

## 四、ATE 测试方法

### 4.1 OTP Read Check (未烧录前)

```
条件: 芯片刚上电 (未烧录)
步骤:
  1. 读取 OTP 区域寄存器
  2. 确认默认值为 0x00 或 0xFF (取决于设计)
  3. 确认 Trim 默认值 (通常为 0 或 Mid-Code)
```

### 4.2 OTP Program (烧录)

```
条件: 需要烧录电压 (VPP) 和时序
步骤:
  1. 设置 VPP 到烧录电压
  2. 写入目标 Trim Code
  3. 发送 Program 命令
  4. 等待烧录完成 (几 μs ~ 几 ms)
  5. 验证: Read back = 写入值
```

### 4.3 OTP Verify (回读验证)

```
条件: OTP 烧录完成
步骤:
  1. 芯片重新上电 (POR)
  2. 读取 OTP 区域
  3. 确认 Trim Code 正确加载
  4. 测量对应参数确认 Trim 生效
```

### 4.4 Trim 测试流程示例 (RC Ton Trim)

```
1. 初始测量: Fsw 或 Ton (Trim Code = Default)
2. 计算:
   Target = 100ns
   Actual = 92ns
   Error  = -8%
   Step   = 2%/Code
   Needed_Code = -8/2 = -4  (减小 4 Code)
3. 确定最终 Code:
   Final_Code = Default + (-4) = Mid_Code - 4
4. 烧录 OTP
5. 复测验证: Ton = 99ns ✓
```

---

## 五、关键测试注意事项

| 注意事项 | 说明 |
|---------|------|
| **VPP 电压精度** | 烧录电压偏差大可能导致烧录失败或损坏 |
| **烧录时序** | 烧录脉冲宽度必须精确 (几 μs) |
| **温度影响** | 高温下烧录可能不完整 |
| **重复烧录风险** | OTP 只能烧一次，测试需精心设计 |
| **冗余位** | 如芯片有冗余 OTP，需测试冗余切换 |
| **Data Retention** | 数据保持测试 (高温烘烤后回读) |

---

## 六、Trim 类型汇总

| Trim 类型 | 测量参数 | 调整对象 |
|-----------|---------|---------|
| **VREF Trim** | 参考电压 | Bandgap 电阻网络 |
| **OSC Trim** | 振荡频率 | OSC 电流源/电容 |
| **RC Ton Trim** | Ton/频率 | RC Timer |
| **VOUT Trim** | 输出电压 | FB 分压电阻 |
| **ILIM Trim** | 限流阈值 | 电流检测电路 |
| **TC Trim** | 温漂补偿 | 温度系数补偿 |

---

## 参考资料

- [[30.areas/PMIC/Common/Trim|PMIC Trim 完整指南]] — **全模块 Trim 方法大全**
- [[30.areas/PMIC/Common/FT|FT 测试完整指南]] — FT 中的 Trim 验证流程
- [[30.areas/PMIC/Analog_Core/Bandgap_原理与测试|Bandgap]]
- [[30.areas/PMIC/Analog_Core/Oscillator_原理与测试|Oscillator]]
- [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试|Buck Ton Trim]]
- [[30.areas/PMIC/Digital_Interface/I2C_SPI_测试|I2C/SPI 通信]]
