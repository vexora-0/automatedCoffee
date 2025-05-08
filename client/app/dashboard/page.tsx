import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Package, Coffee, CupSoda } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/ingredients">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CupSoda className="h-5 w-5 text-blue-600" />
                Ingredient Management
              </CardTitle>
              <CardDescription>
                Create, edit, and manage ingredients for your recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage all the ingredients used in your coffee recipes. Add new
                ingredients, update existing ones, and keep track of inventory.
              </p>
              <Button>Manage Ingredients</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/recipes">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Recipe Management
              </CardTitle>
              <CardDescription>
                Create, edit, and manage coffee recipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create and manage coffee recipes by combining ingredients with
                precise quantities. Set pricing, categories, and nutritional
                information.
              </p>
              <Button>Manage Recipes</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/machine-inventory">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-amber-600" />
                Machine Inventory
              </CardTitle>
              <CardDescription>
                Manage ingredient inventory for each machine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and update ingredient levels for each coffee machine. Set
                maximum capacities, monitor ingredient levels, and ensure
                machines are properly stocked.
              </p>
              <Button>Manage Machine Inventory</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                View sales and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Track sales performance, product popularity, and machine metrics.
                Analyze trends over time with comprehensive visualization and reporting tools.
              </p>
              <Button>View Analytics</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
