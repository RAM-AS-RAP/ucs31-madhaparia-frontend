import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../api'
import { addSymptomAlias, getSystemSection, removeSymptomAlias, saveSystemRecord, systemError } from '../adminSystem'
import { recordedMetrics } from '../../utils/modelMetrics'

vi.mock('../api', () => ({ default: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() } }))
beforeEach(() => vi.clearAllMocks())
describe('system API contract', () => {
  it('uses authenticated reads with filters and abort signals', async () => {
    api.get.mockResolvedValue({ data: { items: [], total: 0, page: 2 } })
    const signal = new AbortController().signal
    await getSystemSection('feedback', { page: 2, helpful: 'false' }, { signal })
    expect(api.get).toHaveBeenCalledWith('/admin/system/feedback', { params: { page: 2, helpful: 'false' }, timeout: 20000, signal })
  })
  it('rejects malformed lists and model states', async () => {
    api.get.mockResolvedValue({ data: { items: [], total: -1, page: 1 } })
    await expect(getSystemSection('symptoms')).rejects.toThrow()
    api.get.mockResolvedValue({ data: { state: 'loaded_legacy_model' } })
    await expect(getSystemSection('model')).rejects.toThrow()
  })
  it('keeps disease identities in encoded query parameters and sends revision checks', async () => {
    api.patch.mockResolvedValue({ data: { condition: 'COPD / infection', display_name: 'Label', short_description: 'Description', revision: 4 } })
    await saveSystemRecord('diseases', { condition: 'COPD / infection', revision: 3 }, { display_name: 'Label' })
    expect(api.patch).toHaveBeenCalledWith('/admin/system/diseases', { display_name: 'Label', expected_revision: 3 }, expect.objectContaining({ params: { condition: 'COPD / infection' } }))
  })
  it('posts and removes aliases against the expected symptom revision', async () => {
    const updated = { id: 'one', code: 'fever', display_name: 'Fever', aliases: [], revision: 8 }
    api.post.mockResolvedValue({ data: updated }); api.delete.mockResolvedValue({ data: updated })
    const record = { id: 'one', revision: 7 }
    await addSymptomAlias(record, 'homa', 'sw')
    expect(api.post).toHaveBeenCalledWith('/admin/system/symptoms/one/aliases', { alias: 'homa', language: 'sw', expected_revision: 7 }, expect.anything())
    await removeSymptomAlias(record, { id: 'alias' })
    expect(api.delete).toHaveBeenCalledWith('/admin/system/symptoms/one/aliases/alias', expect.objectContaining({ data: { expected_revision: 7 } }))
  })
  it('does not surface raw backend exceptions', () => {
    expect(systemError({ response: { status: 500, data: { detail: 'private credentials' } } })).toBe('failed')
    expect(systemError({ response: { status: 422 } })).toBe('invalidFields')
  })
  it('rejects a successful HTTP response for the wrong record or revision', async () => {
    api.patch.mockResolvedValue({ data: { condition: 'other', display_name: 'Label', short_description: 'Description', revision: 4 } })
    await expect(saveSystemRecord('diseases', { condition: 'URTI', revision: 3 }, { display_name: 'Label' })).rejects.toThrow()
  })
  it('retains nested cohort scopes and numeric values without misleading percentages', () => {
    expect(recordedMetrics({ test: { macro_f1: .7123, log_loss: 1.2 }, file_sha256: 'hidden' })).toEqual([
      { label: 'test / macro f1', value: '0.7123' }, { label: 'test / log loss', value: '1.2' },
    ])
    expect(recordedMetrics({ test: { evaluated: false } })).toEqual([{ label: 'test / evaluated', value: 'false' }])
  })
})
