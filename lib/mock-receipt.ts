import type { Ingredient } from './storage'

export interface MockReceiptItem extends Ingredient {
  isFood: boolean
}

export const mockReceiptItems: MockReceiptItem[] = [
  { id: 'mock-1', name: '계란', qty: '6', unit: '구 (1판)', expiresAt: '2026.05.31', isFood: true },
  { id: 'mock-2', name: '두부', qty: '300', unit: 'g', isFood: true },
  { id: 'mock-3', name: '대파', qty: '1', unit: '단', isFood: true },
  { id: 'mock-4', name: '간장', qty: '500', unit: 'ml', expiresAt: '2026.12.01', isFood: true },
  { id: 'mock-5', name: '비닐봉지', qty: '5', unit: '매', isFood: false },
]
