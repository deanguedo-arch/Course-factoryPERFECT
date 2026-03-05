import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMasterQuestionRecord,
  cloneQuestionRecord,
  convertQuestionDraftType,
  createQuestionDraft,
} from '../../src/assessment/index.js';

test('createQuestionDraft seeds matching rows for editing', () => {
  const draft = createQuestionDraft('matching');

  assert.equal(draft.type, 'matching');
  assert.equal(draft.question, '');
  assert.deepEqual(draft.pairs, [
    { left: '', right: '' },
    { left: '', right: '' },
  ]);
});

test('convertQuestionDraftType preserves prompt and choices across objective types', () => {
  const original = {
    id: 'q-1',
    type: 'multiple-choice',
    question: 'Select all prime numbers.',
    options: ['2', '3', '4', '5'],
    correct: 1,
  };

  const converted = convertQuestionDraftType(original, 'multi-select');

  assert.equal(converted.id, 'q-1');
  assert.equal(converted.type, 'multi-select');
  assert.equal(converted.question, 'Select all prime numbers.');
  assert.deepEqual(converted.options, ['2', '3', '4', '5']);
  assert.deepEqual(converted.correctIndices, []);
});

test('buildMasterQuestionRecord preserves typed payloads and metadata', () => {
  const record = buildMasterQuestionRecord({
    type: 'matching',
    question: 'Match each term to its definition.',
    pairs: [
      { left: 'Atom', right: 'Smallest unit of matter' },
      { left: 'Cell', right: 'Smallest unit of life' },
    ],
    confidence: 0.87,
    source: 'text',
  }, {
    fallbackType: 'multiple-choice',
    order: 4,
    generateId: () => 'q-fixed',
  });

  assert.equal(record.id, 'q-fixed');
  assert.equal(record.order, 4);
  assert.equal(record.type, 'matching');
  assert.equal(record.source, 'text');
  assert.equal(record.confidence, 0.87);
  assert.deepEqual(record.pairs, [
    { left: 'Atom', right: 'Smallest unit of matter' },
    { left: 'Cell', right: 'Smallest unit of life' },
  ]);
});

test('cloneQuestionRecord deep-clones typed arrays for publish snapshots', () => {
  const original = {
    type: 'matching',
    options: ['A', 'B'],
    correctIndices: [0, 1],
    acceptedAnswers: ['Jupiter'],
    pairs: [
      { left: 'Atom', right: 'Matter' },
      { left: 'Cell', right: 'Life' },
    ],
    meta: { source: 'import' },
  };

  const cloned = cloneQuestionRecord(original);
  cloned.options[0] = 'Changed';
  cloned.correctIndices.push(2);
  cloned.acceptedAnswers[0] = 'Saturn';
  cloned.pairs[0].left = 'Changed';
  cloned.meta.source = 'edited';

  assert.equal(original.options[0], 'A');
  assert.deepEqual(original.correctIndices, [0, 1]);
  assert.deepEqual(original.acceptedAnswers, ['Jupiter']);
  assert.deepEqual(original.pairs[0], { left: 'Atom', right: 'Matter' });
  assert.deepEqual(original.meta, { source: 'import' });
});
