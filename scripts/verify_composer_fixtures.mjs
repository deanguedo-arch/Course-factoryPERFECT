#!/usr/bin/env node
import { compileProjectToFilesMap, compileModuleToHtml } from '../src/utils/compiler.js';
import { buildLegacyCompiledHtml } from '../src/utils/generators.js';

const activityFixtures = [
  {
    type: 'content_block',
    marker: 'Fixture Content',
    data: { title: 'Fixture Content', body: 'Body text' },
  },
  {
    type: 'embed_block',
    marker: 'Embed fixture',
    data: { url: 'https://example.com', caption: 'Embed fixture' },
  },
  {
    type: 'image_block',
    marker: 'Fixture Image',
    data: { url: 'https://example.com/fixture.png', alt: 'Fixture image alt', caption: 'Fixture Image', width: 'medium' },
  },
  {
    type: 'resource_list',
    marker: 'Fixture Resource',
    data: { title: 'Resources', items: [{ label: 'Fixture Resource', url: 'https://example.com/docs' }] },
  },
  {
    type: 'assessment_embed',
    marker: 'Fixture Embedded Assessment',
    data: {
      title: 'Embedded Assessments',
      items: [
        {
          id: 'assess-fixture-1',
          title: 'Fixture Embedded Assessment',
          html: '<div class="text-sm text-white">Fixture Embedded Assessment</div>',
          script: 'window.__fixtureAssessmentExecuted = true;',
        },
      ],
    },
  },
  {
    type: 'knowledge_check',
    marker: 'data-kc-block',
    data: {
      prompt: 'What is focus?',
      options: ['A', 'B', 'C'],
      correctIndex: 1,
      shortAnswerPrompt: 'Explain your choice',
    },
  },
  {
    type: 'submission_builder',
    marker: 'data-submission-download',
    data: { title: 'Submit', buttonLabel: 'Generate Submission' },
  },
];

function buildProjectWithFixtures() {
  const modules = activityFixtures.map((fixture, idx) => ({
    id: `view-fixture-${idx + 1}`,
    title: `Fixture ${fixture.type}`,
    type: 'standalone',
    mode: 'composer',
    activities: [{ id: `activity-${idx + 1}`, type: fixture.type, data: fixture.data }],
    rawHtml:
      idx === 0
        ? '<!DOCTYPE html><html><body><p>RAW_SHOULD_NOT_SHOW</p></body></html>'
        : '',
    html: '',
    css: '',
    script: '',
  }));

  return {
    projectSchemaVersion: 1,
    'Current Course': {
      name: 'Composer Fixture Course',
      modules,
      materials: [],
    },
    'Course Settings': {
      courseName: 'Composer Fixture Course',
      accentColor: 'sky',
      backgroundColor: 'slate-900',
      fontFamily: 'inter',
      customCSS: '',
      compilationDefaults: {
        includeMaterials: true,
        includeAssessments: true,
        includeToolkit: true,
        enableProgressTracking: true,
        enableComposer: true,
      },
    },
    'Global Toolkit': [],
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run() {
  const projectData = buildProjectWithFixtures();
  const filesMap = compileProjectToFilesMap({ projectData });

  for (let i = 0; i < activityFixtures.length; i += 1) {
    const fixture = activityFixtures[i];
    const moduleId = `view-fixture-${i + 1}`;
    const relPath = `modules/${moduleId}.html`;

    const exportHtml = filesMap[relPath];
    assert(typeof exportHtml === 'string' && exportHtml.length > 0, `Missing export HTML for ${moduleId}`);
    assert(exportHtml.includes(fixture.marker), `Export HTML missing marker for ${fixture.type}: ${fixture.marker}`);

    const previewHtml = compileModuleToHtml({ projectData, moduleId });
    assert(typeof previewHtml === 'string' && previewHtml.length > 0, `Missing preview HTML for ${moduleId}`);
    assert(previewHtml.includes(fixture.marker), `Preview HTML missing marker for ${fixture.type}: ${fixture.marker}`);
  }

  const legacyHtml = buildLegacyCompiledHtml({ projectData });
  assert(typeof legacyHtml === 'string' && legacyHtml.length > 0, 'Missing legacy compiled HTML');
  assert(!legacyHtml.includes('RAW_SHOULD_NOT_SHOW'), 'Legacy HTML incorrectly used rawHtml for composer module');
  for (let i = 0; i < activityFixtures.length; i += 1) {
    const fixture = activityFixtures[i];
    assert(
      legacyHtml.includes(fixture.marker),
      `Legacy HTML missing marker for ${fixture.type}: ${fixture.marker}`
    );
  }

  console.log(`✅ COMPOSER FIXTURES OK (${activityFixtures.length} activity types)`);
}

try {
  run();
} catch (error) {
  console.error('❌ COMPOSER FIXTURES FAILED');
  console.error(error?.message || error);
  process.exit(1);
}
