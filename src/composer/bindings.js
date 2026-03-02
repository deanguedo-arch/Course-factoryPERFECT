function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function toTitleCase(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function parsePath(path) {
  const tokens = [];
  String(path || '').replace(/([^[.\]]+)|\[(\d+)\]/g, (_, key, index) => {
    if (key) tokens.push(key);
    else tokens.push(Number.parseInt(index, 10));
    return '';
  });
  return tokens;
}

function getValueByPath(source, path) {
  return parsePath(path).reduce((current, segment) => {
    if (current == null) return undefined;
    return current[segment];
  }, source);
}

function setValueByPath(source, path, nextValue) {
  const tokens = parsePath(path);
  if (!tokens.length) return source;

  const root = Array.isArray(source) ? [...source] : { ...(source && typeof source === 'object' ? source : {}) };
  let cursor = root;

  tokens.forEach((segment, index) => {
    const isLast = index === tokens.length - 1;
    if (isLast) {
      cursor[segment] = nextValue;
      return;
    }

    const nextSegment = tokens[index + 1];
    const currentValue = cursor[segment];
    let cloned;

    if (Array.isArray(currentValue)) cloned = [...currentValue];
    else if (currentValue && typeof currentValue === 'object') cloned = { ...currentValue };
    else cloned = typeof nextSegment === 'number' ? [] : {};

    cursor[segment] = cloned;
    cursor = cloned;
  });

  return root;
}

function formatBindingReplacement(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function isBindableFieldName(segment) {
  const raw = String(segment || '').trim();
  if (!raw) return false;
  return /(title|label|text|body|subtitle|description|caption|heading|summary|prompt|author|placeholder|progress|kicker|eyebrow|quote|name|url|href|alt|button|cta)/i.test(
    raw,
  );
}

function collectFields(value, path = [], entries = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectFields(item, [...path, index], entries));
    return entries;
  }
  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, nextValue]) => collectFields(nextValue, [...path, key], entries));
    return entries;
  }

  const leaf = path[path.length - 1];
  if (!isBindableFieldName(leaf)) return entries;
  if (!(typeof value === 'string' || value == null)) return entries;

  const pathLabel = path
    .map((segment) => (typeof segment === 'number' ? `${segment + 1}` : toTitleCase(segment)))
    .join(' / ');
  const pathValue = path
    .map((segment, index) => {
      if (typeof segment === 'number') return `[${segment}]`;
      return index === 0 ? segment : `.${segment}`;
    })
    .join('');

  entries.push({
    path: pathValue,
    label: pathLabel,
    value: typeof value === 'string' ? value : '',
  });
  return entries;
}

export const COMPOSER_BINDING_OPTIONS = [
  { value: 'course.name', label: 'Course Name' },
  { value: 'course.theme', label: 'Course Theme' },
  { value: 'module.title', label: 'Module Title' },
  { value: 'module.id', label: 'Module ID' },
  { value: 'module.template', label: 'Module Template' },
  { value: 'module.theme', label: 'Module Theme' },
  { value: 'module.blockCount', label: 'Module Block Count' },
  { value: 'date.today', label: 'Today (YYYY-MM-DD)' },
  { value: 'date.year', label: 'Current Year' },
];

export function getComposerBindingToken(bindingKey) {
  return `{{${String(bindingKey || '').trim()}}}`;
}

export function buildComposerBindingContext(module, { courseSettings = {}, activities = [], activity = null } = {}) {
  const today = new Date();
  const courseName = String(courseSettings?.courseName || courseSettings?.__courseName || '').trim() || 'Course';
  return {
    course: {
      name: courseName,
      theme: String(courseSettings?.themeDefault || courseSettings?.theme || '').trim() || '',
    },
    module: {
      id: String(module?.id || '').trim() || '',
      title: String(module?.title || '').trim() || '',
      template: String(module?.template || '').trim() || '',
      theme: String(module?.theme || '').trim() || '',
      blockCount: Array.isArray(activities) ? activities.length : 0,
    },
    activity: {
      id: String(activity?.id || '').trim() || '',
      type: String(activity?.type || '').trim() || '',
    },
    date: {
      today: today.toISOString().slice(0, 10),
      year: String(today.getFullYear()),
    },
  };
}

export function getComposerBindingValue(bindingKey, context) {
  return formatBindingReplacement(getValueByPath(context, bindingKey));
}

export function resolveComposerBindingString(value, context) {
  const source = String(value ?? '');
  if (!source.includes('{{')) return source;
  return source.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, bindingKey) => getComposerBindingValue(bindingKey, context));
}

export function resolveComposerBindingsInValue(value, context) {
  if (typeof value === 'string') return resolveComposerBindingString(value, context);
  if (Array.isArray(value)) return value.map((item) => resolveComposerBindingsInValue(item, context));
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveComposerBindingsInValue(item, context)]));
  }
  return value;
}

export function resolveComposerBindingsInActivity(activity, context) {
  if (!activity || typeof activity !== 'object') return activity;
  return {
    ...activity,
    data: resolveComposerBindingsInValue(activity.data || {}, context),
    style: resolveComposerBindingsInValue(activity.style || {}, context),
    behavior: resolveComposerBindingsInValue(activity.behavior || {}, context),
  };
}

export function collectComposerBindableDataFields(activity) {
  return collectFields(activity?.data && typeof activity.data === 'object' ? activity.data : {});
}

export function applyComposerBindingToActivityField(activity, fieldPath, bindingKey) {
  const targetPath = String(fieldPath || '').trim();
  const targetBindingKey = String(bindingKey || '').trim();
  if (!targetPath || !targetBindingKey || !activity || typeof activity !== 'object') return activity;
  return {
    ...activity,
    data: setValueByPath(activity.data && typeof activity.data === 'object' ? activity.data : {}, targetPath, getComposerBindingToken(targetBindingKey)),
  };
}
