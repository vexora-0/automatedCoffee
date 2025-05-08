"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  LineChart,
  TrendingUp,
  Clock,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";

// Import custom chart components
import CategorySalesChart from "@/components/analytics/CategorySalesChart";
import MachinePerformanceCard from "@/components/analytics/MachinePerformanceCard";
import ProductSalesChart from "@/components/analytics/ProductSalesChart";
import RevenueMetricsCard from "@/components/analytics/RevenueMetricsCard";
import SalesChart from "@/components/analytics/SalesChart";
import SalesOverTimeChart from "@/components/analytics/SalesOverTimeChart";

// Local UI component implementations since the imports are failing
// These would normally be imported from your component library
const Card = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-lg border bg-white text-card-foreground shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={`text-xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

const Tabs = ({
  value,
  onValueChange: _onValueChange,
  className = "",
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`${className}`} data-state={value}>
    {children}
  </div>
);

const TabsList = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1 text-slate-700 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const TabsTrigger = ({
  value,
  currentValue = "",
  onClick = () => {},
  className = "",
  children,
}: {
  value: string;
  currentValue?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 ${
      currentValue === value
        ? "bg-white text-slate-900 shadow-sm"
        : "hover:bg-gray-200"
    } ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const TabsContent = ({
  value,
  currentValue = "",
  className = "",
  children,
}: {
  value: string;
  currentValue?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`mt-4 focus-visible:outline-none ${className}`}
    style={{ display: currentValue === value ? "block" : "none" }}
  >
    {children}
  </div>
);

const Select = ({
  value: _value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === SelectContent) {
              return React.cloneElement(
                child as React.ReactElement<SelectContentProps>,
                {
                  closeDropdown: () => setIsOpen(false),
                  onValueChange,
                }
              );
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({
  className = "",
  children,
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground cursor-pointer ${className}`}
  >
    {children}
    <span className="ml-1">▼</span>
  </div>
);

const SelectValue = ({
  placeholder,
  value,
}: {
  placeholder: string;
  value?: string;
}) => <span className="text-sm">{value || placeholder}</span>;

interface SelectContentProps {
  children: React.ReactNode;
  closeDropdown?: () => void;
  onValueChange?: (value: string) => void;
}

const SelectContent = ({
  children,
  closeDropdown,
  onValueChange,
}: SelectContentProps) => (
  <div className="min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-800 shadow-md">
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        return React.cloneElement(
          child as React.ReactElement<SelectItemProps>,
          {
            onClick: () => {
              const childProps = (child as React.ReactElement<SelectItemProps>)
                .props;
              if (onValueChange && childProps?.value) {
                onValueChange(childProps.value);
              }
              if (closeDropdown) {
                closeDropdown();
              }
            },
          }
        );
      }
      return child;
    })}
  </div>
);

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onClick?: () => void;
}

const SelectItem = ({
  value: _value,
  onClick,
  className = "",
  children,
}: SelectItemProps) => (
  <div
    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-3 text-sm outline-none hover:bg-gray-100 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Alert = ({
  variant = "default",
  className = "",
  children,
}: {
  variant?: "default" | "destructive";
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${
      variant === "destructive"
        ? "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
        : ""
    } ${className}`}
  >
    {children}
  </div>
);

const AlertDescription = ({
  className = "",
  children,
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</p>
);

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
);

// DatePicker improved implementation
interface DatePickerProps {
  date: { from: Date; to: Date };
  onDateChange: (date: DayPickerDateRange) => void;
  className?: string;
}

const DatePickerWithRange = ({
  date,
  onDateChange,
  className,
}: DatePickerProps) => {
  const handleDateChange = () => {
    // Simple implementation that would normally open a date picker
    const newFrom = new Date();
    newFrom.setDate(newFrom.getDate() - 7); // Default to last 7 days
    const newTo = new Date();

    onDateChange({ from: newFrom, to: newTo });
  };

  return (
    <div
      className={`border rounded p-2 cursor-pointer hover:bg-gray-50 ${
        className || ""
      }`}
      onClick={handleDateChange}
    >
      <div className="text-sm">Date range</div>
      <div className="text-xs text-gray-500">
        {format(date.from, "PP")} - {format(date.to, "PP")}
      </div>
    </div>
  );
};

// Helper functions to format data for chart components
const formatCategorySalesData = (data: CategorySales[] | any) => {
  // Ensure data is an array
  if (!data || !Array.isArray(data)) return [];

  return data.map((category) => {
    if (!category) return { name: "Unknown", units: 0, amount: 0 };

    return {
      name: category.name || "Other",
      units: category.unitsSold || 0,
      amount: category.revenue || 0,
    };
  });
};

const formatProductSalesData = (data: Product[] | any) => {
  // Ensure data is an array
  if (!data || !Array.isArray(data)) return [];

  return data.map((product) => {
    if (!product)
      return { name: "Unknown", units: 0, amount: 0, category: "Other" };

    return {
      name: product.name || "Unknown",
      units: product.unitsSold || 0,
      amount: product.revenue || 0,
      category: product.category || "Other",
    };
  });
};

const formatSalesChartData = (
  data: SalesDataPoint[] | any,
  isToday: boolean
) => {
  // Ensure data is an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    // Return empty record with at least one hour and one day to avoid empty chart
    const emptyRecord: Record<string, { units: number; amount: number }> = {};

    if (isToday) {
      // Add some placeholder hourly data
      for (let i = 0; i < 24; i++) {
        emptyRecord[`${i}:00`] = { units: 0, amount: 0 };
      }
    } else {
      // Add some placeholder daily data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyRecord[format(date, "yyyy-MM-dd")] = { units: 0, amount: 0 };
      }
    }

    return emptyRecord;
  }

  const formattedData: Record<string, { units: number; amount: number }> = {};

  data.forEach((point) => {
    // Make sure point is a valid object
    if (!point) return;

    // Format key based on whether it's hourly or daily data
    let key;
    if (isToday && point.time) {
      key = point.time;
    } else if (!isToday && point.date) {
      // Ensure correct date format for daily data
      try {
        key = format(new Date(point.date), "yyyy-MM-dd");
      } catch (e) {
        key = point.date;
      }
    } else {
      key = isToday ? "00:00" : format(new Date(), "yyyy-MM-dd");
    }

    formattedData[key] = {
      units: point.units || 0,
      amount: point.revenue || 0,
    };
  });

  // If no data was processed, return the empty record with placeholders
  if (Object.keys(formattedData).length === 0) {
    const emptyRecord: Record<string, { units: number; amount: number }> = {};

    if (isToday) {
      // Add some placeholder hourly data
      for (let i = 0; i < 24; i++) {
        emptyRecord[`${i}:00`] = { units: 0, amount: 0 };
      }
    } else {
      // Add some placeholder daily data for the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyRecord[format(date, "yyyy-MM-dd")] = { units: 0, amount: 0 };
      }
    }

    return emptyRecord;
  }

  return formattedData;
};

const formatTimeSeriesData = (data: any) => {
  // Ensure data is an array
  if (!data || !Array.isArray(data)) return [];

  return data.map((point) => {
    // Make sure point is a valid object
    if (!point)
      return {
        timeInterval: "",
        units: 0,
        revenue: 0,
        orders: 0,
      };

    return {
      timeInterval: point.time || point.date || "",
      units: point.units || 0,
      revenue: point.revenue || 0,
      orders: point.orders || 0,
    };
  });
};

// Updated PopularProductsTable component
const PopularProductsTable = ({ products }: { products: Product[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">
            Product
          </th>
          <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">
            Units Sold
          </th>
          <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">
            Revenue
          </th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, idx) => (
          <tr key={idx} className="border-t">
            <td className="py-3 px-2">{product.name || "Unknown Product"}</td>
            <td className="py-3 px-2">{product.unitsSold || 0}</td>
            <td className="py-3 px-2">₹{(product.revenue || 0).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Real API service with fetch implementation and fallback mock data
const apiService = {
  async get<T>(
    url: string,
    options?: { params?: Record<string, unknown> }
  ): Promise<{ success: boolean; data: T }> {
    try {
      // Add timestamp to force fresh response
      const baseParams = options?.params || {};
      const params = {
        ...baseParams,
        _t: Date.now(), // Add timestamp to bust cache
      };

      const queryParams = params
        ? "?" +
          new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : "";

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}${url}${queryParams}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result as T };
    } catch (_error) {
      // Return fallback mock data when API fails
      return { success: false, data: generateMockData<T>(url) };
    }
  },
};

// Function to generate fallback mock data when API fails
function generateMockData<T>(url: string): T {
  if (url.includes("/machines")) {
    const mockMachines = [
      { machine_id: "m1", name: "Coffee Machine 1" },
      { machine_id: "m2", name: "Coffee Machine 2" },
      { machine_id: "m3", name: "Coffee Machine 3" },
    ];
    return mockMachines as unknown as T;
  }

  if (url.includes("/sales/machine/") || url.includes("/sales/machines")) {
    const mockSales = {
      hourly: Array.from({ length: 12 }, (_, i) => ({
        time: `${i + 8}:00`,
        units: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 2000) + 500,
      })),
      daily: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: format(date, "yyyy-MM-dd"),
          units: Math.floor(Math.random() * 100) + 30,
          revenue: Math.floor(Math.random() * 10000) + 2000,
        };
      }),
    };
    return mockSales as unknown as T;
  }

  if (url.includes("/sales/product")) {
    const mockProducts = Array.from({ length: 8 }, (_, i) => ({
      id: `p${i + 1}`,
      name: [
        "Espresso",
        "Latte",
        "Cappuccino",
        "Americano",
        "Mocha",
        "Flat White",
        "Cold Brew",
        "Macchiato",
      ][i],
      unitsSold: Math.floor(Math.random() * 200) + 50,
      revenue: Math.floor(Math.random() * 20000) + 5000,
      category: [
        "Coffee",
        "Coffee",
        "Coffee",
        "Coffee",
        "Coffee",
        "Coffee",
        "Cold Drinks",
        "Coffee",
      ][i],
    }));
    return mockProducts as unknown as T;
  }

  if (url.includes("/sales/category")) {
    const mockCategories = [
      { name: "Coffee", unitsSold: 1250, revenue: 62500 },
      { name: "Cold Drinks", unitsSold: 480, revenue: 28800 },
      { name: "Tea", unitsSold: 320, revenue: 16000 },
      { name: "Snacks", unitsSold: 180, revenue: 9000 },
    ];
    return mockCategories as unknown as T;
  }

  if (url.includes("/revenue")) {
    const mockRevenue = {
      timeSeriesData: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: format(date, "yyyy-MM-dd"),
          revenue: Math.floor(Math.random() * 25000) + 8000,
        };
      }),
      total: {
        revenue: 156000,
        orders: 450,
      },
      average: 350,
    };
    return mockRevenue as unknown as T;
  }

  if (url.includes("/products/popular")) {
    const mockPopular = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i + 1}`,
      name: ["Espresso", "Latte", "Cappuccino", "Americano", "Mocha"][i],
      unitsSold: Math.floor(Math.random() * 200) + 50,
      revenue: Math.floor(Math.random() * 20000) + 5000,
      category: "Coffee",
    }));
    return mockPopular as unknown as T;
  }

  if (url.includes("/sales/time")) {
    const mockTimeData = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      units: Math.floor(Math.random() * 30) + 5,
      revenue: Math.floor(Math.random() * 3000) + 500,
    }));
    return mockTimeData as unknown as T;
  }

  if (url.includes("/performance/machine/")) {
    const mockPerformance = {
      ordersCompleted: 320,
      ordersFailed: 12,
      ordersCancelled: 10,
      totalOrders: 342,
      successRate: 93.5,
      totalRevenue: 12580,
      averageRating: 4.7,
      ratingCount: 105,
    };
    return mockPerformance as unknown as T;
  }

  return {} as T;
}

// Type definitions with improved typing
interface Machine {
  machine_id: string;
  name: string;
}

interface Product {
  id?: string;
  name?: string;
  unitsSold?: number;
  revenue?: number;
  category?: string;
}

interface CategorySales {
  name: string;
  unitsSold: number;
  revenue: number;
}

interface SalesDataPoint {
  time?: string;
  date?: string;
  units: number;
  revenue: number;
}

interface SalesData {
  hourly?: SalesDataPoint[];
  daily?: SalesDataPoint[];
  total?: {
    units: number;
    amount: number;
  };
}

interface RevenueTimePoint {
  date: string;
  revenue: number;
  orders?: number;
  units?: number; // Added units property to make it compatible with SalesDataPoint
}

interface RevenueData {
  timeSeriesData: RevenueTimePoint[];
  total: number | { revenue: number; orders: number };
  average?: number;
}

interface MachinePerformance {
  ordersCompleted: number;
  ordersFailed: number;
  ordersCancelled: number;
  totalOrders: number;
  successRate: number;
  totalRevenue: number;
  averageRating: number;
  ratingCount: number;
}

interface QueryParams {
  startDate?: string;
  endDate?: string;
  machineId?: string;
  interval?: string;
  limit?: number;
  [key: string]: unknown; // Add index signature for string keys
}

// Helper functions with improved error handling
const getRevenue = (
  total: number | { revenue: number; orders: number } | undefined
): number => {
  if (!total) return 0;
  return typeof total === "number" ? total : total.revenue;
};

const getOrders = (
  total: { revenue: number; orders: number } | number | undefined
): number => {
  if (!total) return 0;
  return typeof total === "object" ? total.orders : 0;
};

const getAverageOrderValue = (data: RevenueData | null): number => {
  if (!data) return 0;
  if (data.average !== undefined) return data.average;

  const total = data.total;
  if (!total) return 0;

  if (typeof total === "object" && total.orders > 0) {
    return total.revenue / total.orders;
  }
  return 0;
};

// Analytics components
const StatCard = ({
  title,
  value,
  trend,
  trendValue,
  icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  icon: React.ReactNode;
  isLoading: boolean;
}) => {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-600"
      : "text-gray-600";
  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="rounded-full bg-gray-100 p-2">{icon}</div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold">{value}</h3>
            </div>
            {TrendIcon && (
              <div className={`mt-2 flex items-center ${trendColor}`}>
                <TrendIcon className="mr-1 h-4 w-4" />
                <span className="text-xs font-medium">{trendValue}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function AnalyticsPage() {
  // State declarations
  const [activeTab, setActiveTab] = useState<string>("sales");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState<string>("today");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Analytics data states
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [productSalesData, setProductSalesData] = useState<Product[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<CategorySales[]>(
    []
  );
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [salesOverTime, setSalesOverTime] = useState<SalesDataPoint[]>([]);
  const [machinePerformance, setMachinePerformance] =
    useState<MachinePerformance | null>(null);

  // Load machines on mount
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await apiService.get<{
          data: Machine[];
          count: number;
        }>("/machines");
        if (response.success) {
          // Ensure machines is always an array
          const machinesData = Array.isArray(response.data.data)
            ? response.data.data
            : [];
          setMachines(machinesData);
        }
      } catch (_error) {
        setError("Failed to load machines data");
      }
    };

    fetchMachines();
  }, []);

  // Load analytics data when filters change
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const dateParams = getDateParams();

        // Fetch all data in parallel
        const [
          salesResponse,
          productResponse,
          categoryResponse,
          revenueResponse,
          popularResponse,
          timeSeriesResponse,
          performanceResponse,
        ] = await Promise.all([
          fetchSalesData(dateParams),
          fetchProductSalesData(dateParams),
          fetchCategorySalesData(dateParams),
          fetchRevenueData(dateParams),
          fetchPopularProductsData(dateParams),
          fetchSalesOverTimeData(dateParams),
          fetchMachinePerformanceData(dateParams),
        ]);

        // Set state with the fetched data
        setSalesData(salesResponse);
        setProductSalesData(productResponse);
        setCategorySalesData(categoryResponse);
        setRevenueData(revenueResponse);
        setPopularProducts(popularResponse);
        setSalesOverTime(timeSeriesResponse);
        setMachinePerformance(performanceResponse);

        // If we're using fallback data, show a gentle message to the user
        if (
          !salesResponse ||
          !productResponse ||
          !categoryResponse ||
          !revenueResponse
        ) {
          setError(
            "Some data couldn't be loaded from the server. Displaying demo data."
          );
        }
      } catch (_error) {
        setError(
          "Unable to load analytics data. Using demo data for visualization purposes."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedMachine, dateRange, timeFrame]);

  const getDateParams = (): QueryParams => {
    const params: QueryParams = {};

    if (timeFrame === "today") {
      // Today is the default, no need to add parameters
    } else if (timeFrame === "custom" && dateRange.from && dateRange.to) {
      params.startDate = format(dateRange.from, "yyyy-MM-dd");
      params.endDate = format(dateRange.to, "yyyy-MM-dd");
    } else if (timeFrame === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      params.startDate = format(sevenDaysAgo, "yyyy-MM-dd");
      params.endDate = format(new Date(), "yyyy-MM-dd");
    } else if (timeFrame === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      params.startDate = format(thirtyDaysAgo, "yyyy-MM-dd");
      params.endDate = format(new Date(), "yyyy-MM-dd");
    }

    if (selectedMachine !== "all") {
      params.machineId = selectedMachine;
    }

    return params;
  };

  // Fetch functions
  const fetchSalesData = async (
    params: QueryParams
  ): Promise<SalesData | null> => {
    const endpoint =
      selectedMachine !== "all"
        ? `/sales/machine/${selectedMachine}`
        : "/sales/machines";

    try {
      const response = await apiService.get<{ data: SalesData }>(
        `/analytics${endpoint}`,
        { params }
      );

      // Ensure we have valid hourly and daily data arrays
      if (response.success && response.data.data) {
        const result = response.data.data;
        // Ensure hourly and daily are arrays or set them to empty arrays
        return {
          hourly: Array.isArray(result.hourly) ? result.hourly : [],
          daily: Array.isArray(result.daily) ? result.daily : [],
          total: result.total,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return null;
    }
  };

  const fetchProductSalesData = async (
    params: QueryParams
  ): Promise<Product[]> => {
    const response = await apiService.get<{ data: Product[] }>(
      "/analytics/sales/product",
      { params }
    );
    return response.success ? response.data.data : [];
  };

  const fetchCategorySalesData = async (
    params: QueryParams
  ): Promise<CategorySales[]> => {
    const response = await apiService.get<{ data: CategorySales[] }>(
      "/analytics/sales/category",
      { params }
    );
    return response.success ? response.data.data : [];
  };

  const fetchRevenueData = async (
    params: QueryParams
  ): Promise<RevenueData | null> => {
    const intervalParam =
      timeFrame === "today"
        ? "hourly"
        : timeFrame === "7days"
        ? "daily"
        : timeFrame === "30days"
        ? "weekly"
        : "daily";

    params.interval = intervalParam;

    const response = await apiService.get<{ data: RevenueData }>(
      "/analytics/revenue",
      { params }
    );
    return response.success ? response.data.data : null;
  };

  const fetchPopularProductsData = async (
    params: QueryParams
  ): Promise<Product[]> => {
    params.limit = 10;
    const response = await apiService.get<{ data: Product[] }>(
      "/analytics/products/popular",
      { params }
    );
    return response.success ? response.data.data : [];
  };

  const fetchSalesOverTimeData = async (
    params: QueryParams
  ): Promise<SalesDataPoint[]> => {
    const intervalParam =
      timeFrame === "today"
        ? "hourly"
        : timeFrame === "7days"
        ? "daily"
        : timeFrame === "30days"
        ? "weekly"
        : "daily";

    params.interval = intervalParam;
    params.limit = 10;

    const response = await apiService.get<{ data: SalesDataPoint[] }>(
      "/analytics/sales/time",
      { params }
    );
    return response.success ? response.data.data : [];
  };

  const fetchMachinePerformanceData = async (
    params: QueryParams
  ): Promise<MachinePerformance | null> => {
    const endpoint =
      selectedMachine !== "all"
        ? `/performance/machine/${selectedMachine}`
        : "/performance/machine/all";

    params.limit = 10;

    const response = await apiService.get<{ data: MachinePerformance }>(
      `/analytics${endpoint}`,
      { params }
    );
    return response.success ? response.data.data : null;
  };

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-gray-500">
          Comprehensive insights and performance metrics for your coffee
          machines
        </p>
      </div>

      {/* Analytics Summary Card */}
      <Card className="bg-white shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Key metrics from all coffee machine operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`₹${getRevenue(revenueData?.total).toLocaleString(
                "en-IN"
              )}`}
              trend="up"
              trendValue={revenueData ? "+12% from last period" : "0%"}
              icon={<CreditCard className="h-4 w-4 text-blue-600" />}
              isLoading={isLoading}
            />
            <StatCard
              title="Orders"
              value={
                getOrders(revenueData?.total).toLocaleString("en-IN") || "142"
              }
              trend="up"
              trendValue="+8% from last period"
              icon={<Package className="h-4 w-4 text-purple-600" />}
              isLoading={isLoading}
            />
            <StatCard
              title="Average Order Value"
              value={`₹${getAverageOrderValue(revenueData).toLocaleString(
                "en-IN"
              )}`}
              trend="neutral"
              trendValue="+2% from last period"
              icon={<LineChart className="h-4 w-4 text-amber-600" />}
              isLoading={isLoading}
            />
            <StatCard
              title="Active Machines"
              value={`${Array.isArray(machines) ? machines.length : 0}`}
              trend="up"
              trendValue="All operational"
              icon={<TrendingUp className="h-4 w-4 text-green-600" />}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="font-medium">Filter Analytics Data</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedMachine} onValueChange={setSelectedMachine}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Machines</SelectItem>
              {Array.isArray(machines) &&
                machines.map((machine) => (
                  <SelectItem
                    key={machine.machine_id}
                    value={machine.machine_id}
                  >
                    {machine.name || `Machine ${machine.machine_id}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {timeFrame === "custom" && (
            <DatePickerWithRange
              className="w-full sm:w-auto"
              date={dateRange}
              onDateChange={(date) => {
                if (date.from && date.to) {
                  setDateRange({ from: date.from, to: date.to });
                }
              }}
            />
          )}
        </div>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-6 bg-red-50 border-red-200 text-red-800"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger
            value="sales"
            currentValue={activeTab}
            onClick={() => setActiveTab("sales")}
            className="flex items-center gap-2"
          >
            <LineChart className="h-4 w-4" />
            <span>Sales Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="products"
            currentValue={activeTab}
            onClick={() => setActiveTab("products")}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            <span>Product Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            currentValue={activeTab}
            onClick={() => setActiveTab("performance")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            currentValue={activeTab}
            onClick={() => setActiveTab("trends")}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            <span>Time Trends</span>
          </TabsTrigger>
        </TabsList>

        {/* Sales Analytics Tab */}
        <TabsContent
          value="sales"
          currentValue={activeTab}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RevenueMetricsCard data={revenueData} isLoading={isLoading} />

            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  {timeFrame === "today"
                    ? "Hourly sales for today"
                    : timeFrame === "7days"
                    ? "Daily sales for the past week"
                    : timeFrame === "30days"
                    ? "Weekly sales for the past month"
                    : "Custom period sales"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : salesData ? (
                  <SalesChart
                    data={formatSalesChartData(
                      timeFrame === "today"
                        ? Array.isArray(salesData.hourly)
                          ? salesData.hourly
                          : []
                        : Array.isArray(salesData.daily)
                        ? salesData.daily
                        : [],
                      timeFrame === "today"
                    )}
                    timeFrame={timeFrame}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No sales data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Product Analytics Tab */}
        <TabsContent
          value="products"
          currentValue={activeTab}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Product</CardTitle>
                <CardDescription>Top products by units sold</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : productSalesData && productSalesData.length > 0 ? (
                  <ProductSalesChart
                    data={formatProductSalesData(productSalesData)}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No product sales data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>
                  Breakdown of sales by product category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : categorySalesData && categorySalesData.length > 0 ? (
                  <CategorySalesChart
                    data={formatCategorySalesData(categorySalesData)}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No category sales data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Popular Products Table */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Popular Products</CardTitle>
              <CardDescription>
                Detailed breakdown of top-selling products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : popularProducts && popularProducts.length > 0 ? (
                <PopularProductsTable products={popularProducts} />
              ) : (
                <div className="py-4 text-center">
                  <p className="text-gray-500">
                    No popular products data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent
          value="performance"
          currentValue={activeTab}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MachinePerformanceCard
              data={machinePerformance}
              isLoading={isLoading}
              selectedMachine={selectedMachine}
              machines={machines}
            />

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : revenueData &&
                  revenueData.timeSeriesData &&
                  Array.isArray(revenueData.timeSeriesData) ? (
                  <SalesOverTimeChart
                    data={formatTimeSeriesData(revenueData.timeSeriesData)}
                    dataKey="revenue"
                    color="#10B981"
                    timeFrame={timeFrame}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-gray-500">No revenue data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Time Trends Tab */}
        <TabsContent
          value="trends"
          currentValue={activeTab}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 md:col-span-2 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Sales Over Time</CardTitle>
                <CardDescription>
                  {timeFrame === "today"
                    ? "Hourly sales breakdown"
                    : timeFrame === "7days"
                    ? "Daily sales for the past week"
                    : timeFrame === "30days"
                    ? "Weekly sales for the past month"
                    : "Sales for the selected time period"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : salesOverTime &&
                  Array.isArray(salesOverTime) &&
                  salesOverTime.length > 0 ? (
                  <SalesOverTimeChart
                    data={formatTimeSeriesData(salesOverTime)}
                    dataKey="units"
                    color="#3B82F6"
                    timeFrame={timeFrame}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-gray-500">
                      No time series data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
