import { deriveHistory } from './historyUtils';

describe('deriveHistory', () => {
  it('merges explicit history with status timestamps and sorts by date desc', () => {
    const data = {
      history: [
        { at: '2024-05-10T12:00:00Z', from: 'Pendiente', to: 'En progreso', by: 'Ana' },
      ],
      status_timestamps: {
        finished: '2024-06-01T10:00:00Z',
        review: '2024-05-20T09:30:00Z',
      },
      created_at: '2024-05-01T00:00:00Z',
    };

    const result = deriveHistory(data);
    expect(result[0].at).toBe('2024-06-01T10:00:00Z');
    expect(result[1].at).toBe('2024-05-20T09:30:00Z');
    expect(result.some((r) => r.to === 'Creado')).toBe(true);
    expect(result.some((r) => r.to === 'En progreso')).toBe(true);
  });

  it('returns empty array when there is no data', () => {
    expect(deriveHistory(null)).toEqual([]);
    expect(deriveHistory({})).toEqual([]);
  });
});
