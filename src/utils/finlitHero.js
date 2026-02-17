export const FINLIT_HERO_MEDIA_TYPES = ['auto', 'image', 'video', 'embed'];
export const FINLIT_DEFAULT_ACTIVITIES_TAB_LABEL = 'Activities';
export const FINLIT_DEFAULT_ADDITIONAL_TAB_LABEL = 'Additional Learning';

function toStringValue(value) {
  return value == null ? '' : String(value);
}

export function normalizeFinlitHeroMediaType(value) {
  const raw = String(value || '').trim().toLowerCase();
  return FINLIT_HERO_MEDIA_TYPES.includes(raw) ? raw : 'auto';
}

export function createFinlitHeroFormState(heroLike) {
  const source = heroLike && typeof heroLike === 'object' ? heroLike : {};
  const mediaUrl = source.mediaUrl ?? source.image ?? '';
  return {
    title: toStringValue(source.title),
    subtitle: toStringValue(source.subtitle),
    progressLabel: toStringValue(source.progressLabel),
    mediaUrl: toStringValue(mediaUrl),
    mediaType: normalizeFinlitHeroMediaType(source.mediaType),
  };
}

export function normalizeFinlitHeroForSave(heroLike) {
  const form = createFinlitHeroFormState(heroLike);
  const title = form.title.trim();
  const subtitle = form.subtitle.trim();
  const progressLabel = form.progressLabel.trim();
  const mediaUrl = form.mediaUrl.trim();
  const mediaType = normalizeFinlitHeroMediaType(form.mediaType);

  const next = {};
  if (title) next.title = title;
  if (subtitle) next.subtitle = subtitle;
  if (progressLabel) next.progressLabel = progressLabel;
  if (mediaUrl) next.mediaUrl = mediaUrl;
  if (mediaType !== 'auto') next.mediaType = mediaType;

  return Object.keys(next).length ? next : null;
}

const FINLIT_HERO_VIDEO_PATTERN = /\.(mp4|webm|ogg|ogv|m4v|mov|m3u8)([?#].*)?$/i;
const FINLIT_HERO_EMBED_HOST_PATTERN = /(youtube\.com|youtu\.be|vimeo\.com|loom\.com|wistia\.)/i;
const FINLIT_HERO_EMBED_PATH_PATTERN = /\/embed\/|\/player\//i;

export function resolveFinlitHeroMediaKind(heroLike) {
  const form = createFinlitHeroFormState(heroLike);
  const mediaUrl = form.mediaUrl.trim();
  if (!mediaUrl) return 'none';

  const explicitType = normalizeFinlitHeroMediaType(form.mediaType);
  if (explicitType === 'image' || explicitType === 'video' || explicitType === 'embed') {
    return explicitType;
  }

  const lower = mediaUrl.toLowerCase();
  if (lower.startsWith('data:video/') || FINLIT_HERO_VIDEO_PATTERN.test(lower)) {
    return 'video';
  }

  if (FINLIT_HERO_EMBED_PATH_PATTERN.test(lower) || FINLIT_HERO_EMBED_HOST_PATTERN.test(lower)) {
    return 'embed';
  }

  return 'image';
}

function normalizeFinlitLink(linkLike) {
  const source = linkLike && typeof linkLike === 'object' ? linkLike : {};
  return {
    title: toStringValue(source.title || source.label),
    url: toStringValue(source.url || source.href),
    description: toStringValue(source.description || source.subtitle),
  };
}

export function createFinlitTemplateFormState(finlitLike) {
  const source = finlitLike && typeof finlitLike === 'object' ? finlitLike : {};
  const additionalLinks = Array.isArray(source.additionalLinks)
    ? source.additionalLinks.map((item) => normalizeFinlitLink(item))
    : [];
  return {
    activitiesTabLabel: toStringValue(source.activitiesTabLabel || source.activitiesLabel || FINLIT_DEFAULT_ACTIVITIES_TAB_LABEL),
    additionalTabLabel: toStringValue(source.additionalTabLabel || source.additionalLabel || FINLIT_DEFAULT_ADDITIONAL_TAB_LABEL),
    additionalLinks,
  };
}

export function normalizeFinlitTemplateForSave(finlitLike) {
  const form = createFinlitTemplateFormState(finlitLike);
  const activitiesTabLabel = form.activitiesTabLabel.trim() || FINLIT_DEFAULT_ACTIVITIES_TAB_LABEL;
  const additionalTabLabel = form.additionalTabLabel.trim() || FINLIT_DEFAULT_ADDITIONAL_TAB_LABEL;
  const additionalLinks = (Array.isArray(form.additionalLinks) ? form.additionalLinks : [])
    .map((item) => normalizeFinlitLink(item))
    .map((item) => ({
      title: item.title.trim(),
      url: item.url.trim(),
      description: item.description.trim(),
    }))
    .filter((item) => item.title || item.url || item.description)
    .map((item) => ({
      title: item.title || item.url || 'Resource',
      url: item.url,
      description: item.description,
    }));

  const next = {};
  if (activitiesTabLabel !== FINLIT_DEFAULT_ACTIVITIES_TAB_LABEL) {
    next.activitiesTabLabel = activitiesTabLabel;
  }
  if (additionalTabLabel !== FINLIT_DEFAULT_ADDITIONAL_TAB_LABEL) {
    next.additionalTabLabel = additionalTabLabel;
  }
  if (additionalLinks.length > 0) {
    next.additionalLinks = additionalLinks;
  }

  return Object.keys(next).length ? next : null;
}
