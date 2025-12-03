import { useQuery } from "@tanstack/react-query";
import {
  Package,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalTransactions: number;
  pendingOrders: number;
  paidOrders: number;
  failedOrders: number;
  revenueINR: number;
  revenueUSD: number;
  successfulTransactions: number;
  failedTransactions: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32 mt-2" />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-semibold">Failed to load dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Please try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const successRate = stats?.totalTransactions
    ? Math.round(
        ((stats.successfulTransactions || 0) / stats.totalTransactions) * 100
      )
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          description="Active products in catalog"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          description={`${stats?.pendingOrders || 0} pending`}
        />
        <StatCard
          title="Paid Orders"
          value={stats?.paidOrders || 0}
          icon={TrendingUp}
          description="Successfully completed"
        />
        <StatCard
          title="Transactions"
          value={stats?.totalTransactions || 0}
          icon={CreditCard}
          description={`${successRate}% success rate`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Revenue (INR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              ₹{(stats?.revenueINR || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total revenue in Indian Rupees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue (USD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              ${(stats?.revenueUSD || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total revenue in US Dollars
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Pending
              </Badge>
              <span className="text-sm font-medium tabular-nums">
                {stats?.pendingOrders || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Paid
              </Badge>
              <span className="text-sm font-medium tabular-nums">
                {stats?.paidOrders || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Failed</Badge>
              <span className="text-sm font-medium tabular-nums">
                {stats?.failedOrders || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Successful
              </Badge>
              <span className="text-sm font-medium tabular-nums">
                {stats?.successfulTransactions || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Failed</Badge>
              <span className="text-sm font-medium tabular-nums">
                {stats?.failedTransactions || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
