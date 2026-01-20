import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { Eye, Trash2, Package, Search, Ban, CheckCircle, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Order {
    id: string;
    customer_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    currency: string;
    order_items: any[];
    customer?: {
        full_name: string;
        email: string;
    };
    billing_address?: any;
    shipping_address?: any;
}

export const OrderManager = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [statusConfirm, setStatusConfirm] = useState<{ id: string, status: string } | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // 1. Fetch Orders with Items
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (*)
                `)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // 2. Fetch Profiles for these orders (to get names/emails)
            const userIds = [...new Set(ordersData.map(o => o.customer_id))];
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('user_id, full_name, email')
                .in('user_id', userIds);

            if (profilesError) throw profilesError;

            // 3. Merge Data
            const enrichedOrders = ordersData.map(order => ({
                ...order,
                customer: profilesData?.find(p => p.user_id === order.customer_id)
            }));

            setOrders(enrichedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const executeStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const deleteOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;

            setOrders(orders.filter(o => o.id !== orderId));
            toast.success('Order deleted');
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Failed to delete order');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'default'; // dark/black
            case 'pending': return 'secondary'; // gray
            case 'shipped': return 'default'; // blue-ish usually, but using default for now
            case 'delivered': return 'outline'; // green-ish
            case 'cancelled': return 'destructive'; // red
            case 'failed': return 'destructive';
            default: return 'outline';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Order Management
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="Search by ID, Email, Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                    <Button variant="outline" onClick={fetchOrders}>
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    Loading orders...
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">
                                        {order.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.customer?.full_name || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{order.customer?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {order.order_items?.length || 0} items
                                    </TableCell>
                                    <TableCell>
                                        ${Number(order.total_amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={order.status}
                                            onValueChange={(val) => setStatusConfirm({ id: order.id, status: val })}
                                        >
                                            <SelectTrigger className="w-[130px] h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Paid">Paid</SelectItem>
                                                <SelectItem value="Shipped">Shipped</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive/90"
                                                onClick={() => deleteOrder(order.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Order ID: <span className="font-mono">{selectedOrder?.id}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                                    <p className="font-medium">{selectedOrder.customer?.full_name}</p>
                                    <p className="text-sm">{selectedOrder.customer?.email}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <h4 className="text-sm font-medium text-muted-foreground">Date Placed</h4>
                                    <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Billing Address</h4>
                                    {selectedOrder.billing_address ? (
                                        <div className="text-sm">
                                            <p>{selectedOrder.billing_address.line1}</p>
                                            {selectedOrder.billing_address.line2 && <p>{selectedOrder.billing_address.line2}</p>}
                                            <p>{selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} {selectedOrder.billing_address.postal_code}</p>
                                            <p>{selectedOrder.billing_address.country}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Not provided</p>
                                    )}
                                </div>
                                <div className="space-y-1 text-right">
                                    <h4 className="text-sm font-medium text-muted-foreground">Shipping Address</h4>
                                    {selectedOrder.shipping_address ? (
                                        <div className="text-sm">
                                            <p>{selectedOrder.shipping_address.line1}</p>
                                            {selectedOrder.shipping_address.line2 && <p>{selectedOrder.shipping_address.line2}</p>}
                                            <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                                            <p>{selectedOrder.shipping_address.country}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Not provided</p>
                                    )}
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-muted/20">
                                <h4 className="font-semibold mb-3">Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.order_items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                                                    {item.quantity}
                                                </Badge>
                                                <span>{item.title || 'Product'}</span>
                                            </div>
                                            <span className="font-mono">
                                                ${(item.unit_price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 flex justify-between font-bold mt-2">
                                        <span>Total</span>
                                        <span>${Number(selectedOrder.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Status Log</h4>
                                <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Current Status: <strong>{selectedOrder.status}</strong></span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!statusConfirm} onOpenChange={(open) => !open && setStatusConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Order Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the status of order <span className="font-mono">{statusConfirm?.id.slice(0, 8)}...</span> to <span className="font-bold text-foreground">{statusConfirm?.status}</span>?
                            {statusConfirm?.status === 'Cancelled' && (
                                <span className="block mt-2 text-destructive">Using proper refund procedures via Stripe dashboard is recommended for payments. This only updates the transparent record.</span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (statusConfirm) {
                                executeStatusUpdate(statusConfirm.id, statusConfirm.status);
                            }
                        }}>Confirm Change</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};
