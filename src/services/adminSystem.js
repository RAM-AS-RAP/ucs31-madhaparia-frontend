import api from './api'

const base = '/admin/system'
const options = (signal) => ({ signal, timeout: 20000 })

function validRecord(section, row) {
  if (!row || typeof row !== 'object') return false
  if (section === 'diseases') return typeof row.condition === 'string' && typeof row.display_name === 'string' && typeof row.short_description === 'string' && Number.isInteger(row.revision)
  if (typeof row.id !== 'string') return false
  if (section === 'symptoms') return typeof row.code === 'string' && typeof row.display_name === 'string' && Number.isInteger(row.revision) &&
    Array.isArray(row.aliases) && row.aliases.every((alias) => typeof alias.id === 'string' && typeof alias.alias === 'string' && ['en', 'sw'].includes(alias.language) && typeof alias.protected === 'boolean')
  if (section === 'feedback') return typeof row.prediction_id === 'string' && typeof row.was_helpful === 'boolean' && ['pending', 'reviewed', 'resolved'].includes(row.review_status) && Number.isInteger(row.revision)
  if (section === 'nlp') return typeof row.kind === 'string' && (!row.prediction_id || (Array.isArray(row.unsupported_symptoms) && Array.isArray(row.unmatched_wording)))
  return section === 'activity' && typeof row.action === 'string' && typeof row.target_id === 'string'
}

function checkedUpdate(section, data, record) {
  if (!validRecord(section, data) || data.revision !== record.revision + 1 ||
    (section === 'diseases' ? data.condition !== record.condition : data.id !== record.id)) throw new Error('Invalid management response')
  return data
}

export async function getSystemSection(section, params = {}, { signal } = {}) {
  const { data } = await api.get(`${base}/${section}`, { ...options(signal), params })
  if (section === 'model') {
    if (!['ready', 'no_active_model', 'multiple_active_models', 'runtime_unavailable', 'unsupported_version'].includes(data?.state) ||
      (data.state === 'ready' && (!data.model || typeof data.model.version !== 'string'))) throw new Error('Invalid model response')
  } else if (!Array.isArray(data?.items) || !data.items.every((row) => validRecord(section, row)) || !Number.isInteger(data.total) || data.total < data.items.length ||
    data.page !== (params.page || 1)) throw new Error('Invalid management response')
  return data
}

export async function saveSystemRecord(section, record, payload, { signal } = {}) {
  const config = options(signal)
  const body = { ...payload, expected_revision: record.revision }
  const path = section === 'diseases' ? `${base}/diseases` : `${base}/${section}/${encodeURIComponent(record.id)}`
  const { data } = await api.patch(path, body, { ...config, ...(section === 'diseases' ? { params: { condition: record.condition } } : {}) })
  return checkedUpdate(section, data, record)
}

export async function addSymptomAlias(record, alias, language, { signal } = {}) {
  const { data } = await api.post(`${base}/symptoms/${encodeURIComponent(record.id)}/aliases`, {
    alias, language, expected_revision: record.revision,
  }, options(signal))
  return checkedUpdate('symptoms', data, record)
}

export async function removeSymptomAlias(record, alias, { signal } = {}) {
  const { data } = await api.delete(`${base}/symptoms/${encodeURIComponent(record.id)}/aliases/${encodeURIComponent(alias.id)}`, {
    ...options(signal), data: { expected_revision: record.revision },
  })
  return checkedUpdate('symptoms', data, record)
}

export function systemError(error) {
  const code = error.response?.data?.detail?.code
  if (['record_changed', 'record_not_found', 'alias_exists', 'protected_definition'].includes(code)) return code
  if (error.response?.status === 401) return 'sessionExpired'
  if (error.response?.status === 403) return 'accessRequired'
  if (error.response?.status === 422) return 'invalidFields'
  return 'failed'
}
