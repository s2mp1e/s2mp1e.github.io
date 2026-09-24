---
title: "AEC-Q100 车规可靠性知识库"
tags:
  - automotive
  - aec-q100
  - reliability
  - index
created: 2026-07-18
---

# AEC-Q100 车规可靠性知识库 / Automotive Reliability Knowledge Base

> AEC-Q100 是汽车电子委员会 (AEC) 制定的集成电路车规级可靠性验证标准。本知识库覆盖 AEC-Q100 的测试组、可靠性试验方法、以及与 ATE 量产测试的关系。

---

## ⭐ 子页面导航 / Subpages

| 页面 | 内容 |
|------|------|
| [[30.areas/AEC-Q100/01_AECQ100_概述\|01 — AEC-Q100 概述]] | 测试组 (A~G)、温度等级、Qual vs 量产 |
| [[30.areas/AEC-Q100/02_环境应力测试\|02 — 环境应力测试]] | Group A: TC/PTC/HTSL/THB/HAST/AC/UHST |
| [[30.areas/AEC-Q100/03_寿命测试\|03 — 寿命测试]] | Group B: HTOL/ELFR/EDR、加速模型 |
| [[30.areas/AEC-Q100/04_封装完整性\|04 — 封装完整性测试]] | Group C: WBS/SD/PD/LI/SBS |
| [[30.areas/AEC-Q100/05_ESD与Latchup\|05 — ESD 与 Latch-up]] | Group E: HBM/CDM/LU 测试方法 |
| [[30.areas/AEC-Q100/06_BurnIn与筛片\|06 — Burn-In 与筛片]] | Group F: PAT/SBA、量产 BI 策略 |
| [[30.areas/AEC-Q100/07_ATE量产车规测试\|07 — ATE 量产车规测试]] | 车规量产测试策略、三温、数据要求 |
| [[30.areas/AEC-Q100/08_车规认证流程\|08 — 车规认证流程]] | Qualification 流程、PPAP、文档 |

---

## 测试组总览 / Test Groups Overview

| 组 | 名称 | 测试内容 | 试验样本 |
|----|------|---------|---------|
| **A** | 加速环境应力 | PC, THB, HAST, AC, UHST, TC, PTC, HTSL | 77 颗/批 × 3 批 |
| **B** | 加速寿命模拟 | HTOL, ELFR, EDR | 77×3 |
| **C** | 封装组装完整性 | WBS, WBP, SD, PD, SBS, LI, DS | 10~40×3 |
| **D** | 芯片制造可靠性 | EM, TDDB, HCI, NBTI, SM | 晶圆级 |
| **E** | 电气验证 | TEST, HBM/MM, CDM, LU, ED, FG, CHAR, EMC, SC, SER | 3~30×3 |
| **F** | 缺陷筛查 | PAT, SBA | 全批次 |
| **G** | 腔体封装完整性 | MS, VFV, CA, GFL, DROP, LT, DS, IWV, PD | 8~40×3 |

---

## 温度等级 / Temperature Grades

| 等级 | 工作温度范围 | 典型应用 |
|------|-------------|---------|
| **Grade 0** | -40°C ~ +150°C | 发动机舱、变速箱 |
| **Grade 1** | -40°C ~ +125°C | 车身、底盘 |
| **Grade 2** | -40°C ~ +105°C | 座舱电子 |
| **Grade 3** | -40°C ~ +85°C | 信息娱乐 |

---

## 相关领域

- [[30.areas/PMIC/_index|PMIC 知识库]] — 车规 PMIC 测试
- [[30.areas/MCU/_index|MCU 知识库]] — 车规 MCU 测试
- [[30.areas/PMIC/Common/FT|PMIC FT 指南]] — 三温 FT 基础
