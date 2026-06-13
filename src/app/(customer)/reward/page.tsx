'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RewardItem {
  id: string;
  name: string;
  description?: string;
  points_cost: number;
  stock_quantity: number;
  image_url?: string;
  is_active?: boolean;
}

interface Redemption {
  id: string;
  points_spent: number;
  status: string;
  created_at: string;
  notes?: string;
  reward_items?: {
    id: string;
    name: string;
    image_url?: string;
  } | RewardItem;
}

const fallbackItems: RewardItem[] = [
  {
    id: "toothbrush-uuid-placeholder-1",
    name: "Bamboo Toothbrush",
    points_cost: 30,
    stock_quantity: 20,
    image_url: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04",
    description: "Eco-friendly natural bamboo toothbrush to reduce plastic waste.",
  },
  {
    id: "notebook-uuid-placeholder-2",
    name: "Recycled Notebook",
    points_cost: 35,
    stock_quantity: 30,
    image_url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57",
    description: "Notebook made from 100% recycled paper fibers.",
  },
  {
    id: "straw-uuid-placeholder-3",
    name: "Stainless Steel Straw Set",
    points_cost: 40,
    stock_quantity: 25,
    image_url: "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c",
    description: "Reusable, durable food-grade steel straw set with cleaner brush.",
  },
  {
    id: "totebag-uuid-placeholder-4",
    name: "Eco Tote Bag",
    points_cost: 50,
    stock_quantity: 10,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    description: "Strong, organic cotton reusable tote bag for grocery shopping.",
  },
  {
    id: "seedkit-uuid-placeholder-5",
    name: "Plant Seed Kit",
    points_cost: 60,
    stock_quantity: 18,
    image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
    description: "Start your own organic home garden with this starter herb seed kit.",
  },
  {
    id: "bottle-uuid-placeholder-6",
    name: "Reusable Water Bottle",
    points_cost: 75,
    stock_quantity: 15,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
    description: "Vacuum insulated double-walled steel flask to keep drinks cold.",
  },
  {
    id: "lunchbox-uuid-placeholder-7",
    name: "Eco Lunch Box",
    points_cost: 90,
    stock_quantity: 12,
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554",
    description: "BPA-free wheat-straw leakproof bento lunch box with utensils.",
  },
  {
    id: "recyclingbin-uuid-placeholder-8",
    name: "Recycling Bin",
    points_cost: 100,
    stock_quantity: 5,
    image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
    description: "Divided home waste categorization sorting recycle bin.",
  },
  {
    id: "tshirt-uuid-placeholder-9",
    name: "Organic Cotton T-Shirt",
    points_cost: 120,
    stock_quantity: 8,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    description: "Premium regular-fit short sleeve tee made of organic cotton fibers.",
  },
  {
    id: "powerbank-uuid-placeholder-10",
    name: "Solar Power Bank",
    points_cost: 200,
    stock_quantity: 5,
    image_url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5",
    description: "High capacity water-resistant solar-panel backup charger bank.",
  }
];

export default function RewardPage() {
  const router = useRouter();
  const [items, setItems] = useState<RewardItem[]>([]);
  const [history, setHistory] = useState<Redemption[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadStoreData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('bf_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/pickup/profile`, { headers });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setPoints(profileData.reward_points || 0);
      }

      
      const itemsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/rewards/items`, { headers });
      let itemsData = itemsRes.ok ? await itemsRes.json() : [];
      
      
      if (itemsData.length === 0) {
        itemsData = fallbackItems;
      }
      setItems(itemsData);

      
      const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/rewards/history`, { headers });
      const historyData = historyRes.ok ? await historyRes.json() : [];
      setHistory(historyData);

    } catch (err: any) {
      setError('Failed to contact rewards server. Using local inventory backup.');
      setItems(fallbackItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  const handleRedeem = async (item: RewardItem) => {
    setError('');
    setSuccess('');

    
    if (points < item.points_cost) {
      setError(`⚠️ Insufficient points. You need ${item.points_cost} points, but you have ${points}.`);
      return;
    }

    if (item.stock_quantity <= 0) {
      setError('⚠️ Out of stock. This item is currently unavailable.');
      return;
    }

    const confirmRedeem = confirm(
      `🎁 Are you sure you want to redeem "${item.name}" for ${item.points_cost} points?\nThis action cannot be undone.`
    );
    if (!confirmRedeem) return;

    const token = localStorage.getItem('bf_token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/rewards/redeem`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id: item.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        
        
        if (item.id.includes('placeholder')) {
          setPoints(prev => prev - item.points_cost);
          setItems(prev =>
            prev.map(i => (i.id === item.id ? { ...i, stock_quantity: i.stock_quantity - 1 } : i))
          );
          const mockRedemption: Redemption = {
            id: `mock-id-${Date.now()}`,
            points_spent: item.points_cost,
            status: 'pending',
            created_at: new Date().toISOString(),
            reward_items: item,
          };
          setHistory(prev => [mockRedemption, ...prev]);
          setSuccess(`🎉 Item redeemed successfully! Generated mock code for local demonstration.`);
          return;
        }
        throw new Error(result.message || 'Redemption request failed');
      }

      setSuccess(`🎉 Successfully redeemed ${item.name}! Your points balance has been updated.`);
      loadStoreData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen space-y-8">
      {}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-green-50 pb-6 gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-2">
            Eco Exchange
          </span>
          <h1 className="font-display text-4xl font-bold text-green-950 font-semibold">
            Sustainable Rewards Store
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Spend your points earned from recycling on top-tier eco-friendly items.
          </p>
        </div>
        
        {}
        <div className="auth-card rounded-2xl px-6 py-4 flex flex-col items-center md:items-end justify-center self-start bg-white border border-green-50 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Point Balance</span>
          <span className="text-3xl font-extrabold text-green-700 mt-1">
            {points.toLocaleString()} <span className="text-base font-semibold">pts</span>
          </span>
        </div>
      </div>

      {}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold animate-pulse">
          {success}
        </div>
      )}

      {}
      <section className="space-y-6">
        <h2 className="font-display text-3xl font-bold text-green-950">
          Exchange Point Catalog
        </h2>

        {loading && items.length === 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="auth-card rounded-3xl p-4 animate-pulse space-y-4 bg-white">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const outOfStock = item.stock_quantity <= 0;
              const cannotAfford = points < item.points_cost;

              return (
                <div
                  key={item.id}
                  className="auth-card rounded-3xl p-4 bg-white border border-green-50 shadow-sm flex flex-col justify-between hover:scale-[1.01] hover:shadow-md transition duration-300"
                >
                  <div className="space-y-4">
                    {}
                    <div
                      className="h-48 rounded-2xl bg-cover bg-center border border-gray-100 flex items-end justify-end p-3 relative overflow-hidden"
                      style={{
                        backgroundImage: `url('${item.image_url || '/placeholder.png'}')`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <span className="relative z-10 px-3 py-1 rounded-full text-xs font-bold bg-green-700 text-white shadow-sm">
                        ⭐ {item.points_cost} pts
                      </span>
                    </div>

                    {}
                    <div className="space-y-1">
                      <h3 className="font-bold text-green-950 text-lg leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium line-clamp-2">
                        {item.description || "Premium sustainable lifestyle item."}
                      </p>
                    </div>
                  </div>

                  {}
                  <div className="mt-4 pt-4 border-t border-green-500/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">
                      Stock: <span className={outOfStock ? "text-rose-600 font-extrabold" : "text-green-700 font-extrabold"}>
                        {item.stock_quantity}
                      </span>
                    </span>

                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={outOfStock || cannotAfford}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-sm ${
                        outOfStock
                          ? "bg-rose-100 text-rose-600 cursor-not-allowed"
                          : cannotAfford
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-green-700 text-white hover:bg-green-800"
                      }`}
                    >
                      {outOfStock ? "Out of Stock" : cannotAfford ? "Locked" : "🎁 Redeem"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {}
      <section className="auth-card rounded-3xl p-8 bg-white border border-green-50 shadow-sm mt-12">
        <h2 className="font-display text-2xl font-bold text-green-950 mb-6">
          Redemption Claim History
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-500 font-medium text-center py-6">
            You haven't claimed any eco-friendly rewards yet. Build your recycling balance to unlock catalog items!
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((claim) => {
              const itemInfo = claim.reward_items as any;
              return (
                <div
                  key={claim.id}
                  className="flex items-center justify-between border-b border-green-50 pb-4 last:border-none last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {/* Tiny Image Thumbnail */}
                    <div
                      className="w-12 h-12 rounded-xl bg-cover bg-center border border-gray-100 flex-shrink-0"
                      style={{
                        backgroundImage: `url('${itemInfo?.image_url || 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04'}')`,
                      }}
                    ></div>

                    <div className="space-y-1">
                      <p className="font-bold text-green-950 text-sm">
                        {itemInfo?.name || "Redeemed Item"}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">
                        Spent: {claim.points_spent} pts • {new Date(claim.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {claim.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
