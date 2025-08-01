import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Package, User, Users, Building2 } from 'lucide-react';
import GargaStorageAccount from './GargaStorageAccount';
import MahmoudAccount from './MahmoudAccount';
import WaheedGargaAccount from './WaheedGargaAccount';

interface GargaMallAccountsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const GargaMallAccounts: React.FC<GargaMallAccountsProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections: AccountSection[] = [
    {
      id: 'storage',
      name: 'حسابات بايكه ومخازن جرجا',
      description: 'إدارة حسابات المخزن والبايكه',
      icon: <Package className="w-8 h-8" />,
      color: 'from-blue-600 via-blue-700 to-indigo-800',
    },
    {
      id: 'mahmoud',
      name: 'حسابات محمود موهوب',
      description: 'إدارة حسابات محمود موهوب',
      icon: <User className="w-8 h-8" />,
      color: 'from-green-600 via-green-700 to-emerald-800',
    },
    {
      id: 'waheed',
      name: 'حسابات وحيد سعيد',
      description: 'إدارة حسابات وحيد سعيد',
      icon: <Users className="w-8 h-8" />,
      color: 'from-purple-600 via-purple-700 to-indigo-800',
    },
  ];

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
  };

  const handleCloseAll = () => {
    setSelectedSection(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !selectedSection} onOpenChange={handleCloseAll}>
        <DialogContent className="w-[95vw] max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white text-center mb-6">
              <div className="flex items-center justify-center space-x-3 space-x-reverse">
                <Building2 className="w-8 h-8 text-emerald-400" />
                <span>جرجا معرض مول العرب</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => handleSectionClick(section.id)}
                >
                  <Card className="bg-gray-800/60 hover:bg-gray-700/60 border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 h-full relative overflow-hidden group">
                    {/* Hover gradient overlay */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      initial={false}
                    />
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                      initial={false}
                    />

                    <CardHeader className="text-center pb-4 relative z-10">
                      <div className={`mx-auto p-4 rounded-2xl bg-gradient-to-br ${section.color} shadow-lg mb-4`}>
                        <div className="text-white">
                          {section.icon}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors duration-300">
                        {section.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="text-center relative z-10">
                      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                        {section.description}
                      </p>
                      <div className="mt-4">
                        <Button
                          size="sm"
                          className={`bg-gradient-to-r ${section.color} hover:scale-105 transition-transform duration-300 text-white font-medium`}
                        >
                          فتح الحساب
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={handleCloseAll}
                className="border-red-600/50 text-red-400 hover:bg-red-600/20 hover:border-red-500 hover:text-red-300 transition-all duration-300"
              >
                إغلاق
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Individual Account Components */}
      <GargaStorageAccount
        isOpen={selectedSection === 'storage'}
        onClose={handleBackToSections}
      />

      <MahmoudAccount
        isOpen={selectedSection === 'mahmoud'}
        onClose={handleBackToSections}
      />

      <WaheedGargaAccount
        isOpen={selectedSection === 'waheed'}
        onClose={handleBackToSections}
      />
    </>
  );
};

export default GargaMallAccounts;
