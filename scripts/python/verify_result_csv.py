"""Check a result CSV against the CC export and the exclusion list, then sort it newest account first.

Usage:
    python3 verify_result_csv.py data/cc-export.csv data/excl.txt data/result.csv data/result-sorted.csv

- Every email in the result must be in the CC export (No Permissions Set).
- No email in the result may be in the exclusion list (the other result files).
"""
import csv
import sys


def main(cc_path, excl_path, result_path, out_path):
    cc = {r["Email address"].strip().lower() for r in csv.DictReader(open(cc_path, encoding="utf-8-sig"))}
    excl = set(open(excl_path, encoding="utf-8").read().lower().split())
    rows = list(csv.reader(open(result_path, encoding="utf-8-sig")))
    header, body = rows[0], rows[1:]

    not_in_cc = [r[0] for r in body if r[0].lower() not in cc]
    in_excl = [r[0] for r in body if r[0].lower() in excl]
    if not_in_cc or in_excl:
        sys.exit(f"not in CC export: {len(not_in_cc)}, in exclusion list: {len(in_excl)}")

    body.sort(key=lambda r: r[4], reverse=True)  # column 5 = account created
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(body)
    print(f"{len(body)} rows OK -> {out_path}")


if __name__ == "__main__":
    main(*sys.argv[1:5])
