import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Truck, 
  BarChart3, 
  User, 
  Plus, 
  Search, 
  Settings, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Package, 
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { StoreInfo, Product, Order, ServiceRequest } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const TabButton = ({ 
  active, 
  icon: Icon, 
  label, 
  onClick 
}: { 
  active: boolean; 
  icon: any; 
  label: string; 
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center flex-1 py-2 transition-colors",
      active ? "text-emerald-600" : "text-zinc-400"
    )}
  >
    <Icon size={20} className={active ? "fill-emerald-600/10" : ""} />
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-white rounded-2xl shadow-sm border border-zinc-100 p-4", className)} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' }) => {
  const variants = {
    default: "bg-zinc-100 text-zinc-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    error: "bg-rose-100 text-rose-600",
  };
  
  const statusMap: Record<string, { label: string; variant: keyof typeof variants }> = {
    'pending': { label: '待处理', variant: 'warning' },
    'paid': { label: '已支付', variant: 'success' },
    'shipped': { label: '已发货', variant: 'success' },
    'completed': { label: '已完成', variant: 'success' },
    'cancelled': { label: '已取消', variant: 'error' },
    'refunded': { label: '已退款', variant: 'error' },
    'assigned': { label: '已分配', variant: 'warning' },
  };

  const status = typeof children === 'string' ? statusMap[children.toLowerCase()] : null;
  const label = status ? status.label : children;
  const activeVariant = status ? status.variant : variant;

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[activeVariant])}>
      {label}
    </span>
  );
};

// --- Mock Data ---

const MOCK_STORE: StoreInfo = {
  id: 1,
  name: "社区生活直营店",
  contact: "张经理",
  phone: "13800138000",
  email: "store@example.com",
  photos: ["https://picsum.photos/seed/store/400/300"],
  features: "新鲜直供, 极速配送, 24h售后",
  notices: "今日西红柿特价, 欢迎选购"
};

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "新鲜有机西红柿", price: 12.5, stock: 100, category: "蔬菜", isDistribution: false },
  { id: 2, name: "高山红富士苹果", price: 25.0, stock: 50, category: "水果", isDistribution: true },
  { id: 3, name: "五常大米 5kg", price: 88.0, stock: 30, category: "粮油", isDistribution: false },
  { id: 4, name: "鲁花花生油 5L", price: 158.0, stock: 20, category: "粮油", isDistribution: true },
  { id: 5, name: "特仑苏牛奶 250ml*12", price: 65.0, stock: 40, category: "饮品", isDistribution: false },
  { id: 6, name: "进口车厘子 500g", price: 45.0, stock: 15, category: "水果", isDistribution: true },
];

const MOCK_ORDERS: Order[] = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  orderNumber: `ORD${Date.now() - i * 1000000}`,
  productId: (i % 6) + 1,
  productName: MOCK_PRODUCTS[i % 6].name,
  quantity: 1 + (i % 3),
  totalAmount: (MOCK_PRODUCTS[i % 6].price * (1 + (i % 3))),
  status: i === 0 ? 'pending' : i < 5 ? 'paid' : 'completed',
  customerName: ["张三", "李四", "王五", "赵六", "钱七"][i % 5],
  customerPhone: `1380013800${i % 10}`,
  customerAddress: `幸福社区${[1, 3, 8, 12, 5][i % 5]}号楼${[101, 502, 203, 1101, 404][i % 5]}`,
  createdAt: new Date(Date.now() - i * 3600000 * 12).toISOString(),
}));

const MOCK_SERVICES: ServiceRequest[] = [
  { id: 1, type: 'errand', title: '代买感冒药', description: '急需感冒灵和布洛芬，送至2号楼', status: 'pending', customerName: '业主1', customerPhone: '13900139001', address: '幸福社区1号楼', createdAt: new Date().toISOString() },
  { id: 2, type: 'housekeeping', title: '深度保洁', description: '三室两厅深度保洁，约周六上午', status: 'assigned', customerName: '业主2', customerPhone: '13900139002', address: '幸福社区2号楼', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 3, type: 'repair', title: '水龙头漏水', description: '厨房水龙头不停滴水，需要更换', status: 'completed', customerName: '业主3', customerPhone: '13900139003', address: '幸福社区3号楼', createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 4, type: 'errand', title: '取快递', description: '菜鸟驿站有三个大件，搬不动', status: 'pending', customerName: '业主4', customerPhone: '13900139004', address: '幸福社区4号楼', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 5, type: 'housekeeping', title: '油烟机清洗', description: '一年没洗了，油垢比较多', status: 'completed', customerName: '业主5', customerPhone: '13900139005', address: '幸福社区5号楼', createdAt: new Date(Date.now() - 3600000 * 16).toISOString() },
];

const MOCK_STATS = {
  salesByDay: Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
    total: 500 + Math.floor(Math.random() * 1000)
  }))
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [store, setStore] = useState<StoreInfo | null>(MOCK_STORE);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [services, setServices] = useState<ServiceRequest[]>(MOCK_SERVICES);
  const [stats, setStats] = useState<any>(MOCK_STATS);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStoreSettings, setShowStoreSettings] = useState(false);

  const handleCreateOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = Number(formData.get('productId'));
    const product = products.find(p => p.id === productId);
    
    const newOrder: Order = {
      id: orders.length + 1,
      orderNumber: "ORD" + Date.now(),
      productId,
      productName: product?.name || '未知产品',
      quantity: Number(formData.get('quantity')),
      totalAmount: (product?.price || 0) * Number(formData.get('quantity')),
      status: 'pending',
      customerName: formData.get('customerName') as string,
      customerPhone: formData.get('customerPhone') as string,
      customerAddress: formData.get('customerAddress') as string,
      createdAt: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);
    setShowOrderModal(false);
  };

  const handleCreateService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newService: ServiceRequest = {
      id: services.length + 1,
      type: formData.get('type') as any,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      status: 'pending',
      customerName: formData.get('customerName') as string,
      customerPhone: formData.get('customerPhone') as string,
      address: formData.get('address') as string,
      createdAt: new Date().toISOString(),
    };

    setServices([newService, ...services]);
    setShowServiceModal(false);
  };

  const handleUpdateStore = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedStore: StoreInfo = {
      ...store!,
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      features: formData.get('features') as string,
      notices: formData.get('notices') as string,
    };

    setStore(updatedStore);
    setShowStoreSettings(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans overflow-hidden max-w-md mx-auto border-x border-zinc-200 shadow-2xl">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-bottom border-zinc-100 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">{store?.name || "社区电商"}</h1>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Community Platform</p>
          </div>
        </div>
        <button 
          onClick={() => setShowStoreSettings(true)}
          className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Store Info Card */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="success">直营店</Badge>
                    <div className="flex gap-2">
                      <a href={`tel:${store?.phone}`} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Phone size={16} /></a>
                      <a href={`mailto:${store?.email}`} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Mail size={16} /></a>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{store?.name}</h2>
                    <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
                      <User size={14} /> 联系人: {store?.contact}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-zinc-50 rounded-xl">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">特色服务</p>
                      <p className="text-xs font-medium mt-1 truncate">{store?.features || "暂无特色"}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">入店须知</p>
                      <p className="text-xs font-medium mt-1 truncate">{store?.notices || "暂无须知"}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Plus, label: '下单', color: 'bg-emerald-500', onClick: () => setShowOrderModal(true) },
                  { icon: Package, label: '产品', color: 'bg-blue-500', onClick: () => setActiveTab('orders') },
                  { icon: Truck, label: '跑腿', color: 'bg-amber-500', onClick: () => setShowServiceModal(true) },
                  { icon: BarChart3, label: '统计', color: 'bg-purple-500', onClick: () => setActiveTab('stats') },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={item.onClick}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-zinc-200", item.color)}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-xs font-semibold text-zinc-600">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Recent Orders */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">最近订单</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    全部订单 <ChevronRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <Card key={order.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{order.productName}</p>
                          <p className="text-[10px] text-zinc-400">{format(new Date(order.createdAt), 'MM-dd HH:mm')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">¥{order.totalAmount}</p>
                        <Badge variant={order.status === 'pending' ? 'warning' : 'success'}>{order.status}</Badge>
                      </div>
                    </Card>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-zinc-400">
                      <p className="text-sm">暂无订单数据</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm">
                <Search size={18} className="text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="搜索订单、客户、产品..." 
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['全部', '待付款', '待发货', '已完成', '已退款'].map((filter) => (
                  <button key={filter} className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors",
                    filter === '全部' ? "bg-emerald-600 text-white" : "bg-white text-zinc-500 border border-zinc-100"
                  )}>
                    {filter}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-zinc-400 font-bold">订单号: {order.orderNumber}</p>
                        <h4 className="font-bold text-base mt-1">{order.productName} x {order.quantity}</h4>
                      </div>
                      <Badge variant={order.status === 'pending' ? 'warning' : 'success'}>{order.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1"><User size={12} /> {order.customerName}</div>
                      <div className="flex items-center gap-1"><Phone size={12} /> {order.customerPhone}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin size={12} /> {order.customerAddress}
                    </div>
                    <div className="pt-3 border-t border-zinc-50 flex justify-between items-center">
                      <p className="text-lg font-bold text-emerald-600">¥{order.totalAmount}</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-600 text-xs font-bold">详情</button>
                        {order.status === 'pending' && (
                          <button className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">去支付</button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <button 
                onClick={() => setShowOrderModal(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-600/30 flex items-center justify-center z-20"
              >
                <Plus size={28} />
              </button>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div 
              key="services"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'errand', label: '跑腿代办', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { type: 'housekeeping', label: '家政服务', icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { type: 'repair', label: '维修预约', icon: Settings, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((s) => (
                  <button 
                    key={s.type}
                    onClick={() => setShowServiceModal(true)}
                    className={cn("p-4 rounded-2xl flex flex-col items-center gap-2 border border-transparent hover:border-zinc-200 transition-all", s.bg)}
                  >
                    <s.icon size={24} className={s.color} />
                    <span className="text-[10px] font-bold text-zinc-700">{s.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">服务动态</h3>
                {services.map((service) => (
                  <Card key={service.id} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          service.type === 'errand' ? "bg-amber-100 text-amber-600" : 
                          service.type === 'housekeeping' ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"
                        )}>
                          {service.type === 'errand' ? <Truck size={16} /> : service.type === 'housekeeping' ? <Home size={16} /> : <Settings size={16} />}
                        </div>
                        <h4 className="font-bold text-sm">{service.title}</h4>
                      </div>
                      <Badge variant={service.status === 'pending' ? 'warning' : 'success'}>{service.status}</Badge>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <Clock size={12} /> {format(new Date(service.createdAt), 'MM-dd HH:mm')}
                      </div>
                      <button className="text-xs font-bold text-emerald-600">查看进度</button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-emerald-600 text-white border-none">
                  <p className="text-[10px] font-bold uppercase opacity-80">今日销售额</p>
                  <p className="text-2xl font-bold mt-1">¥{stats?.salesByDay?.[0]?.total || 0}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold">
                    <span className="bg-white/20 px-1.5 py-0.5 rounded">+12.5%</span>
                    <span>较昨日</span>
                  </div>
                </Card>
                <Card>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">累计订单</p>
                  <p className="text-2xl font-bold mt-1 text-zinc-800">{orders.length}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span>+5</span>
                    <span>本周新增</span>
                  </div>
                </Card>
              </div>

              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-zinc-50">
                  <h4 className="font-bold text-sm">销售趋势 (近7日)</h4>
                </div>
                <div className="h-64 w-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.salesByDay || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: '#a1a1aa'}} 
                        tickFormatter={(val) => format(new Date(val), 'MM-dd')}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-zinc-50">
                  <h4 className="font-bold text-sm">渠道分布</h4>
                </div>
                <div className="h-64 w-full p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: '直营', value: 400 },
                      { name: '分销', value: 300 },
                      { name: '跑腿', value: 200 },
                      { name: '家政', value: 150 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                  <User size={48} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-xl">管理员账号</h3>
                  <p className="text-xs text-zinc-400 font-medium">admin@community.com</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { icon: Settings, label: '店铺设置', onClick: () => setShowStoreSettings(true) },
                  { icon: User, label: '员工管理', onClick: () => {} },
                  { icon: AlertCircle, label: '权限分配', onClick: () => {} },
                  { icon: Truck, label: '物流对接', onClick: () => {} },
                  { icon: Mail, label: '消息中心', onClick: () => {} },
                ].map((item, i) => (
                  <button 
                    key={i}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400">
                        <item.icon size={18} />
                      </div>
                      <span className="text-sm font-bold text-zinc-700">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300" />
                  </button>
                ))}
              </div>

              <button className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 mt-4">
                退出登录
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-zinc-100 px-2 py-1 flex items-center justify-around fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30">
        <TabButton active={activeTab === 'home'} icon={Home} label="首页" onClick={() => setActiveTab('home')} />
        <TabButton active={activeTab === 'orders'} icon={ShoppingBag} label="订单" onClick={() => setActiveTab('orders')} />
        <TabButton active={activeTab === 'services'} icon={Truck} label="服务" onClick={() => setActiveTab('services')} />
        <TabButton active={activeTab === 'stats'} icon={BarChart3} label="统计" onClick={() => setActiveTab('stats')} />
        <TabButton active={activeTab === 'profile'} icon={User} label="我的" onClick={() => setActiveTab('profile')} />
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {showOrderModal && (
          <Modal title="创建新订单" onClose={() => setShowOrderModal(false)}>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">选择产品</label>
                <select name="productId" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} - ¥{p.price}</option>)}
                  {products.length === 0 && <option disabled>暂无产品，请先添加</option>}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">数量</label>
                <input type="number" name="quantity" defaultValue="1" min="1" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">客户姓名</label>
                <input type="text" name="customerName" placeholder="如：张三" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">联系电话</label>
                <input type="tel" name="customerPhone" placeholder="138xxxx" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">配送地址</label>
                <textarea name="customerAddress" rows={2} placeholder="详细地址..." className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 mt-4">
                确认下单
              </button>
            </form>
          </Modal>
        )}

        {showServiceModal && (
          <Modal title="提交服务需求" onClose={() => setShowServiceModal(false)}>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">服务类型</label>
                <select name="type" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required>
                  <option value="errand">跑腿代办</option>
                  <option value="housekeeping">家政服务</option>
                  <option value="repair">维修预约</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">需求标题</label>
                <input type="text" name="title" placeholder="如：代买买菜、空调清洗" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">详细描述</label>
                <textarea name="description" rows={3} placeholder="请描述具体需求..." className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">联系人</label>
                <input type="text" name="customerName" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">联系电话</label>
                <input type="tel" name="customerPhone" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">服务地址</label>
                <input type="text" name="address" className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 mt-4">
                提交需求
              </button>
            </form>
          </Modal>
        )}

        {showStoreSettings && (
          <Modal title="店铺信息设置" onClose={() => setShowStoreSettings(false)}>
            <form onSubmit={handleUpdateStore} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">直营店名称</label>
                <input type="text" name="name" defaultValue={store?.name} className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">联系人</label>
                  <input type="text" name="contact" defaultValue={store?.contact} className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">联系电话</label>
                  <input type="tel" name="phone" defaultValue={store?.phone} className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">邮箱</label>
                <input type="email" name="email" defaultValue={store?.email} className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">特色服务 (选填)</label>
                <input type="text" name="features" defaultValue={store?.features} className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">入店须知 (选填)</label>
                <textarea name="notices" rows={2} defaultValue={store?.notices} className="w-full p-3 bg-zinc-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 mt-4">
                保存设置
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-white w-full max-w-md rounded-t-[32px] p-6 pb-10 shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">{title}</h3>
        <button onClick={onClose} className="p-2 bg-zinc-50 rounded-full text-zinc-400"><X size={20} /></button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
        {children}
      </div>
    </motion.div>
  </motion.div>
);
