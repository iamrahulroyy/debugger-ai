# PromptForge Python Contracts

Python Pydantic models generated from `packages/schema/prompt.schema.json`.

## Installation

```bash
pip install -e packages/py-contracts
```

## Usage

```python
from promptforge_contracts import PromptSchema, ExpertiseLevel, Tone, WritingStyle

schema = PromptSchema(
    role="Software Architect",
    domain="Software Engineering",
    expertise_level=ExpertiseLevel.ADVANCED,
    tone=Tone.PROFESSIONAL,
    writing_style=WritingStyle.ANALYTICAL,
    objective="Design a microservices architecture for an e-commerce platform"
)
```

## Invariant

> **This package is auto-generated. Do not edit directly.**
> All changes must originate from `packages/schema`.
