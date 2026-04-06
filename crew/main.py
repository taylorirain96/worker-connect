#!/usr/bin/env python3
"""Entry point for the QuickTrade CrewAI feature-builder.

Usage
-----
    # From the crew/ directory:
    python main.py "Add a real-time notifications panel to the dashboard"

    # Or pass the feature as an env var:
    FEATURE_REQUEST="Add dark-mode toggle to the nav bar" python main.py
"""

from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

# Load .env (OPENAI_API_KEY etc.) from the crew/ directory first,
# then fall back to the project root .env.
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

from crew import QuickTradeCrew  # noqa: E402  (import after env load)


def main() -> None:
    # Feature request from CLI arg or env var
    if len(sys.argv) > 1:
        feature_request = " ".join(sys.argv[1:])
    else:
        feature_request = os.getenv("FEATURE_REQUEST", "").strip()

    if not feature_request:
        print(
            "Usage: python main.py \"<feature request>\"\n"
            "   or: FEATURE_REQUEST=\"<feature request>\" python main.py",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"\n🚀  Starting QuickTrade feature crew for:\n   {feature_request}\n")

    result = QuickTradeCrew().crew().kickoff(
        inputs={"feature_request": feature_request}
    )

    print("\n✅  Crew finished.\n")
    print(result)


if __name__ == "__main__":
    main()
