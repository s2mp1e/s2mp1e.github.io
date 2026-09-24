---
title: "Security 模块测试详解"
tags:
  - mcu
  - security
  - aes
  - trng
  - crc
  - ate
created: 2026-07-18
---

# Security 模块测试详解 / Security Module Testing

---

## 一、AES 加密引擎测试

### 1.1 AES 原理要点

```
AES (Advanced Encryption Standard):

  密钥长度: 128 / 192 / 256 bit
  分组长度: 128 bit (固定)
  轮数: 10 / 12 / 14 轮
  模式: ECB, CBC, CTR, GCM 等
```

### 1.2 ATE 测试方法 — 标准向量测试

```
使用 NIST/FIPS 官方测试向量验证:

FIPS-197 标准向量 (AES-128 示例):

  Key:    000102030405060708090a0b0c0d0e0f
  Plain:  00112233445566778899aabbccddeeff
  Cipher: 69c4e0d86a7b0430d8cdb78070b4c55a

测试步骤:
  ① 配置 AES 引擎 (Key + Mode)
  ② 写入 Plain Text
  ③ 启动加密
  ④ 读取 Cipher Text
  ⑤ 与标准向量比对
  ⑥ 完全一致 → PASS

其他测试:
  ① 解密测试: Cipher → Plain
  ② 各密钥长度: 128/192/256
  ③ 各模式: ECB/CBC/CTR...
  ④ 错误注入: 错误密钥 → 输出不匹配
```

### 1.3 测试时间

```
AES-128 单次加密: 几十 μs (硬件引擎)
完整向量测试: ~10ms

量产: 1~2 组标准向量即可 (功能验证)
```

---

## 二、TRNG 测试 (真随机数)

### 2.1 TRNG 原理

```
常见 TRNG 熵源:

① 环形振荡器抖动 (Ring OSC Jitter)
② 热噪声放大 (Thermal Noise)
③ 亚稳态采样 (Metastability)
④ 放射性衰变 (极罕见)

MCU 常用: Ring OSC Jitter 方案
  → 多个 OSC 相位抖动 → 采样 → 熵提取
```

### 2.2 ATE 测试方法 — 随机性统计测试

```
基本流程:
  ① 使能 TRNG
  ② 采集 N 个随机数 (如 10000 × 32bit)
  ③ 统计测试

量产级统计测试 (简化):

① 频数测试 (Frequency Test):
   - 0 和 1 的比例 ≈ 50%
   - 偏差 < 0.1% (大量数据下)

② 相邻相关性:
   - 前后数据无相关性

③ 重复检测:
   - 无完全相同的连续数据块

④ 不同芯片差异性:
   - 两颗芯片的序列完全不同

QA 级 (Sample): NIST SP800-22 全套
  - 15 项统计测试
  - 每项通过率 > 96%
```

### 2.3 测试注意事项

```
① 采集量: 随机性测试需要大量数据 (≥ 1Mbit)
② 测试时间: 数据采集 + 统计 = 几秒 (Sample 级)
③ 量产简化: 只做频数 + 重复检测 (~100ms)
④ 温度影响: 熵源质量随温度变化 (三温各测)
```

---

## 三、CRC 测试

### 3.1 CRC 原理

```
CRC (Cyclic Redundancy Check):

常用多项式:
  CRC-8:  x^8 + x^2 + x + 1 (0x07)
  CRC-16: x^16 + x^15 + x^2 + 1 (0x8005)
  CRC-32: 0x04C11DB7 (Ethernet)

硬件实现: LFSR (线性反馈移位寄存器)
```

### 3.2 ATE 测试

```
标准向量测试:

CRC-32 示例:
  Data: "123456789"
  CRC-32: 0xCBF43926

测试步骤:
  ① 配置 CRC 引擎 (多项式选择)
  ② 写入测试数据
  ③ 读取 CRC 结果
  ④ 与标准值比对

测试覆盖:
  ① 各多项式 (8/16/32)
  ② 不同数据长度
  ③ 复位/重载功能
  ④ 位反转/字节序选项
```

---

## 四、SHA/HMAC 测试

```
SHA-256 标准向量:

  Input: "abc"
  SHA-256: ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad

测试方法: 与 AES 类似, 标准向量比对
覆盖: SHA-1, SHA-224, SHA-256, HMAC 模式
```

---

## 五、Flash 读保护 (RDP) 测试

```
安全 MCU 的读保护功能:

RDP Level 0: 完全开放 (调试口可读 Flash)
RDP Level 1: 读保护 (Flash 不可通过调试口读)
RDP Level 2: 永久保护 (不可逆)

测试:
  ① 设置 RDP Level 1
  ② 尝试通过 SWD 读 Flash → 必须失败
  ③ 芯片功能正常 (CPU 可执行)
  ④ 恢复 Level 0 → 需要全擦除
  ⑤ 设置 Level 2 → 永久 (Sample 测试)
```

---

## 参考资料

- [[30.areas/MCU/Memory/Flash_SRAM_测试|Flash 测试]] — RDP 相关
- [[30.areas/MCU/Common/MCU_FT|MCU FT 完整指南]]
