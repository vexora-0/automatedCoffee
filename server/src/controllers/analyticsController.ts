import { Request, Response } from 'express';
import Order from '../models/Order';
import Recipe from '../models/Recipe';
import Machine from '../models/Machine';
import RecipeCategory from '../models/RecipeCategory';
import mongoose from 'mongoose';

// Helper function to parse date range from query parameters
const parseDateRange = (req: Request) => {
  const { startDate, endDate } = req.query;
  let dateFilter: any = {};
  
  if (startDate) {
    dateFilter.ordered_at = { $gte: new Date(startDate as string) };
  }
  
  if (endDate) {
    dateFilter.ordered_at = { 
      ...dateFilter.ordered_at,
      $lte: new Date(endDate as string)
    };
  }

  // If no date range specified, default to today
  if (!startDate && !endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    dateFilter.ordered_at = { 
      $gte: today,
      $lte: new Date() 
    };
  }
  
  return dateFilter;
};

// Get sales data for a specific machine or all machines
export const getMachineSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId } = req.params;
    const dateFilter = parseDateRange(req);
    
    // Build the filter
    let filter: any = {
      status: 'completed',
      ...dateFilter
    };
    
    if (machineId && machineId !== 'all') {
      filter.machine_id = machineId;
    }
    
    const orders = await Order.find(filter)
      .populate('recipe_id', 'name price category_id')
      .lean();
    
    // Calculate total sales amount
    const total = orders.reduce((sum, order: any) => {
      return sum + (order.recipe_id?.price || 0);
    }, 0);
    
    // Group orders by hour for today's sales analysis
    if (!req.query.startDate && !req.query.endDate) {
      const salesByHour: { [hour: string]: { units: number, amount: number } } = {};
      
      orders.forEach((order: any) => {
        const hour = new Date(order.ordered_at).getHours();
        const hourString = `${hour}`;
        
        if (!salesByHour[hourString]) {
          salesByHour[hourString] = { units: 0, amount: 0 };
        }
        
        salesByHour[hourString].units += 1;
        salesByHour[hourString].amount += order.recipe_id?.price || 0;
      });
      
      res.status(200).json({
        success: true,
        data: {
          total: {
            units: orders.length,
            amount: total
          },
          hourly: salesByHour
        }
      });
    } else {
      // For custom date ranges, group by day
      const salesByDay: { [day: string]: { units: number, amount: number } } = {};
      
      orders.forEach((order: any) => {
        const date = new Date(order.ordered_at);
        const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!salesByDay[day]) {
          salesByDay[day] = { units: 0, amount: 0 };
        }
        
        salesByDay[day].units += 1;
        salesByDay[day].amount += order.recipe_id?.price || 0;
      });
      
      res.status(200).json({
        success: true,
        data: {
          total: {
            units: orders.length,
            amount: total
          },
          daily: salesByDay
        }
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get sales data by product
export const getSalesByProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, categoryId } = req.query;
    const dateFilter = parseDateRange(req);
    
    // Build the filter
    let filter: any = {
      status: 'completed',
      ...dateFilter
    };
    
    if (machineId) {
      filter.machine_id = machineId;
    }
    
    // First get all orders
    const orders = await Order.find(filter)
      .populate({
        path: 'recipe_id',
        select: 'name price category_id',
        populate: {
          path: 'category_id',
          model: 'RecipeCategory',
          select: 'name'
        }
      })
      .lean();
    
    // Filter by category if specified
    let filteredOrders = orders;
    if (categoryId) {
      filteredOrders = orders.filter((order: any) => 
        order.recipe_id?.category_id?._id === categoryId || 
        order.recipe_id?.category_id?.id === categoryId
      );
    }
    
    // Group orders by product
    const productSales: { [productId: string]: { 
      name: string, 
      units: number, 
      amount: number,
      category: string 
    } } = {};
    
    filteredOrders.forEach((order: any) => {
      if (!order.recipe_id) return;
      
      const { recipe_id } = order;
      const productId = recipe_id._id.toString();
      
      if (!productSales[productId]) {
        productSales[productId] = {
          name: recipe_id.name,
          units: 0,
          amount: 0,
          category: recipe_id.category_id?.name || 'Uncategorized'
        };
      }
      
      productSales[productId].units += 1;
      productSales[productId].amount += recipe_id.price || 0;
    });
    
    // Convert to array and sort by units sold
    const sortedProducts = Object.values(productSales)
      .sort((a, b) => b.units - a.units);
    
    res.status(200).json({
      success: true,
      data: sortedProducts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get sales data by category
export const getSalesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId } = req.query;
    const dateFilter = parseDateRange(req);
    
    // Build the filter
    let filter: any = {
      status: 'completed',
      ...dateFilter
    };
    
    if (machineId) {
      filter.machine_id = machineId;
    }
    
    const orders = await Order.find(filter)
      .populate({
        path: 'recipe_id',
        select: 'name price category_id',
        populate: {
          path: 'category_id',
          model: 'RecipeCategory',
          select: 'name'
        }
      })
      .lean();
    
    // Group orders by category
    const categorySales: { [categoryId: string]: { 
      name: string, 
      units: number, 
      amount: number 
    } } = {};
    
    orders.forEach((order: any) => {
      if (!order.recipe_id || !order.recipe_id.category_id) {
        // Handle products without a category
        if (!categorySales['uncategorized']) {
          categorySales['uncategorized'] = {
            name: 'Uncategorized',
            units: 0,
            amount: 0
          };
        }
        
        categorySales['uncategorized'].units += 1;
        categorySales['uncategorized'].amount += order.recipe_id?.price || 0;
        return;
      }
      
      const { category_id } = order.recipe_id;
      const categoryId = category_id._id.toString();
      
      if (!categorySales[categoryId]) {
        categorySales[categoryId] = {
          name: category_id.name,
          units: 0,
          amount: 0
        };
      }
      
      categorySales[categoryId].units += 1;
      categorySales[categoryId].amount += order.recipe_id.price || 0;
    });
    
    // Convert to array and sort by units sold
    const sortedCategories = Object.values(categorySales)
      .sort((a, b) => b.units - a.units);
    
    res.status(200).json({
      success: true,
      data: sortedCategories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, period } = req.query;
    const dateFilter = parseDateRange(req);
    
    // Build the filter
    let filter: any = {
      status: 'completed',
      ...dateFilter
    };
    
    if (machineId && machineId !== 'all') {
      filter.machine_id = machineId;
    }

    // Get time period for grouping (day, week, month)
    let timeUnit = '$dayOfMonth';
    let timeFormat = '%Y-%m-%d';
    
    if (period === 'weekly') {
      timeUnit = '$week';
      timeFormat = '%Y-W%V';
    } else if (period === 'monthly') {
      timeUnit = '$month';
      timeFormat = '%Y-%m';
    }

    // Use MongoDB aggregation to calculate revenue
    const revenue = await Order.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'recipes',
          localField: 'recipe_id',
          foreignField: 'recipe_id',
          as: 'recipe'
        }
      },
      { $unwind: '$recipe' },
      {
        $group: {
          _id: {
            date: { 
              $dateToString: { format: timeFormat, date: '$ordered_at' }
            }
          },
          totalRevenue: { $sum: '$recipe.price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);
    
    // Calculate total revenue
    const totalRevenue = revenue.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalOrders = revenue.reduce((sum, item) => sum + item.count, 0);
    
    // Format the result
    const revenueData = revenue.map(item => ({
      date: item._id.date,
      revenue: item.totalRevenue,
      orders: item.count
    }));
    
    res.status(200).json({
      success: true,
      data: {
        total: {
          revenue: totalRevenue,
          orders: totalOrders
        },
        timeSeriesData: revenueData
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get popular products
export const getPopularProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, limit } = req.query;
    const dateFilter = parseDateRange(req);
    
    const limitNumber = parseInt(limit as string) || 10;
    
    // Build the filter
    let filter: any = {
      status: 'completed',
      ...dateFilter
    };
    
    if (machineId && machineId !== 'all') {
      filter.machine_id = machineId;
    }

    // Get popular products using aggregation
    const popularProducts = await Order.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'recipes',
          localField: 'recipe_id',
          foreignField: 'recipe_id',
          as: 'recipe'
        }
      },
      { $unwind: '$recipe' },
      {
        $lookup: {
          from: 'recipecategories',
          localField: 'recipe.category_id',
          foreignField: '_id', 
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$recipe_id',
          name: { $first: '$recipe.name' },
          totalSold: { $sum: 1 },
          totalRevenue: { $sum: '$recipe.price' },
          categoryName: { $first: { $ifNull: ['$category.name', 'Uncategorized'] } },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: limitNumber }
    ]);
    
    res.status(200).json({
      success: true,
      data: popularProducts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get sales over time (hourly for today, daily for custom ranges)
export const getSalesOverTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId, interval } = req.query;
    const dateFilter = parseDateRange(req);
    
    // Build the filter
    let filter: any = {
      status: 'completed',
      ...dateFilter
    };
    
    if (machineId && machineId !== 'all') {
      filter.machine_id = machineId;
    }

    // Determine time grouping format
    let timeFormat = '%Y-%m-%d %H:00'; // Default hourly
    
    if (interval === 'daily') {
      timeFormat = '%Y-%m-%d';
    } else if (interval === 'weekly') {
      timeFormat = '%Y-W%V';
    } else if (interval === 'monthly') {
      timeFormat = '%Y-%m';
    }

    // Use aggregation to get sales over time
    const salesOverTime = await Order.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'recipes',
          localField: 'recipe_id',
          foreignField: 'recipe_id',
          as: 'recipe'
        }
      },
      { $unwind: '$recipe' },
      {
        $group: {
          _id: {
            timeInterval: { $dateToString: { format: timeFormat, date: '$ordered_at' } }
          },
          units: { $sum: 1 },
          amount: { $sum: '$recipe.price' }
        }
      },
      { $sort: { '_id.timeInterval': 1 } }
    ]);
    
    // Format the result
    const formattedData = salesOverTime.map(item => ({
      timeInterval: item._id.timeInterval,
      units: item.units,
      amount: item.amount
    }));
    
    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get machine performance metrics
export const getMachinePerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { machineId } = req.params;
    const dateFilter = parseDateRange(req);
    
    // Build the filter
    let filter: any = { ...dateFilter };
    
    if (machineId && machineId !== 'all') {
      filter.machine_id = machineId;
    }

    // Get completed orders
    const completedFilter = { ...filter, status: 'completed' };
    const completedOrders = await Order.countDocuments(completedFilter);
    
    // Get failed orders
    const failedFilter = { ...filter, status: 'failed' };
    const failedOrders = await Order.countDocuments(failedFilter);
    
    // Get cancelled orders
    const cancelledFilter = { ...filter, status: 'cancelled' };
    const cancelledOrders = await Order.countDocuments(cancelledFilter);
    
    // Get total revenue
    const revenue = await Order.aggregate([
      { $match: completedFilter },
      {
        $lookup: {
          from: 'recipes',
          localField: 'recipe_id',
          foreignField: 'recipe_id',
          as: 'recipe'
        }
      },
      { $unwind: '$recipe' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$recipe.price' }
        }
      }
    ]);
    
    // Get average rating
    const ratings = await Order.aggregate([
      { $match: { ...filter, rating: { $ne: null } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ordersCompleted: completedOrders,
        ordersFailed: failedOrders,
        ordersCancelled: cancelledOrders,
        totalOrders: completedOrders + failedOrders + cancelledOrders,
        successRate: completedOrders / (completedOrders + failedOrders + cancelledOrders) * 100 || 0,
        totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
        averageRating: ratings.length > 0 ? ratings[0].averageRating : 0,
        ratingCount: ratings.length > 0 ? ratings[0].ratingCount : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 