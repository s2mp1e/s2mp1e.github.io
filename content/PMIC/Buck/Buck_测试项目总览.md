---
title: "Buck 测试项目总览"
tags:
  - pmic
  - buck
  - ate
  - test-items
created: 2026-07-17
---

# Buck 测试项目总览 / Buck Test Item Overview

> 本文系统化整理 Buck Converter 在 ATE 测试中常见的所有测试项目，按测试类型分类。

---

## 一、静态 DC 参数测试 / Static DC Tests

| 测试项目 | 描述 | 关键测试条件 | 典型 Limit |
|---------|------|-------------|-----------|
| **VOUT Accuracy** | 输出电压精度 | VIN, IOUT, Mode | ±1% ~ ±3% |
| **Line Regulation** | 线性调整率 | VIN sweep, IOUT 固定 | < 0.5%/V |
| **Load Regulation** | 负载调整率 | IOUT sweep, VIN 固定 | < 1% |
| **Iq (Quiescent Current)** | 静态电流 | 空载/不开关 | 几 μA ~ 几百 μA |
| **Isd (Shutdown Current)** | 关断电流 | EN=LOW | < 1μA |
| **Icc (Supply Current)** | 工作电流 | 正常开关 | 几 mA ~ 几十 mA |
| **Efficiency** | 效率 | 全负载范围 | > 85% (典型) |
| **Output Ripple** | 输出纹波 | 满负载 | < 几十 mVpp |

---

## 二、时序参数测试 / Timing Tests

| 测试项目 | 描述 | 时间尺度 | 参考文档 |
|---------|------|---------|---------|
| **Ton** | HS MOS 导通时间 | ns ~ μs | [[Buck_Ton与ACT_TIME测试\|Ton 测试详解]] |
| **Fsw** | 开关频率 | 100kHz ~ 3MHz | — |
| **Duty Cycle** | 占空比 | 0% ~ 100% | — |
| **Min Ton / Min Off Time** | 最小导通/关断时间 | 几 ns ~ 几十 ns | — |
| **Dead Time** | 上下管切换死区时间 | 几 ns | — |
| **ACT TIME (Startup)** | 启动时间 | μs ~ ms | [[Buck_Ton与ACT_TIME测试\|ACT TIME 测试详解]] |
| **Soft Start Time** | 软启动时间 | μs ~ ms | — |
| **PG Delay** | Power Good 延迟 | μs ~ ms | — |

---

## 三、动态响应测试 / Dynamic Tests

| 测试项目 | 描述 | 测试方法 |
|---------|------|---------|
| **Load Transient** | 负载瞬态响应 | IOUT 跳变 (如 10%→90%)，测 VOUT 过冲/恢复时间 |
| **Line Transient** | 输入瞬态响应 | VIN 跳变，测 VOUT 变化 |
| **Startup Waveform** | 启动波形检查 | EN→VOUT 全过程，检查过冲/振荡 |
| **Shutdown Waveform** | 关断波形检查 | EN LOW 后 VOUT 放电行为 |

---

## 四、保护功能测试 / Protection Tests

| 测试项目 | 描述 | 触发条件 |
|---------|------|---------|
| **OCP (Over Current Protection)** | 过流保护 | IOUT > OCP 阈值 → 限流或 Hiccup |
| **SCP (Short Circuit Protection)** | 短路保护 | VOUT 短路 → 限流或关断 |
| **OVP (Over Voltage Protection)** | 过压保护 | VOUT > OVP 阈值 → HS 关断 |
| **UVLO (Under Voltage Lockout)** | 欠压锁定 | VIN < UVLO 阈值 → 关断 |
| **OTP (Over Temperature Protection)** | 过热保护 | Tj > OTP 阈值 → 关断 |
| **Reverse Current Protection** | 反向电流保护 | 检测到反向电流 → LS 关断 |
| **Power Good** | 输出电压正常指示 | VOUT > PG 阈值 → PG HIGH |

详见: [[30.areas/PMIC/Protection/OVP_OCP_OTP_UVLO]]

---

## 五、修调测试 / Trim Tests

| 测试项目 | 描述 | 方法 |
|---------|------|------|
| **RC Ton Trim** | Ton 时间修调 | 测 Ton → 计算 Trim Code → 写入 OTP/EFUSE |
| **VOUT Trim** | 输出电压修调 | 测 VOUT → 计算 Trim Code |
| **Current Limit Trim** | 限流阈值修调 | 测 OCP 点 → 计算 Trim Code |
| **Oscillator Trim** | 振荡器频率修调 | 测 Fsw → 计算 Trim Code |

---

## 六、数字接口测试 / Digital Interface Tests

| 测试项目 | 描述 |
|---------|------|
| **I2C/SPI Slave Addr** | 通信地址验证 |
| **Register Read/Write** | 寄存器读写功能验证 |
| **Register Default Value** | 寄存器默认值核对 |
| **Trim OTP Readback** | 修调值回读验证 |
| **I2C Timing** | SCL/SDA 时序参数 (Setup/Hold time) |

---

## 七、量产测试流程示例 / Production Flow Example

```
测试流程:

1. Continuity Test (开短路测试)
2. Shutdown Current (Isd)
3. Startup ACT TIME
4. VOUT Accuracy (默认配置)
5. Icc / Iq
6. Ton / Fsw (轻载 & 满载)
7. Load Regulation
8. Line Regulation
9. OCP / SCP
10. OVP / UVLO
11. Efficiency Spot Check
12. TRIM (如需要)
13. I2C/SPI Verify (如需要)
14. OTP Program (如需要)
15. Final Test (复测关键参数)
```

> 💡 实际流程视芯片设计和测试时间 (CP/FT) 优化，Bin 项通常按 < 1s/Test 的目标设计。

---

## 参考资料

- [[30.areas/PMIC/Buck/Buck_基本原理|Buck 基本原理]]
- [[30.areas/PMIC/Buck/Buck_Ton与ACT_TIME测试|Ton 与 ACT TIME 测试]]
- [[30.areas/PMIC/Common/ATE测试基础|ATE 测试基础]]
- [[30.areas/PMIC/Common/时序测试|时序测试方法]]
