'use client'

import { ChevronLeft, ChevronRight, PencilLine, Scan } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onSelectScan: () => void
  onSelectManual: () => void
  onBack: () => void
}

export function AddMethodSelector({ onSelectScan, onSelectManual, onBack }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b">
        <Button variant="ghost" size="icon" aria-label="뒤로" className="size-8" onClick={onBack}>
          <ChevronLeft />
        </Button>
        <span className="font-semibold text-sm">재료 추가</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-muted-foreground mb-4">어떻게 추가할까요?</p>

        <button
          onClick={onSelectScan}
          className="w-full flex items-center gap-4 p-5 rounded-xl border bg-white hover:bg-muted/50 text-left transition-colors"
        >
          <div className="size-11 rounded-xl border bg-muted flex items-center justify-center shrink-0">
            <Scan className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">영수증 스캔</div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
              마트 영수증을 촬영하면<br />재료를 자동으로 파싱해요
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </button>

        <button
          onClick={onSelectManual}
          className="w-full flex items-center gap-4 p-5 rounded-xl border bg-white hover:bg-muted/50 text-left transition-colors"
        >
          <div className="size-11 rounded-xl border bg-muted flex items-center justify-center shrink-0">
            <PencilLine className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">직접 입력</div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
              재료명, 수량, 유통기한을<br />직접 입력해요
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </button>
      </div>
    </div>
  )
}
