import json, sys, time, urllib.parse, urllib.request, os
qs = {"whoosh": ["whoosh", "swoosh", "woosh transition"],
      "pop": ["pop", "ui pop", "bubble pop", "soft click"],
      "impact": ["impact", "cinematic hit", "boom impact", "thud"],
      "chime": ["chime", "notification chime", "bell ding"],
      "riser": ["riser", "shimmer", "magic sparkle"]}
out = {}
for cat, ql in qs.items():
    for q in ql:
        url = "https://api.openverse.org/v1/audio/?" + urllib.parse.urlencode(
            {"q": q, "license": "cc0", "page_size": 20, "length": "shortest,short"})
        for attempt in range(4):
            try:
                import subprocess; d = json.loads(subprocess.run(["curl", "-sS", "--max-time", "30", url], capture_output=True, text=True, check=True).stdout); break
            except Exception as e:
                print("retry", q, e); time.sleep(15)
        else:
            continue
        for r in d.get("results", []):
            out[r["id"]] = dict(cat=cat, q=q, title=r["title"], dur=r.get("duration"), url=r["url"],
                                src=r["source"], lic=r["license"], creator=r.get("creator"),
                                page=r.get("foreign_landing_url"))
        time.sleep(3)
json.dump(out, open("cands.json", "w"), indent=1)
from collections import Counter
print(len(out), Counter(v["cat"] for v in out.values()))
