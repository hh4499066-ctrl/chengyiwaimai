export type Merchant = {
  id: number;
  name: string;
  category: string;
  rating: number;
  monthlySales: number;
  distance: string;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  image: string;
  tags: string[];
};

export type Dish = {
  id: number;
  merchantId: number;
  name: string;
  desc: string;
  price: number;
  sales: number;
  image: string;
  category: string;
};

export type DemoOrder = {
  id: string;
  merchantName: string;
  status: '待支付' | '商家备餐中' | '骑手配送中' | '已完成';
  totalAmount: number;
  receiver: string;
  address: string;
  riderName: string;
  riderPhone: string;
};

export const merchants: Merchant[] = [
  {
    id: 1,
    name: '老刘家招牌牛肉面',
    category: '面食简餐',
    rating: 4.8,
    monthlySales: 1280,
    distance: '800m',
    deliveryTime: '25分钟',
    minOrder: 15,
    deliveryFee: 1.5,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=640&q=80',
    tags: ['满30减5', '校园热卖', '免包装费'],
  },
  {
    id: 2,
    name: '橙意轻食研究所',
    category: '轻食沙拉',
    rating: 4.9,
    monthlySales: 960,
    distance: '1.2km',
    deliveryTime: '32分钟',
    minOrder: 20,
    deliveryFee: 0,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=640&q=80',
    tags: ['新客立减', '低脂高蛋白'],
  },
];

export const dishes: Dish[] = [
  {
    id: 101,
    merchantId: 1,
    name: '招牌红烧牛肉面',
    desc: '慢炖牛腱肉，搭配手工拉面和秘制红油。',
    price: 28.5,
    sales: 642,
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=640&q=80',
    category: '招牌推荐',
  },
  {
    id: 102,
    merchantId: 1,
    name: '番茄肥牛拌面',
    desc: '酸甜番茄汤底，肥牛鲜嫩，适合晚餐。',
    price: 26,
    sales: 418,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=640&q=80',
    category: '热销单品',
  },
  {
    id: 103,
    merchantId: 1,
    name: '冰柠檬茶',
    desc: '清爽解腻，少冰少糖可选。',
    price: 9,
    sales: 899,
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=640&q=80',
    category: '饮品',
  },
];

export const demoOrder: DemoOrder = {
  id: 'CY202605120001',
  merchantName: '老刘家招牌牛肉面',
  status: '骑手配送中',
  totalAmount: 43,
  receiver: '张同学',
  address: '学校东门 3 号宿舍楼 502',
  riderName: '王师傅',
  riderPhone: '138****2468',
};
