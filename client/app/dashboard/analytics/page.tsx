"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  LineChart,
  TrendingUp,
  Clock,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
} from "lucide-react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";

// Import custom chart components
import CategorySalesChart from "@/app/dashboard/analytics/components/CategorySalesChart";
import MachinePerformanceCard from "@/app/dashboard/analytics/components/MachinePerformanceCard";
import ProductSalesChart from "@/app/dashboard/analytics/components/ProductSalesChart";
import RevenueMetricsCard from "@/app/dashboard/analytics/components/RevenueMetricsCard";
import SalesChart from "@/app/dashboard/analytics/components/SalesChart";
import SalesOverTimeChart from "@/app/dashboard/analytics/components/SalesOverTimeChart";

// Import API client from services
import { apiClient } from "@/lib/api";

// Import UI components properly instead of local implementations
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePickerWithRange } from "@/components/date-range-picker";

// DatePickerWithRange is now imported from components

// Add this interface definition
interface CategorySalesData {
  name: string;
  units: number;
  amount: number;
}

const formatCategorySalesData = (data: CategorySales[] | any) => {
  // Ensure data is an array
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const formatted = data.map((category) => {
    if (!category) return { name: "Unknown", units: 0, amount: 0 };

    return {
      name: category.name || category.categoryName || "Unknown Category",
      units: category.units || category.totalSold || 0,
      amount: category.amount || category.totalRevenue || 0,
    };
  }).filter(item => item.name !== "Unknown Category" || item.units > 0 || item.amount > 0);

  return formatted;
};

const formatProductSalesData = (data: Product[] | any) => {
  // Ensure data is an array
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const formatted = data.map((product) => {
    if (!product) return { name: "Unknown", units: 0, amount: 0, category: "Other" };

    return {
      name: product.name || "Unknown Product",
      units: product.totalSold || product.unitsSold || product.units || 0,
      amount: product.totalRevenue || product.revenue || product.amount || 0,
      category: product.categoryName || product.category || "Other",
    };
  }).filter(item => item.name !== "Unknown Product" || item.units > 0 || item.amount > 0);

  return formatted;
};

const formatSalesChartData = (
  data: any,
  isToday: boolean
) => {
  // If data is already in the right format (object with string keys), return it
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }

  // If data is an array, convert to the expected object format
  if (Array.isArray(data)) {
    const formattedData: Record<string, { units: number; amount: number }> = {};

    data.forEach((point) => {
      if (!point) return;

      // Format key based on whether it's hourly or daily data
      let key;
      if (isToday && point.time) {
        key = point.time;
      } else if (!isToday && point.date) {
        key = point.date;
      } else if (point.timeInterval) {
        key = point.timeInterval;
      }

      if (key) {
        formattedData[key] = {
          units: point.units || 0,
          amount: point.revenue || point.amount || 0,
        };
      }
    });

    return formattedData;
  }

  return {};
};

const formatTimeSeriesData = (data: any) => {
  // Ensure data is an array
  if (!data || !Array.isArray(data)) {
    return [];
  }

  const formatted = data
    .filter((point) => point != null)
    .map((point) => ({
      timeInterval: point.timeInterval || point.time || point.date || "",
      units: point.units || 0,
      revenue: point.revenue || point.amount || 0,
      orders: point.orders || 0,
    }));

  return formatted;
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
            <td className="py-3 px-2">{product.totalSold || product.unitsSold || 0}</td>
            <td className="py-3 px-2">
              {new Intl.NumberFormat('en-IN', { 
                style: 'currency', 
                currency: 'INR',
                maximumFractionDigits: 0
              }).format(product.totalRevenue || product.revenue || 0)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Improve type definitions with more specific typing
interface Machine {
  machine_id: string;
  name: string;
  location?: string;
  status?: string;
}

interface Product {
  id?: string;
  name?: string;
  unitsSold?: number;
  revenue?: number;
  category?: string;
  // Add backend fields for mapping
  totalSold?: number;
  totalRevenue?: number;
  categoryName?: string;
  _id?: string;
}

interface CategorySales {
  name: string;
  units: number;
  amount: number;
  category?: string;
}

interface SalesDataPoint {
  time?: string;
  date?: string;
  units: number;
  revenue: number;
  orders?: number;
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
  units?: number; 
  timeInterval?: string; // Added for compatibility with formatTimeSeriesData
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
  [key: string]: unknown; 
}

// Improved error handling for API calls
const safelyFetchData = async <T,>(fetchFn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fetchFn();
  } catch (error) {
    console.error("Error fetching data:", error);
    return fallback;
  }
};

// Improved helpers with better error handling
const getRevenue = (
  total: number | { revenue: number; orders: number } | undefined
): string => {
  if (!total) return "₹0";
  const value = typeof total === "number" ? total : total.revenue;
  return new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const getOrders = (
  total: { revenue: number; orders: number } | number | undefined
): number => {
  if (!total) return 0;
  return typeof total === "object" ? total.orders : 0;
};

const getAverageOrderValue = (data: RevenueData | null): string => {
  if (!data) return "₹0";
  if (data.average !== undefined) {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(data.average);
  }

  const total = data.total;
  if (!total) return "₹0";

  if (typeof total === "object" && total.orders > 0) {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(total.revenue / total.orders);
  }
  return "₹0";
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
  const router = useRouter();
  
  // State declarations
  const [activeTab, setActiveTab] = useState<string>("sales");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState<string>("30days");
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
        
        const response = await apiClient.get("/machines");

        
        if (response.data && response.data.success) {
          // Ensure machines is always an array
          const machinesData = Array.isArray(response.data.data)
            ? response.data.data
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

        // Fetch all data in parallel with safe error handling
        const [
          salesResponse,
          productResponse,
          categoryResponse,
          revenueResponse,
          popularResponse,
          timeSeriesResponse,
          performanceResponse,
        ] = await Promise.all([
          safelyFetchData(() => fetchSalesData(dateParams), null),
          safelyFetchData(() => fetchProductSalesData(dateParams), []),
          safelyFetchData(() => fetchCategorySalesData(dateParams), []),
          safelyFetchData(() => fetchRevenueData(dateParams), null),
          safelyFetchData(() => fetchPopularProductsData(dateParams), []),
          safelyFetchData(() => fetchSalesOverTimeData(dateParams), []),
          safelyFetchData(() => fetchMachinePerformanceData(dateParams), null),
        ]);

        // Set state with the fetched data
        setSalesData(salesResponse);
        setProductSalesData(productResponse);
        setCategorySalesData(categoryResponse);
        setRevenueData(revenueResponse);
        setPopularProducts(popularResponse);
        setSalesOverTime(timeSeriesResponse);
        setMachinePerformance(performanceResponse);

        // Check for zero-value data and provide helpful messaging
        const foundZeroValues = 
          (!salesResponse || (salesResponse.total?.units === 0)) &&
          productResponse.every(p => (!p.totalSold || p.totalSold === 0) && (!p.unitsSold || p.unitsSold === 0)) &&
          categoryResponse.every(c => !c.units || c.units === 0);
          
        if (foundZeroValues) {
          const timeMsg = timeFrame === "today" 
            ? "today" 
            : timeFrame === "7days" 
            ? "the last 7 days"
            : timeFrame === "30days"
            ? "the last 30 days"
            : "the selected time period";
            
          setError(`No completed orders found for ${timeMsg}. Try selecting a different time period or check if there are completed orders in your system.`);
        }
      } catch (error) {
        console.error("Error in fetchAnalyticsData:", error);
        setError("Failed to load analytics data. Please check your network connection and try again.");
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
      
      const response = await apiClient.get(`/analytics${endpoint}`, { 
        params: params as any 
      });


      // Ensure we have valid hourly and daily data arrays
      if (response.data && response.data.success && response.data.data) {
        const result = response.data.data;
        
        // Ensure hourly and daily are arrays or set them to empty arrays
        return {
          hourly: Array.isArray(result.hourly) ? result.hourly : [],
          daily: Array.isArray(result.daily) ? result.daily : [],
          total: result.total,
        };
      }
      console.warn(`⚠️ [Frontend] No sales data in response`);
      return null;
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return null;
    }
  };

  const fetchProductSalesData = async (
    params: QueryParams
  ): Promise<Product[]> => {
    try {
      
      const response = await apiClient.get("/analytics/sales/product", { 
        params: params as any 
      });

      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        
        // Properly map fields from backend to frontend
        return response.data.data.map((item: any) => ({
          id: item._id || "",
          name: item.name || "Unknown Product",
          unitsSold: item.unitsSold || 0,
          revenue: item.revenue || 0, 
          category: item.category || "Other",
          // Add the backend fields too
          totalSold: item.totalSold || 0,
          totalRevenue: item.totalRevenue || 0,
          categoryName: item.categoryName || "Other"
        }));
      }
      console.warn(`⚠️ [Frontend] No product sales data in response`);
      return [];
    } catch (error) {
      console.error("Error fetching product sales data:", error);
      return [];
    }
  };

  const fetchCategorySalesData = async (
    params: QueryParams
  ): Promise<CategorySales[]> => {
    try {
      
      const response = await apiClient.get("/analytics/sales/category", { 
        params: params as any 
      });

      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        
        // Properly map fields from backend to frontend
        return response.data.data.map((item: any) => ({
          name: item.categoryName || item.name || "Other",
          units: item.totalSold || item.units || 0,
          amount: item.totalRevenue || item.amount || 0
        }));
      }
      console.warn(`⚠️ [Frontend] No category sales data in response`);
      return [];
    } catch (error) {
      console.error("Error fetching category sales data:", error);
      return [];
    }
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

    try {
      
      const response = await apiClient.get("/analytics/revenue", { 
        params: params as any 
      });

      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      return null;
    }
  };

  const fetchPopularProductsData = async (
    params: QueryParams
  ): Promise<Product[]> => {
    params.limit = 10;
    try {
      
      const response = await apiClient.get("/analytics/products/popular", { 
        params: params as any 
      });

      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        
        // Properly map fields from backend to frontend
        return response.data.data.map((item: any) => ({
          id: item._id || "",
          name: item.name || "Unknown Product",
          totalSold: item.totalSold || 0,
          totalRevenue: item.totalRevenue || 0,
          categoryName: item.categoryName || "Other"
        }));
      }
      console.warn(`⚠️ [Frontend] No popular products data in response`);
      return [];
    } catch (error) {
      console.error("Error fetching popular products:", error);
      return [];
    }
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

    try {
      
      const response = await apiClient.get("/analytics/sales/time", { 
        params: params as any 
      });

      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      console.warn(`⚠️ [Frontend] No sales over time data in response`);
      return [];
    } catch (error) {
      console.error("Error fetching sales over time data:", error);
      return [];
    }
  };

  const fetchMachinePerformanceData = async (
    params: QueryParams
  ): Promise<MachinePerformance | null> => {
    const endpoint =
      selectedMachine !== "all"
        ? `/performance/machine/${selectedMachine}`
        : "/performance/machine/all";

    params.limit = 10;

    try {
      
      const response = await apiClient.get(`/analytics${endpoint}`, { 
        params: params as any 
      });

      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching machine performance data:", error);
      return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

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
            Key metrics from all coffee machine operations{" "}
            {timeFrame === "today" 
              ? "(Today)" 
              : timeFrame === "7days" 
              ? "(Last 7 Days)"
              : timeFrame === "30days"
              ? "(Last 30 Days)"
              : timeFrame === "custom"
              ? `(${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")})`
              : "(Last 30 Days)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={getRevenue(revenueData?.total)}
              trend="up"
              trendValue={revenueData ? "+12% from last period" : "0%"}
              icon={<CreditCard className="h-4 w-4 text-blue-600" />}
              isLoading={isLoading}
            />
            <StatCard
              title="Orders"
              value={
                getOrders(revenueData?.total).toLocaleString("en-IN")
              }
              trend="up"
              trendValue="+8% from last period"
              icon={<Package className="h-4 w-4 text-purple-600" />}
              isLoading={isLoading}
            />
            <StatCard
              title="Average Order Value"
              value={getAverageOrderValue(revenueData)}
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

      {/* Filters Section - Update with proper components */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-6 rounded-lg shadow-sm">
        <div className="font-medium text-lg">Filter Analytics Data</div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div>
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white">
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
          </div>

          <div>
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days (Default)</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {timeFrame === "custom" && (
            <DatePickerWithRange
              className="w-full sm:w-auto"
              date={dateRange}
              onDateChange={(date) => {
                if (date?.from && date?.to) {
                  setDateRange({ from: date.from, to: date.to });
                }
              }}
            />
          )}
        </div>
      </div>

      {error && (
        <Alert className="mb-6 bg-blue-50 border border-blue-200 text-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            </div>
            {timeFrame === "today" && (
              <button
                onClick={() => setTimeFrame("30days")}
                className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Try Last 30 Days
              </button>
            )}
          </div>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger 
            value="sales"
            className="flex items-center gap-2"
          >
            <LineChart className="h-4 w-4" />
            <span>Sales Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            <span>Product Analytics</span>
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            <span>Time Trends</span>
          </TabsTrigger>
        </TabsList>

        {/* Sales Analytics Tab */}
        <TabsContent
          value="sales"
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
