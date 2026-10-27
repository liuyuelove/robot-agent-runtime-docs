#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""发布前隐私自检。

通用规则内置在本文件（不含任何真实敏感词）；
项目专属敏感词放在仓库根目录的 .privacy-terms.txt（每行一个，已被 .gitignore 排除）。

用法:
    python3 scripts/check_privacy.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCAN_SUFFIXES = {".html", ".md", ".js", ".css", ".json", ".yml", ".yaml"}

# 通用模式：不包含任何真实敏感信息
PATTERNS = [
    ("内网 IP", re.compile(r"\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
                           r"192\.168\.\d{1,3}\.\d{1,3}|"
                           r"172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b")),
    ("邮箱地址", re.compile(r"[\w.+-]+@[\w-]+\.[\w.]{2,}")),
    ("疑似凭证", re.compile(r"(?i)\b(?:api[_-]?key|secret|password|token)\b\s*[:=]\s*"
                            r"['\"]?[A-Za-z0-9_\-]{12,}")),
    ("内网域名", re.compile(r"\b[\w-]+\.(?:corp|internal|local|intra)\b")),
]

# 允许出现的内容
ALLOW = [
    re.compile(r"127\.0\.0\.1"),
    re.compile(r"192\.0\.2\.\d+"),           # RFC 5737 文档保留地址
    re.compile(r"[\w.+-]+@(?:example\.(?:com|org)|users\.noreply\.github\.com)"),
    re.compile(r"creativecommons\.org"),
]


def load_terms() -> list[str]:
    f = ROOT / ".privacy-terms.txt"
    if not f.exists():
        return []
    return [ln.strip() for ln in f.read_text(encoding="utf-8").splitlines()
            if ln.strip() and not ln.strip().startswith("#")]


def allowed(text: str, start: int, end: int) -> bool:
    return any(p.fullmatch(text) or p.search(text) for p in ALLOW)


def main() -> int:
    terms = load_terms()
    hits: list[tuple[str, int, str, str]] = []

    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in SCAN_SUFFIXES:
            continue
        if ".git" in path.parts:
            continue
        for lineno, line in enumerate(path.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
            for label, rx in PATTERNS:
                for m in rx.finditer(line):
                    if not allowed(m.group(0), m.start(), m.end()):
                        hits.append((str(path.relative_to(ROOT)), lineno, label, m.group(0)))
            low = line.lower()
            for term in terms:
                if term.lower() in low:
                    hits.append((str(path.relative_to(ROOT)), lineno, "专属敏感词", term))

    if not hits:
        scope = f"{len(terms)} 个专属敏感词 + {len(PATTERNS)} 条通用规则" if terms else f"{len(PATTERNS)} 条通用规则"
        print(f"✅ 未发现敏感内容（已检查：{scope}）")
        return 0

    print(f"❌ 发现 {len(hits)} 处疑似敏感内容：\n")
    for path, lineno, label, value in hits:
        print(f"  {path}:{lineno}  [{label}]  {value}")
    print("\n修复后重新运行本脚本。")
    return 1


if __name__ == "__main__":
    sys.exit(main())
