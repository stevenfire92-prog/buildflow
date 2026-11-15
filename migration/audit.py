#!/usr/bin/env python3
"""Inventory source dependencies only. Never reads secrets, data, or node_modules."""
import json
import re
from pathlib import Path


def audit(root):
    references = []
    environment_names = set()
    for folder in ('src', 'api', 'base44'):
        for path in sorted((root / folder).rglob('*')):
            if not path.is_file() or path.suffix not in ('.js', '.jsx', '.ts', '.tsx', '.jsonc'):
                continue
            source = path.read_text()
            for match in re.finditer(r'\bbase44\s*\.\s*(?:asServiceRole\s*\.\s*)?(auth|entities|integrations|functions|agents|appLogs)\b', source):
                references.append({'path': str(path.relative_to(root)), 'line': source.count('\n', 0, match.start()) + 1, 'service': match.group(1)})
            environment_names.update(re.findall(r'(?:Deno\.env\.get\(|process\.env\[)[\s]*[\"\x27]([A-Z][A-Z0-9_]*)', source))
            environment_names.update(re.findall(r'(?:process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]*)', source))

    def paths(folder, pattern):
        return [str(p.relative_to(root)) for p in sorted((root / folder).glob(pattern)) if p.is_file()]

    return {
        'schemaVersion': 1,
        'scope': 'static-source-only; dynamically constructed SDK access may be missed',
        'entities': paths('base44/entities', '*.jsonc'),
        'backendFunctions': paths('base44/functions', '*/entry.ts'),
        'workflows': paths('base44/workflows', '*.jsonc'),
        'connectors': paths('base44/connectors', '*.jsonc'),
        'existingVercelRoutes': paths('api', '**/*.js'),
        'environmentNamesReferencedDirectly': sorted(environment_names),
        'base44References': references,
    }


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    destination = root / 'migration' / 'inventory.json'
    destination.write_text(json.dumps(audit(root), indent=2) + '\n')
    print(json.dumps({'entities': len(audit(root)['entities']), 'functions': len(audit(root)['backendFunctions']), 'output': str(destination.relative_to(root))}))
