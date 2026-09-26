"""Generate one isolated Ed25519 test key pair; never commit the output."""
import argparse
import os
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("prefix", help="Path prefix for .private.hex and .public.hex")
    args = parser.parse_args()
    key = Ed25519PrivateKey.generate()
    private = key.private_bytes(serialization.Encoding.Raw, serialization.PrivateFormat.Raw,
                                serialization.NoEncryption()).hex()
    public = key.public_key().public_bytes(serialization.Encoding.Raw,
                                            serialization.PublicFormat.Raw).hex()
    for suffix, value in ((".private.hex", private), (".public.hex", public)):
        path = args.prefix + suffix
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w") as output:
            output.write(value + "\n")
    print("Generated test keys at", args.prefix)


if __name__ == "__main__":
    main()
