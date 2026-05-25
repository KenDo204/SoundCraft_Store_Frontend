import React, { useEffect } from 'react';
import Banner from '@/components/common/Home/Banner';
import { useAppSelector } from '@/store/hooks';
import { ForYouRecommendations } from '@/features/recommendations/ForYouRecommendations';
import { trackingService, UserActionType } from '@/services/tracking.service';

import TrustBadges from '@/components/home/TrustBadges';
import HeroCategories from '@/components/home/HeroCategories';
import BestSellers from '@/components/home/BestSellers';
import ProductsByCategory from '@/components/home/ProductsByCategory';
import DiscountedProducts from '@/components/home/DiscountedProducts';
import NewArrivals from '@/components/home/NewArrivals';
import NewsletterCTA from '@/components/home/NewsletterCTA';
import BrandPartners from '@/components/home/BrandPartners';

const Home: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    trackingService.track({
      actionType: UserActionType.SEARCH,
      keyword: 'homepage',
      contextData: { source: 'direct' },
    });
  }, []);

  return (
    <main className="bg-white min-h-screen font-sans overflow-hidden">
      {/* 1. Hero banner */}
      <Banner />

      {/* 2. Personalised recommendations (logged-in users only) */}
      {user && <ForYouRecommendations userId={user.id} />}

      {/* 3. Trust badges */}
      <TrustBadges />

      {/* 4. Browse by top-level category */}
      <HeroCategories />

      {/* 5. Best sellers */}
      <BestSellers />

      {/* 6. Products by category (tab switcher) */}
      <ProductsByCategory />

      {/* 7. Discounted products */}
      <DiscountedProducts />

      {/* 8. New arrivals */}
      <NewArrivals />

      {/* 9. Newsletter CTA */}
      <NewsletterCTA />

      {/* 10. Brand partners */}
      <BrandPartners />
    </main>
  );
};

export default Home;
