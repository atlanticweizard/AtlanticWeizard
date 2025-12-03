import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Eye,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PayuTransaction, Order } from "@shared/schema";

interface TransactionWithOrder extends PayuTransaction {
  order?: Order;
}

const statusColors: Record<string, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failure: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

function CopyableText({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
        {text}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}

export default function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionWithOrder | null>(null);
  const [expandedJson, setExpandedJson] = useState<string | null>(null);

  const { data: transactions, isLoading } = useQuery<TransactionWithOrder[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch =
      tx.payuTxnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.payuPaymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      tx.order?.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.order?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View all PayU transaction logs</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by txn ID, payment ID, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-transactions"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-transaction-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                      <TableCell>
                        <code className="text-xs font-mono">{tx.payuTxnId}</code>
                      </TableCell>
                      <TableCell>
                        {tx.order?.orderNumber ? (
                          <span className="font-mono text-sm">
                            {tx.order.orderNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums font-medium">
                        {tx.currency === "USD" ? "$" : "₹"}
                        {parseFloat(tx.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[tx.status]}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedTransaction(tx)}
                          data-testid={`button-view-transaction-${tx.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No transactions found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Transactions will appear here once payments are processed"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <CopyableText text={selectedTransaction.payuTxnId} />
                  </div>
                  {selectedTransaction.payuPaymentId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Payment ID</p>
                      <CopyableText text={selectedTransaction.payuPaymentId} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-bold">
                      {selectedTransaction.currency === "USD" ? "$" : "₹"}
                      {parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedTransaction.status]}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-mono">
                      {selectedTransaction.order?.orderNumber || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {formatDate(selectedTransaction.createdAt)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Hash Sent</p>
                  {selectedTransaction.hashSent ? (
                    <CopyableText text={selectedTransaction.hashSent} />
                  ) : (
                    <p className="text-muted-foreground text-sm">Not available</p>
                  )}
                </div>

                {selectedTransaction.hashReceived && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Hash Received
                    </p>
                    <CopyableText text={selectedTransaction.hashReceived} />
                  </div>
                )}

                <Separator />

                {selectedTransaction.rawRequest && (
                  <Collapsible
                    open={expandedJson === "request"}
                    onOpenChange={(open) =>
                      setExpandedJson(open ? "request" : null)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto"
                      >
                        <span className="font-semibold">Raw Request</span>
                        {expandedJson === "request" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs font-mono">
                        {JSON.stringify(selectedTransaction.rawRequest, null, 2)}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {selectedTransaction.rawResponse && (
                  <Collapsible
                    open={expandedJson === "response"}
                    onOpenChange={(open) =>
                      setExpandedJson(open ? "response" : null)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto"
                      >
                        <span className="font-semibold">Raw Response</span>
                        {expandedJson === "response" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-xs font-mono">
                        {JSON.stringify(selectedTransaction.rawResponse, null, 2)}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
