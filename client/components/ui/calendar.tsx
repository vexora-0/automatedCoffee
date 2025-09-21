"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 pb-2 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-400 w-9 h-9 font-normal text-[0.8rem] flex items-center justify-center",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-md hover:bg-gray-100 hover:text-gray-900"
        ),
        day_range_start: "bg-blue-500 text-white hover:bg-blue-600 rounded-l-md rounded-r-none",
        day_range_end: "bg-blue-500 text-white hover:bg-blue-600 rounded-r-md rounded-l-none",
        day_selected:
          "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 rounded-md",
        day_today: "bg-gray-100 text-gray-900 font-semibold",
        day_outside:
          "day-outside text-gray-300 opacity-50 aria-selected:bg-blue-50 aria-selected:text-gray-500",
        day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-blue-50 aria-selected:text-blue-900 rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
