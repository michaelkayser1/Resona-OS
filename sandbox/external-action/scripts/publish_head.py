"""Publish an actor's signed head to the separately run custodian."""
import argparse
import json
from pathlib import Path
from urllib import request as http

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from resona_sandbox.storage import OpLog


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--actor", required=True, choices=("witness", "executor", "marker"))
    parser.add_argument("--log-db", required=True)
    parser.add_argument("--key-file", required=True)
    parser.add_argument("--custodian-url", required=True)
    parser.add_argument("--custodian-token-file", required=True)
    args = parser.parse_args()
    if not args.custodian_url.startswith("http://127.0.0.1:"):
        raise SystemExit("Custodian must be on loopback in this sandbox")
    private = Ed25519PrivateKey.from_private_bytes(bytes.fromhex(Path(args.key_file).read_text().strip()))
    signed = OpLog(args.log_db, args.actor).signed_head(private)
    req = http.Request(
        args.custodian_url + "/heads",
        data=json.dumps(signed, sort_keys=True, separators=(",", ":")).encode(),
        headers={"Content-Type": "application/json",
                 "Authorization": "Bearer " + Path(args.custodian_token_file).read_text().strip()},
    )
    with http.urlopen(req, timeout=3) as response:
        print(response.read().decode())


if __name__ == "__main__":
    main()
