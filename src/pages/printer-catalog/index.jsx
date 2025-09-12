import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import FilterPanel from './components/FilterPanel';
import SortControls from './components/SortControls';
import PrinterCard from './components/PrinterCard';
import PrinterModal from './components/PrinterModal';
import LoadingSkeleton from './components/LoadingSkeleton';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PrinterCatalog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [printers, setPrinters] = useState([]);
  const [filteredPrinters, setFilteredPrinters] = useState([]);
  const [filters, setFilters] = useState({
    materials: [],
    bedSizeMin: '',
    bedSizeMax: '',
    priceMin: '',
    priceMax: '',
    quality: [],
    location: [],
    multicolor: false,
    expressAvailable: false,
    availableNow: false
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock printer data
  const mockPrinters = [
    {
      id: 1,
      name: "Prusa i3 MK3S+",
      host: {
        name: "Jan Novák",
        memberSince: "leden 2023",
        completedOrders: 127,
        responseTime: "< 2 hodiny",
        bio: "Zkušený 3D tiskař s více než 5 lety praxe. Specializuji se na přesné funkční díly a prototypy pro průmyslové aplikace."
      },
      location: "Ostrava",
      bedSize: "250×210×210 mm",
      maxHeight: "210 mm",
      layerResolution: "0.05-0.35 mm",
      printSpeed: "až 200 mm/s",
      extruders: 1,
      materials: ["PLA", "ABS", "PETG", "TPU"],
      pricePerHour: 180,
      rating: 4.8,
      reviewCount: 34,
      availability: "available",
      features: {
        multicolor: false,
        express: true
      },
      images: [
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1565191999001-551c187427bb?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
      ],
      description: "Profesionální 3D tiskárna s vynikající přesností a spolehlivostí. Ideální pro funkční prototypy, náhradní díly a přesné mechanické komponenty."
    },
    {
      id: 2,
      name: "Ender 3 V2",
      host: {
        name: "Marie Svobodová",
        memberSince: "březen 2023",
        completedOrders: 89,
        responseTime: "< 4 hodiny",
        bio: "Nadšenkyně do 3D tisku se zaměřením na kreativní projekty a dekorativní předměty. Ráda pomáhám začátečníkům s jejich prvními projekty."
      },
      location: "Brno",
      bedSize: "220×220×250 mm",
      maxHeight: "250 mm",
      layerResolution: "0.1-0.4 mm",
      printSpeed: "až 180 mm/s",
      extruders: 1,
      materials: ["PLA", "ABS", "PETG"],
      pricePerHour: 120,
      rating: 4.5,
      reviewCount: 28,
      availability: "available",
      features: {
        multicolor: false,
        express: false
      },
      images: [
        "https://images.unsplash.com/photo-1565191999001-551c187427bb?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop"
      ],
      description: "Spolehlivá a cenově dostupná tiskárna pro hobby projekty a začátečníky. Skvělá pro dekorativní předměty a jednoduché funkční díly."
    },
    {
      id: 3,
      name: "Bambu Lab X1 Carbon",
      host: {
        name: "Tomáš Dvořák",
        memberSince: "září 2022",
        completedOrders: 203,
        responseTime: "< 1 hodina",
        bio: "Profesionální designér a vývojář produktů. Specializuji se na vysokorychlostní tisk s prémiovou kvalitou pro komerční projekty."
      },
      location: "Praha",
      bedSize: "256×256×256 mm",
      maxHeight: "256 mm",
      layerResolution: "0.08-0.28 mm",
      printSpeed: "až 500 mm/s",
      extruders: 1,
      materials: ["PLA", "ABS", "PETG", "TPU", "PA", "PC"],
      pricePerHour: 350,
      rating: 4.9,
      reviewCount: 67,
      availability: "available",
      features: {
        multicolor: true,
        express: true
      },
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1565191999001-551c187427bb?w=600&h=400&fit=crop"
      ],
      description: "Nejmodernější 3D tiskárna s automatickou kalibrací a AI asistovaným tiskem. Perfektní pro náročné projekty vyžadující nejvyšší kvalitu."
    },
    {
      id: 4,
      name: "Artillery Sidewinder X2",
      host: {
        name: "Pavel Černý",
        memberSince: "červen 2023",
        completedOrders: 45,
        responseTime: "< 6 hodin",
        bio: "Hobby maker s láskou k velkým projektům. Specializuji se na velkoformátové tisky a funkční díly pro domácnost."
      },
      location: "Ostrava",
      bedSize: "300×300×400 mm",
      maxHeight: "400 mm",
      layerResolution: "0.1-0.4 mm",
      printSpeed: "až 150 mm/s",
      extruders: 1,
      materials: ["PLA", "ABS", "PETG", "Wood"],
      pricePerHour: 200,
      rating: 4.3,
      reviewCount: 19,
      availability: "busy",
      features: {
        multicolor: false,
        express: false
      },
      images: [
        "https://images.unsplash.com/photo-1565191999001-551c187427bb?w=600&h=400&fit=crop"
      ],
      description: "Velkoformátová tiskárna ideální pro větší projekty a díly. Spolehlivá a stabilní konstrukce pro dlouhé tisky."
    },
    {
      id: 5,
      name: "Prusa MINI+",
      host: {
        name: "Anna Kratochvílová",
        memberSince: "listopad 2023",
        completedOrders: 23,
        responseTime: "< 8 hodin",
        bio: "Začínající 3D tiskařka s velkým nadšením. Ráda se učím nové techniky a pomáhám ostatním s jejich projekty."
      },
      location: "Brno",
      bedSize: "180×180×180 mm",
      maxHeight: "180 mm",
      layerResolution: "0.1-0.35 mm",
      printSpeed: "až 170 mm/s",
      extruders: 1,
      materials: ["PLA", "PETG"],
      pricePerHour: 100,
      rating: 4.1,
      reviewCount: 12,
      availability: "available",
      features: {
        multicolor: false,
        express: false
      },
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop"
      ],
      description: "Kompaktní a přesná tiskárna pro menší projekty. Ideální pro detailní modely a přesné díly."
    },
    {
      id: 6,
      name: "Ultimaker S3",
      host: {
        name: "Michal Procházka",
        memberSince: "duben 2022",
        completedOrders: 156,
        responseTime: "< 3 hodiny",
        bio: "Profesionální 3D tiskař se zaměřením na technické aplikace a průmyslové prototypy. Více než 8 let zkušeností v oboru."
      },
      location: "Praha",
      bedSize: "230×190×200 mm",
      maxHeight: "200 mm",
      layerResolution: "0.06-0.2 mm",
      printSpeed: "až 24 mm³/s",
      extruders: 2,
      materials: ["PLA", "ABS", "PETG", "TPU", "Nylon", "PC"],
      pricePerHour: 280,
      rating: 4.7,
      reviewCount: 43,
      availability: "available",
      features: {
        multicolor: true,
        express: true
      },
      images: [
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop",
        "https://images.unsplash.com/photo-1565191999001-551c187427bb?w=600&h=400&fit=crop"
      ],
      description: "Profesionální dual-extruder tiskárna s vynikající kvalitou tisku. Ideální pro složité geometrie s podporami a vícebarevné projekty."
    }
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPrinters(mockPrinters);
      setFilteredPrinters(mockPrinters);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...printers];

    // Apply filters
    if (filters?.materials?.length > 0) {
      filtered = filtered?.filter(printer => 
        filters?.materials?.some(material => printer?.materials?.includes(material))
      );
    }

    if (filters?.bedSizeMin) {
      filtered = filtered?.filter(printer => {
        const size = parseInt(printer?.bedSize?.split('×')?.[0]);
        return size >= parseInt(filters?.bedSizeMin);
      });
    }

    if (filters?.bedSizeMax) {
      filtered = filtered?.filter(printer => {
        const size = parseInt(printer?.bedSize?.split('×')?.[0]);
        return size <= parseInt(filters?.bedSizeMax);
      });
    }

    if (filters?.priceMin) {
      filtered = filtered?.filter(printer => printer?.pricePerHour >= parseInt(filters?.priceMin));
    }

    if (filters?.priceMax) {
      filtered = filtered?.filter(printer => printer?.pricePerHour <= parseInt(filters?.priceMax));
    }

    if (filters?.quality?.length > 0) {
      filtered = filtered?.filter(printer => {
        const rating = Math.floor(printer?.rating);
        return filters?.quality?.some(q => rating >= parseInt(q));
      });
    }

    if (filters?.location?.length > 0) {
      filtered = filtered?.filter(printer => 
        filters?.location?.some(loc => {
          if (loc === 'ostrava') return printer?.location === 'Ostrava';
          if (loc === 'brno') return printer?.location === 'Brno';
          if (loc === 'praha') return printer?.location === 'Praha';
          return false;
        })
      );
    }

    if (filters?.multicolor) {
      filtered = filtered?.filter(printer => printer?.features?.multicolor);
    }

    if (filters?.expressAvailable) {
      filtered = filtered?.filter(printer => printer?.features?.express);
    }

    if (filters?.availableNow) {
      filtered = filtered?.filter(printer => printer?.availability === 'available');
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = a?.pricePerHour;
          bValue = b?.pricePerHour;
          break;
        case 'rating':
          aValue = a?.rating;
          bValue = b?.rating;
          break;
        case 'availability':
          aValue = a?.availability === 'available' ? 1 : 0;
          bValue = b?.availability === 'available' ? 1 : 0;
          break;
        case 'distance':
          // Mock distance calculation
          aValue = Math.random();
          bValue = Math.random();
          break;
        default:
          aValue = a?.rating * a?.reviewCount;
          bValue = b?.rating * b?.reviewCount;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredPrinters(filtered);
  }, [printers, filters, sortBy, sortOrder]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handlePrinterSelect = (printer) => {
    // Navigate to booking page with printer data
    navigate('/model-upload', { state: { selectedPrinter: printer } });
  };

  const handleViewDetails = (printer) => {
    setSelectedPrinter(printer);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPrinter(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <button 
                onClick={() => navigate('/customer-dashboard')}
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </button>
              <Icon name="ChevronRight" size={14} />
              <span>Katalog tiskáren</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Katalog 3D tiskáren</h1>
            <p className="text-muted-foreground">
              Najděte perfektní tiskárnu pro váš projekt. Filtrujte podle materiálu, velikosti a dalších parametrů.
            </p>
          </div>

          <div className="flex gap-8">
            {/* Filter Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  isOpen={false}
                  onToggle={() => {}}
                  resultCount={filteredPrinters?.length}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Panel */}
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                resultCount={filteredPrinters?.length}
              />

              {/* Sort Controls */}
              <SortControls
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {/* Results */}
              {loading ? (
                <LoadingSkeleton viewMode={viewMode} />
              ) : filteredPrinters?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Search" size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Žádné tiskárny nenalezeny</h3>
                  <p className="text-muted-foreground mb-6">
                    Zkuste upravit filtry nebo vyhledávací kritéria
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      materials: [],
                      bedSizeMin: '',
                      bedSizeMax: '',
                      priceMin: '',
                      priceMax: '',
                      quality: [],
                      location: [],
                      multicolor: false,
                      expressAvailable: false,
                      availableNow: false
                    })}
                  >
                    Vymazat filtry
                  </Button>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' :'space-y-4'
                }>
                  {filteredPrinters?.map(printer => (
                    <PrinterCard
                      key={printer?.id}
                      printer={printer}
                      viewMode={viewMode}
                      onSelect={handlePrinterSelect}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {!loading && filteredPrinters?.length > 0 && (
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    iconName="RotateCw"
                    iconPosition="left"
                  >
                    Načíst další tiskárny
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Printer Detail Modal */}
      <PrinterModal
        printer={selectedPrinter}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSelect={handlePrinterSelect}
      />
    </div>
  );
};

export default PrinterCatalog;