import * as React from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  setDate,
  placeholder = "اختر التاريخ",
  className,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full h-12 justify-between text-right font-normal rounded-xl",
            !date && "text-muted-foreground",
            "rtl:flex-row-reverse",
            className
          )}
          disabled={disabled}
        >
          <span className="text-right flex-1">
            {date ? format(date, "dd/MM/yyyy", { locale: ar }) : placeholder}
          </span>
          <CalendarIcon className="mr-auto h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        side="bottom"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disabled}
          initialFocus
          locale={ar}
          dir="rtl"
        />
      </PopoverContent>
    </Popover>
  )
}

// Alternative simplified date picker without external dependencies
export function SimpleDatePicker({
  date,
  setDate,
  className,
  disabled = false,
}: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value ? new Date(e.target.value) : undefined
    setDate(selectedDate)
  }

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <div className="relative">
      <input
        type="date"
        value={formatDateForInput(date)}
        onChange={handleDateChange}
        disabled={disabled}
        className={cn(
          "flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "text-right rtl:text-right",
          className
        )}
        style={{ direction: 'rtl' }}
      />
    </div>
  )
}
