'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { mockReceiptItems, type MockReceiptItem } from '@/lib/mock-receipt'

interface Props {
  onSave: (items: MockReceiptItem[]) => void
  onBack: () => void
}

export function ReceiptScanner({ onSave, onBack }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [expiries, setExpiries] = useState<Record<string, string>>(() =>
    Object.fromEntries(mockReceiptItems.map((i) => [i.id, i.expiresAt ?? '']))
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    // initialize checked state: food items checked, non-food unchecked
    setChecked(Object.fromEntries(mockReceiptItems.map((i) => [i.id, i.isFood])))
  }

  function handleSave() {
    const selected = mockReceiptItems.filter((i) => checked[i.id])
    const withExpiry = selected.map((i) => ({
      ...i,
      expiresAt: expiries[i.id] || undefined,
    }))
    onSave(withExpiry)
  }

  const selectedCount = Object.values(checked).filter(Boolean).length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="뒤로" className="size-8" onClick={onBack}>
            <ChevronLeft />
          </Button>
          <span className="font-semibold text-sm">영수증 스캔</span>
        </div>
        {fileName && (
          <span className="text-xs text-muted-foreground">{mockReceiptItems.length}개 인식됨</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div
          className="mx-4 my-3 h-32 border-2 border-dashed rounded-xl bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="size-7" />
          {fileName ? (
            <>
              <span>{fileName}</span>
              <span className="text-[10px]">탭하여 다시 촬영</span>
            </>
          ) : (
            <span>사진을 선택해 영수증을 스캔하세요</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {fileName && (
          <>
            <p className="px-4 pb-1.5 text-xs text-muted-foreground">
              저장할 재료를 선택하고 유통기한을 입력하세요
            </p>
            {mockReceiptItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 border-b bg-white">
                <Checkbox
                  id={`item-${item.id}`}
                  aria-label={item.name}
                  checked={!!checked[item.id]}
                  onCheckedChange={(v) =>
                    setChecked((prev) => ({ ...prev, [item.id]: !!v }))
                  }
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.qty}{item.unit}</div>
                </div>
                <input
                  type="text"
                  value={expiries[item.id]}
                  onChange={(e) =>
                    setExpiries((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  placeholder="유통기한"
                  disabled={!item.isFood}
                  className="w-24 rounded-md border px-2 py-1 text-xs text-muted-foreground bg-white disabled:bg-muted"
                />
              </div>
            ))}

            <div className="p-4 space-y-2">
              <Button className="w-full" onClick={handleSave}>
                선택한 재료 저장 ({selectedCount}개)
              </Button>
              <Button variant="outline" className="w-full" onClick={onBack}>
                다시 스캔
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
