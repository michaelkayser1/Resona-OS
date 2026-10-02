"""Example attacker using only the live challenge's client-side fixture."""
import argparse
import copy
import json
import sys
from pathlib import Path
from urllib import error, request

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from resona_sandbox.wire import fingerprint


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--client", type=Path, required=True)
    parser.add_argument("--mode", choices=("altered", "authorized", "replay"), default="altered")
    parser.add_argument("--save", type=Path, help="Save attempted body and HTTP response")
    args = parser.parse_args()
    connection = json.loads((args.client / "connection.json").read_text())
    body = copy.deepcopy(json.loads((args.client / "execute.json").read_text()))
    if args.mode == "altered":
        body["proposal"]["action"]["marker"] = "manual_UNAUTHORIZED_marker"
        body["proposal"]["action_fingerprint"] = fingerprint(body["proposal"]["action"])
    req = request.Request(connection["executor_url"] + "/execute", json.dumps(body).encode(),
                          {"Authorization": "Bearer " + connection["executor_token"],
                           "Content-Type": "application/json"})
    try:
        with request.urlopen(req, timeout=5) as response:
            status, result = response.status, json.load(response)
    except error.HTTPError as exc:
        status, result = exc.code, json.load(exc)
    record = {"mode": args.mode, "attempt": body, "http_status": status, "response": result}
    if args.save:
        with args.save.open("x") as output:
            json.dump(record, output, indent=2, sort_keys=True)
            output.write("\n")
    print(json.dumps({"http_status": status, "response": result}, indent=2))
    # This is a probe: an HTTP denial is an observation, not an automatic pass.
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
