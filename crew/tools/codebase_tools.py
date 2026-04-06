"""Custom tools that give CrewAI agents read/write access to the
QuickTrade (worker-connect) codebase."""

from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

# Root of the Next.js project – one level up from this file's parent dir
PROJECT_ROOT = Path(__file__).resolve().parents[1]


# ---------------------------------------------------------------------------
# Input schemas
# ---------------------------------------------------------------------------

class ReadFileInput(BaseModel):
    path: str = Field(
        description=(
            "Path to the file, relative to the project root "
            "(e.g. 'lib/services/jobService.ts') or absolute."
        )
    )


class WriteFileInput(BaseModel):
    path: str = Field(
        description=(
            "Path where the file should be written, relative to the "
            "project root (e.g. 'lib/services/newService.ts')."
        )
    )
    content: str = Field(description="Full content to write to the file.")


class ListFilesInput(BaseModel):
    directory: str = Field(
        default=".",
        description=(
            "Directory to list, relative to the project root. "
            "Defaults to the project root itself."
        ),
    )


class SearchCodebaseInput(BaseModel):
    pattern: str = Field(
        description="Text or regex pattern to search for across the codebase."
    )
    file_glob: str = Field(
        default="**/*.{ts,tsx,js,jsx}",
        description="Glob pattern to restrict which files are searched.",
    )


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

class ReadFileTool(BaseTool):
    name: str = "ReadFile"
    description: str = (
        "Read the contents of any file inside the QuickTrade project. "
        "Provide the path relative to the project root."
    )
    args_schema: Type[BaseModel] = ReadFileInput

    def _run(self, path: str) -> str:
        target = _resolve(path)
        if not target.exists():
            return f"File not found: {target}"
        try:
            return target.read_text(encoding="utf-8")
        except Exception as exc:  # noqa: BLE001
            return f"Error reading file: {exc}"


class WriteFileTool(BaseTool):
    name: str = "WriteFile"
    description: str = (
        "Create or overwrite a file inside the QuickTrade project. "
        "Provide the path relative to the project root and the full file content."
    )
    args_schema: Type[BaseModel] = WriteFileInput

    def _run(self, path: str, content: str) -> str:
        target = _resolve(path)
        try:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")
            return f"Successfully wrote {target.relative_to(PROJECT_ROOT)}"
        except Exception as exc:  # noqa: BLE001
            return f"Error writing file: {exc}"


class ListProjectFilesTool(BaseTool):
    name: str = "ListProjectFiles"
    description: str = (
        "List files and directories inside the QuickTrade project. "
        "Provide a directory path relative to the project root."
    )
    args_schema: Type[BaseModel] = ListFilesInput

    def _run(self, directory: str = ".") -> str:
        target = _resolve(directory)
        if not target.is_dir():
            return f"Not a directory: {target}"
        lines: list[str] = []
        for item in sorted(target.iterdir()):
            rel = item.relative_to(PROJECT_ROOT)
            suffix = "/" if item.is_dir() else ""
            lines.append(f"{rel}{suffix}")
        return "\n".join(lines) if lines else "(empty directory)"


class SearchCodebaseTool(BaseTool):
    name: str = "SearchCodebase"
    description: str = (
        "Search the QuickTrade codebase for a text pattern using grep. "
        "Returns matching file paths and lines."
    )
    args_schema: Type[BaseModel] = SearchCodebaseInput

    def _run(self, pattern: str, file_glob: str = "**/*.{ts,tsx,js,jsx}") -> str:
        try:
            result = subprocess.run(
                ["grep", "-rn", "--include=*.ts", "--include=*.tsx",
                 "--include=*.js", "--include=*.jsx",
                 "-e", pattern, str(PROJECT_ROOT)],
                capture_output=True,
                text=True,
                timeout=30,
            )
            output = result.stdout.strip()
            if not output:
                return f"No matches found for pattern: {pattern!r}"
            # Make paths relative to project root for readability
            lines = []
            for line in output.splitlines():
                lines.append(line.replace(str(PROJECT_ROOT) + "/", ""))
            return "\n".join(lines[:200])  # cap at 200 lines
        except Exception as exc:  # noqa: BLE001
            return f"Error searching codebase: {exc}"


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _resolve(path: str) -> Path:
    """Return an absolute Path, rooted at PROJECT_ROOT if not already absolute."""
    p = Path(path)
    if p.is_absolute():
        return p
    return PROJECT_ROOT / p


# Convenience export
ALL_TOOLS = [
    ReadFileTool(),
    WriteFileTool(),
    ListProjectFilesTool(),
    SearchCodebaseTool(),
]
