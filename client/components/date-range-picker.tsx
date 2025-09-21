"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  date: DateRange;
  onDateChange: (date: DateRange) => void;
  className?: string;
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (newDate: DateRange | undefined) => {
    if (newDate) {
      onDateChange(newDate);
      // Auto-close when both dates are selected
      if (newDate.from && newDate.to) {
        setTimeout(() => setOpen(false), 200);
      }
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full min-w-[280px] justify-start text-left font-medium bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 px-4 py-2 h-11 shadow-sm",
              !date && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-3 h-4 w-4 text-gray-500" />
            {date?.from ? (
              date.to ? (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {format(date.from, "MMM dd, y")}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-900">
                    {format(date.to, "MMM dd, y")}
                  </span>
                </div>
              ) : (
                <span className="font-medium text-gray-900">
                  {format(date.from, "MMM dd, y")}
                </span>
              )
            ) : (
              <span className="text-gray-500">Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-white border shadow-lg rounded-lg" 
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            required={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
