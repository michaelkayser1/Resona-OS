"""Initialize a NEW local destination store; never migrates an existing database."""
import argparse
from pathlib import Path
from resona_sandbox.storage import DestinationStore

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("path", type=Path)
args = parser.parse_args()
print(DestinationStore.initialize(str(args.path.resolve())))
