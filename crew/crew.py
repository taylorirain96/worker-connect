"""QuickTrade feature-building crew.

Wires up the Researcher and Developer agents with their tasks and tools.
"""

from __future__ import annotations

from pathlib import Path

import yaml
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from tools.codebase_tools import (
    ListProjectFilesTool,
    ReadFileTool,
    SearchCodebaseTool,
    WriteFileTool,
)

_CONFIG_DIR = Path(__file__).parent / "config"


@CrewBase
class QuickTradeCrew:
    """Crew that researches and implements new features for the QuickTrade app."""

    agents_config = str(_CONFIG_DIR / "agents.yaml")
    tasks_config = str(_CONFIG_DIR / "tasks.yaml")

    # ------------------------------------------------------------------
    # Agents
    # ------------------------------------------------------------------

    @agent
    def researcher(self) -> Agent:
        config = self._load_agent_config("researcher")
        return Agent(
            **config,
            tools=[
                ListProjectFilesTool(),
                ReadFileTool(),
                SearchCodebaseTool(),
            ],
            verbose=True,
        )

    @agent
    def developer(self) -> Agent:
        config = self._load_agent_config("developer")
        return Agent(
            **config,
            tools=[
                ReadFileTool(),
                WriteFileTool(),
                ListProjectFilesTool(),
                SearchCodebaseTool(),
            ],
            verbose=True,
        )

    # ------------------------------------------------------------------
    # Tasks
    # ------------------------------------------------------------------

    @task
    def research_feature(self) -> Task:
        config = self._load_task_config("research_feature")
        return Task(
            **config,
            agent=self.researcher(),
        )

    @task
    def implement_feature(self) -> Task:
        config = self._load_task_config("implement_feature")
        return Task(
            **config,
            agent=self.developer(),
            context=[self.research_feature()],
        )

    # ------------------------------------------------------------------
    # Crew
    # ------------------------------------------------------------------

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=[self.researcher(), self.developer()],
            tasks=[self.research_feature(), self.implement_feature()],
            process=Process.sequential,
            verbose=True,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _load_agent_config(self, name: str) -> dict:
        with open(self.agents_config, encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data[name]

    def _load_task_config(self, name: str) -> dict:
        with open(self.tasks_config, encoding="utf-8") as f:
            data = yaml.safe_load(f)
        cfg = dict(data[name])
        # 'agent' and 'context' keys are set programmatically, not from YAML
        cfg.pop("agent", None)
        cfg.pop("context", None)
        return cfg
