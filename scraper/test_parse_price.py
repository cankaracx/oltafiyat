"""Unit tests for parse_price() — Turkish price-string parsing.

Run with: python -m pytest scraper/test_parse_price.py -v
(or plain `python scraper/test_parse_price.py` if pytest isn't installed)

Turkish numbers use "." as the thousands separator and "," as the decimal
separator (the opposite of US/UK notation), e.g. "12.500,00 TL" == 12500.00.
Many stores omit the kuruş part entirely for round prices, e.g. "12.500 TL"
== 12500 TL, not 12.5 TL. That ambiguous no-comma case is what this test
file guards against regressing.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from scraper import parse_price  # noqa: E402


CASES = [
    # (raw input, expected parsed price)
    ("12.500 TL", 12500.0),          # thousands separator, no kuruş
    ("2.499 TL", 2499.0),
    ("15.750 TL", 15750.0),
    ("1.234.567 TL", 1234567.0),      # multiple thousands groups
    ("899,00 TL", 899.0),             # plain decimal, no grouping
    ("1.899,00 TL", 1899.0),          # grouping + decimal together
    ("12.500,50 TL", 12500.5),
    ("499 TL", 499.0),                # small number, no separators at all
    ("₺2.999", 2999.0),               # currency symbol before the number
    ("2.999,00 TRY", 2999.0),
    ("1 250 TL", 1250.0),             # space as thousands separator
    ("", None),
    (None, None),
    ("stokta yok", None),
    ("0 TL", None),                   # zero/negative prices are invalid
]


def test_parse_price_cases():
    failures = []
    for raw, expected in CASES:
        actual = parse_price(raw)
        if actual != expected:
            failures.append(f"parse_price({raw!r}) = {actual!r}, expected {expected!r}")
    assert not failures, "\n" + "\n".join(failures)


if __name__ == "__main__":
    test_parse_price_cases()
    print(f"All {len(CASES)} parse_price cases passed.")
