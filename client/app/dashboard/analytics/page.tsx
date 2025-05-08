"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  LineChart,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Package,
  CreditCard,
  Coffee,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";

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
  onValueChange,
  className = "",
  children,
  ...props
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${className}`} data-state={value} {...props}>
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
  className = "",
  children,
  ...props
}: {
  value: string;
} & React.HTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm ${className}`}
    {...props}
  >
    {children}
  </button>
);

const TabsContent = ({
  value,
  className = "",
  children,
  ...props
}: {
  value: string;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mt-4 focus-visible:outline-none ${className}`} {...props}>
    {children}
  </div>
);

const Select = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => <div className="relative">{children}</div>;

const SelectTrigger = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground ${className}`}
    {...props}
  >
    {children}
  </div>
);

const SelectValue = ({ placeholder }: { placeholder: string }) => (
  <span className="text-sm">{placeholder}</span>
);

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
    {children}
  </div>
);

const SelectItem = ({
  value,
  children,
  ...props
}: {
  value: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
    {...props}
  >
    {children}
  </div>
);

const Button = ({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Alert = ({
  variant = "default",
  className = "",
  children,
  ...props
}: {
  variant?: "default" | "destructive";
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${
      variant === "destructive"
        ? "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
        : ""
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);

const AlertDescription = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

const Badge = ({
  variant = "default",
  className = "",
  children,
  ...props
}: {
  variant?: "default" | "success" | "destructive";
} & React.HTMLAttributes<HTMLDivElement>) => {
  const variantClasses = {
    default: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-green-50 text-green-700 border-green-200",
    destructive: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    {...props}
  />
);

// DatePicker fallback
interface DatePickerProps {
  date: { from: Date; to: Date };
  onDateChange: (date: DayPickerDateRange) => void;
  className?: string;
}

const DatePickerWithRange = ({
  date,
  onDateChange,
  className,
}: DatePickerProps) => (
  <div className={`border rounded p-2 ${className || ""}`}>
    <div className="text-sm">Date range picker placeholder</div>
    <div className="text-xs text-gray-500">
      {format(date.from, "PP")} - {format(date.to, "PP")}
    </div>
  </div>
);

// Mock chart components
const SalesChart = ({
  data,
  timeFrame,
}: {
  data: any[];
  timeFrame: string;
}) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="text-lg font-medium">Sales Chart</div>
      <div className="text-sm text-gray-500">
        {timeFrame} data visualization
      </div>
    </div>
  </div>
);

const ProductSalesChart = ({ data }: { data: any[] }) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="text-lg font-medium">Product Sales Chart</div>
      <div className="text-sm text-gray-500">{data.length} products</div>
    </div>
  </div>
);

const CategorySalesChart = ({ data }: { data: any[] }) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="text-lg font-medium">Category Sales Chart</div>
      <div className="text-sm text-gray-500">{data.length} categories</div>
    </div>
  </div>
);

const SalesOverTimeChart = ({
  data,
  dataKey,
  color,
  timeFrame,
}: {
  data: any[];
  dataKey: string;
  color: string;
  timeFrame: string;
}) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="text-lg font-medium">Sales Over Time Chart</div>
      <div className="text-sm text-gray-500">
        Showing {dataKey} data for {timeFrame}
      </div>
    </div>
  </div>
);

const MachinePerformanceCard = ({
  data,
  isLoading,
  selectedMachine,
  machines,
}: {
  data: any;
  isLoading: boolean;
  selectedMachine: string;
  machines: Machine[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Machine Performance</CardTitle>
      <CardDescription>
        {selectedMachine === "all"
          ? "All machines performance"
          : "Single machine metrics"}
      </CardDescription>
    </CardHeader>
    <CardContent className="h-80">
      {isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-medium">Performance Metrics</div>
            <div className="text-sm text-gray-500">
              Machine data visualization
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const RevenueMetricsCard = ({
  data,
  isLoading,
}: {
  data: RevenueData | null;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Revenue Overview</CardTitle>
      <CardDescription>Summary of revenue metrics</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium">Total Revenue</div>
            <div className="text-2xl font-bold">
              ₹{getRevenue(data.total).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Average Order Value</div>
            <div className="text-2xl font-bold">
              ₹{getAverageOrderValue(data).toFixed(2)}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-muted-foreground">No revenue data available</p>
        </div>
      )}
    </CardContent>
  </Card>
);

// Simple PopularProductsTable component until the real one is implemented
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
            <td className="py-3 px-2">{product.name}</td>
            <td className="py-3 px-2">{product.unitsSold}</td>
            <td className="py-3 px-2">₹{product.revenue.toFixed(2)}</td>
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
    options?: { params?: any }
  ): Promise<{ success: boolean; data: T }> {
    try {
      const queryParams = options?.params
        ? "?" +
          new URLSearchParams(
            Object.entries(options.params)
              .filter(([_, v]) => v !== undefined)
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
    } catch (error) {
      console.error(`Error calling ${url}:`, error);

      // Return fallback mock data when API fails
      return { success: false, data: generateMockData<T>(url) };
    }
  },
};

// Function to generate fallback mock data when API fails
function generateMockData<T>(url: string): T {
  console.log(`Generating mock data for ${url}`);

  if (url.includes("/machines")) {
    return [
      { machine_id: "m1", name: "Coffee Machine 1" },
      { machine_id: "m2", name: "Coffee Machine 2" },
      { machine_id: "m3", name: "Coffee Machine 3" },
    ] as unknown as T;
  }

  if (url.includes("/sales/machine/") || url.includes("/sales/machines")) {
    return {
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
    } as unknown as T;
  }

  if (url.includes("/sales/product")) {
    return Array.from({ length: 8 }, (_, i) => ({
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
    })) as unknown as T;
  }

  if (url.includes("/sales/category")) {
    return [
      { name: "Coffee", unitsSold: 1250, revenue: 62500 },
      { name: "Cold Drinks", unitsSold: 480, revenue: 28800 },
      { name: "Tea", unitsSold: 320, revenue: 16000 },
      { name: "Snacks", unitsSold: 180, revenue: 9000 },
    ] as unknown as T;
  }

  if (url.includes("/revenue")) {
    return {
      timeSeriesData: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: format(date, "yyyy-MM-dd"),
          revenue: Math.floor(Math.random() * 25000) + 8000,
        };
      }),
      total: 156000,
      average: 350,
    } as unknown as T;
  }

  if (url.includes("/products/popular")) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `p${i + 1}`,
      name: ["Espresso", "Latte", "Cappuccino", "Americano", "Mocha"][i],
      unitsSold: Math.floor(Math.random() * 200) + 50,
      revenue: Math.floor(Math.random() * 20000) + 5000,
      category: "Coffee",
    })) as unknown as T;
  }

  if (url.includes("/sales/time")) {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      units: Math.floor(Math.random() * 30) + 5,
      revenue: Math.floor(Math.random() * 3000) + 500,
    })) as unknown as T;
  }

  if (url.includes("/performance/machine/")) {
    return {
      uptime: 98.5,
      errorRate: 0.2,
      maintenanceNeeded: false,
      averageOrderTime: 45,
      totalOrders: 342,
      peakHour: "12:00",
      mostOrderedProduct: "Latte",
    } as unknown as T;
  }

  return {} as T;
}

// Type definitions
interface Machine {
  machine_id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  category?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface SalesData {
  hourly?: any[];
  daily?: any[];
}

interface RevenueData {
  timeSeriesData: any[];
  total: number | { revenue: number; orders: number };
  average?: number;
}

interface QueryParams {
  startDate?: string;
  endDate?: string;
  machineId?: string;
  interval?: string;
  limit?: number;
}

// Helper function to safely get revenue from either number or object format
const getRevenue = (
  total: number | { revenue: number; orders: number } | undefined
): number => {
  if (!total) return 0;
  return typeof total === "number" ? total : total.revenue;
};

// Helper function to safely get orders from object format
const getOrders = (
  total: { revenue: number; orders: number } | number | undefined
): number => {
  if (!total) return 0;
  return typeof total === "object" ? total.orders : 0;
};

// Helper function to safely get average order value
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
  const [activeTab, setActiveTab] = useState("sales");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState("today");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Analytics data states
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [productSalesData, setProductSalesData] = useState<Product[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [salesOverTime, setSalesOverTime] = useState<any[]>([]);
  const [machinePerformance, setMachinePerformance] = useState<any | null>(
    null
  );

  // Load machines on mount
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await apiService.get<Machine[]>("/machines");
        if (response.success) {
          // Ensure machines is always an array
          const machinesData = Array.isArray(response.data)
            ? response.data
            : [];
          setMachines(machinesData);
        }
      } catch (error) {
        console.error("Error fetching machines:", error);
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
      } catch (error) {
        console.error("Error fetching analytics data:", error);
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
        ? `/analytics/sales/machine/${selectedMachine}`
        : "/analytics/sales/machines";

    const response = await apiService.get<SalesData>(endpoint, { params });
    return response.success ? response.data : null;
  };

  const fetchProductSalesData = async (
    params: QueryParams
  ): Promise<Product[]> => {
    const response = await apiService.get<Product[]>(
      "/analytics/sales/product",
      { params }
    );
    return response.success ? response.data : [];
  };

  const fetchCategorySalesData = async (
    params: QueryParams
  ): Promise<any[]> => {
    const response = await apiService.get<any[]>("/analytics/sales/category", {
      params,
    });
    return response.success ? response.data : [];
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

    const response = await apiService.get<RevenueData>("/analytics/revenue", {
      params,
    });
    return response.success ? response.data : null;
  };

  const fetchPopularProductsData = async (
    params: QueryParams
  ): Promise<Product[]> => {
    params.limit = 10;
    const response = await apiService.get<Product[]>(
      "/analytics/products/popular",
      { params }
    );
    return response.success ? response.data : [];
  };

  const fetchSalesOverTimeData = async (
    params: QueryParams
  ): Promise<any[]> => {
    const intervalParam =
      timeFrame === "today"
        ? "hourly"
        : timeFrame === "7days"
        ? "daily"
        : timeFrame === "30days"
        ? "weekly"
        : "daily";

    params.interval = intervalParam;

    const response = await apiService.get<any[]>("/analytics/sales/time", {
      params,
    });
    return response.success ? response.data : [];
  };

  const fetchMachinePerformanceData = async (
    params: QueryParams
  ): Promise<any> => {
    const endpoint =
      selectedMachine !== "all"
        ? `/analytics/performance/machine/${selectedMachine}`
        : "/analytics/performance/machine/all";

    const response = await apiService.get<any>(endpoint, { params });
    return response.success ? response.data : null;
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
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Sales Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Product Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Time Trends</span>
          </TabsTrigger>
        </TabsList>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Total Sales Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RevenueMetricsCard data={revenueData} isLoading={isLoading} />

            {/* Sales By Time Period */}
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
                    data={
                      timeFrame === "today"
                        ? salesData.hourly || []
                        : salesData.daily || []
                    }
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
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Sales Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Product</CardTitle>
                <CardDescription>Top products by units sold</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : productSalesData && productSalesData.length > 0 ? (
                  <ProductSalesChart data={productSalesData.slice(0, 10)} />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No product sales data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Sales Breakdown */}
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
                  <CategorySalesChart data={categorySalesData} />
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
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MachinePerformanceCard
              data={machinePerformance}
              isLoading={isLoading}
              selectedMachine={selectedMachine}
              machines={machines}
            />

            {/* Revenue Trends */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : revenueData && revenueData.timeSeriesData ? (
                  <SalesOverTimeChart
                    data={revenueData.timeSeriesData}
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
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales Over Time */}
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
                ) : salesOverTime && salesOverTime.length > 0 ? (
                  <SalesOverTimeChart
                    data={salesOverTime}
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
