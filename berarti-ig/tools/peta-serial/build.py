"""Bangun halaman Peta Serial Speaking dari berarti-ig/18-peta-serial-speaking-index.md.

Pakai: python3 berarti-ig/tools/peta-serial/build.py
Hasil: berarti-ig/tools/peta-serial/index.html (publish sebagai Artifact).
"""
import json, re, pathlib
HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent.parent / "18-peta-serial-speaking-index.md"
md = SRC.read_text(encoding="utf-8")

def table_after(heading):
    i = md.index(heading)
    rows = []
    for line in md[i:].splitlines()[1:]:
        if line.startswith("## "): break
        if line.startswith("|") and not re.match(r"\|\s*-", line):
            rows.append([c.strip() for c in line.strip().strip("|").split("|")])
    return rows[1:]

status = {r[0]: r for r in table_after("## Status produksi")}
old = [[re.sub(r"`", "", c) for c in r] for r in table_after("## Konten lama dan posisinya di peta")]

eps, mp = [], None
for block in re.split(r"\n(?=## MP-|### EP )", md):
    m = re.match(r"## MP-(\d)", block)
    if m: mp = int(m.group(1)); continue
    m = re.match(r"### EP (\d+) · Pilar (\S+)", block)
    if not m: continue
    no = m.group(1)
    hook = re.search(r"\*\*Hook:\*\* (.*)", block).group(1)
    note = re.search(r"\nCatatan: (.*)", block)
    items, loop = [], 0
    for r in re.findall(r"^\| (\d+)( \(open loop\))? \| (.*?) \| (.*?) \|$", block, re.M):
        items.append([r[2], r[3]])
        if r[1]: loop = int(r[0])
    cta = re.search(r"\*\*CTA:\*\* (.*)", block).group(1)
    q = re.search(r"Soal tes terkait: (.*)", block)
    st = status.get(no, [no, "", "", "", "belum", "", ""])
    eps.append({"ep": int(no), "mp": mp, "p": m.group(2), "s": st[4] or "belum", "pic": st[6] if len(st) > 6 else "",
                "hook": hook, "loop": loop, "it": items, "cta": cta, "q": q.group(1) if q else "",
                "note": re.sub(r"`", "", note.group(1)) if note else ""})
assert len(eps) == 30, f"harus 30 episode, ketemu {len(eps)}"

h = (HERE / "template.html").read_text(encoding="utf-8")
def put(h, start, end, value):
    a, b = h.index(start), h.index(end)
    return h[:a] + start + json.dumps(value, ensure_ascii=False) + ";\n" + h[b:]
h = put(h, "const E=", "const FUN=", eps)
h = put(h, "const OLD=", "const PIL=", old)
(HERE / "index.html").write_text(h, encoding="utf-8")
done = sum(e["s"] != "belum" for e in eps)
print(f"index.html dibangun: 30 episode, {done} sudah dikerjakan")
