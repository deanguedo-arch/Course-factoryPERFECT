import test from 'node:test';
import assert from 'node:assert/strict';
import { buildModuleFrameHTML, buildSiteHtml } from '../../src/utils/generators.js';

const createAssessment = ({
  id,
  title,
  order = 0,
  placements = [{ targetType: 'hub' }],
}) => ({
  id,
  title,
  type: 'mixed',
  order,
  hidden: false,
  placements,
  html: `<section id="mixed_${id}"><h3>${title}</h3></section>`,
  script: '',
});

const baseSettings = {
  __courseName: 'Course',
  __toolkit: [],
  __materials: [],
};

test('single module export for assessments module includes explicitly selected assessments only', () => {
  const assessments = [
    createAssessment({ id: 'assess-a', title: 'Assessment A', order: 0 }),
    createAssessment({ id: 'assess-b', title: 'Assessment B', order: 1 }),
  ];
  const module = {
    id: 'item-assessments',
    title: 'Assessments',
    assessments,
  };

  const html = buildModuleFrameHTML(module, {
    ...baseSettings,
    __assessments: assessments,
    __selectedAssessmentIds: ['assess-b'],
    __exportModuleId: 'item-assessments',
  });

  assert.match(html, /Assessment B/);
  assert.doesNotMatch(html, /Assessment A/);
});

test('single module export uses module placement fallback when explicit assessment selection is empty', () => {
  const assessments = [
    createAssessment({
      id: 'assess-hub',
      title: 'Hub Assessment',
      order: 0,
      placements: [{ targetType: 'hub' }],
    }),
    createAssessment({
      id: 'assess-module',
      title: 'Module Assessment',
      order: 1,
      placements: [{ targetType: 'module', moduleId: 'view-1' }],
    }),
    createAssessment({
      id: 'assess-legacy',
      title: 'Legacy Assessment',
      order: 2,
      placements: [],
    }),
  ];
  const module = {
    id: 'item-assessments',
    title: 'Assessments',
    assessments,
  };

  const html = buildModuleFrameHTML(module, {
    ...baseSettings,
    __assessments: assessments,
    __selectedAssessmentIds: [],
    __exportModuleId: 'view-1',
  });

  assert.match(html, /Module Assessment/);
  assert.doesNotMatch(html, /Hub Assessment/);
  assert.doesNotMatch(html, /Legacy Assessment/);
});

test('hub export fallback includes hub-targeted and legacy assessments', () => {
  const assessments = [
    createAssessment({
      id: 'assess-hub',
      title: 'Hub Assessment',
      order: 0,
      placements: [{ targetType: 'hub' }],
    }),
    createAssessment({
      id: 'assess-module',
      title: 'Module Assessment',
      order: 1,
      placements: [{ targetType: 'module', moduleId: 'view-1' }],
    }),
    createAssessment({
      id: 'assess-legacy',
      title: 'Legacy Assessment',
      order: 2,
      placements: [],
    }),
  ];
  const module = {
    id: 'item-assessments',
    title: 'Assessments',
    assessments,
  };

  const html = buildModuleFrameHTML(module, {
    ...baseSettings,
    __assessments: assessments,
    __selectedAssessmentIds: [],
    __exportModuleId: 'item-assessments',
  });

  assert.match(html, /Hub Assessment/);
  assert.match(html, /Legacy Assessment/);
  assert.doesNotMatch(html, /Module Assessment/);
});

test('full site compile hub assessment center excludes module-targeted assessments', () => {
  const assessments = [
    createAssessment({
      id: 'assess-hub',
      title: 'Hub Assessment',
      order: 0,
      placements: [{ targetType: 'hub' }],
    }),
    createAssessment({
      id: 'assess-module',
      title: 'Module Assessment',
      order: 1,
      placements: [{ targetType: 'module', moduleId: 'view-1' }],
    }),
    createAssessment({
      id: 'assess-legacy',
      title: 'Legacy Assessment',
      order: 2,
      placements: [],
    }),
  ];
  const modules = [
    {
      id: 'item-assessments',
      title: 'Assessments',
      assessments,
    },
  ];
  const projectData = {
    "Course Settings": {},
    "Current Course": {
      name: 'Course',
      modules,
      materials: [],
    },
    "Global Toolkit": [],
  };

  const html = buildSiteHtml({
    modules,
    toolkit: [],
    excludedIds: [],
    initialViewKey: null,
    projectData,
  });

  assert.match(html, /Hub Assessment/);
  assert.match(html, /Legacy Assessment/);
  assert.doesNotMatch(html, /Module Assessment/);
});
