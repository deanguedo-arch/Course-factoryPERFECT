import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateProjectData } from '../../src/utils/migrations.js';

const createLegacyProject = (assessments) => ({
  projectSchemaVersion: 4,
  'Course Settings': {},
  'Current Course': {
    name: 'Course',
    modules: [
      {
        id: 'item-assessments',
        title: 'Assessments',
        assessments,
      },
    ],
    materials: [],
  },
  'Global Toolkit': [],
});

test('migration defaults legacy assessments with missing placements to hub', () => {
  const migrated = migrateProjectData(
    createLegacyProject([
      { id: 'assess-a', title: 'A', type: 'mixed', html: '', script: '' },
      { id: 'assess-b', title: 'B', type: 'mixed', html: '', script: '', placements: [] },
    ]),
  );

  const assessments = migrated?.['Current Course']?.modules?.[0]?.assessments || [];
  assert.deepEqual(assessments[0].placements, [{ targetType: 'hub' }]);
  assert.deepEqual(assessments[1].placements, [{ targetType: 'hub' }]);
});

test('migration preserves valid module placement targets', () => {
  const migrated = migrateProjectData(
    createLegacyProject([
      {
        id: 'assess-c',
        title: 'C',
        type: 'mixed',
        html: '',
        script: '',
        placements: [{ targetType: 'module', moduleId: 'view-1' }, { targetType: 'module', moduleId: 'view-1' }],
      },
    ]),
  );

  const assessments = migrated?.['Current Course']?.modules?.[0]?.assessments || [];
  assert.deepEqual(assessments[0].placements, [{ targetType: 'module', moduleId: 'view-1' }]);
});
