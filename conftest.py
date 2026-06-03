import sys
from pathlib import Path

# src/csf must resolve before tests/csf — both have __init__.py and pytest
# adds tests/ to sys.path, which would shadow the real package otherwise.
_src = str(Path(__file__).resolve().parent / "src")
if _src not in sys.path:
    sys.path.insert(0, _src)
