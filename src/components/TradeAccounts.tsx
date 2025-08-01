import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  TrendingUp,
  Building2,
} from 'lucide-react';
import MerchantAccount from './MerchantAccount';

interface TradeAccountsProps {
  isOpen: boolean;
  onClose: () => void;
}

const TradeAccounts: React.FC<TradeAccountsProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const accountSections = [
    {
      id: 'merchant-accounts',
      title: 'حسابات تجار البلينا',
      description: 'إدارة حسابات التجار والفواتير',
      icon: ShoppingCart,
      color: 'from-teal-600 to-cyan-700',
      bgColor: 'bg-teal-500/10',
    },
  ];

  const handleAccountClick = (accountId: string) => {
    setSelectedAccount(accountId);
  };

  const handleCloseAccount = () => {
    setSelectedAccount(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700/50 p-0">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>

          {/* Header */}
          <DialogHeader className="relative z-10 p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-4 space-x-reverse text-right">
              <motion.div
                className="p-3 bg-gradient-to-r from-teal-600 to-cyan-700 rounded-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white text-right">
                  البلينا للتجارة والحسابات
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-right">
                  إدارة الحسابات التجارية والتعاملات المالية
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accountSections.map((section, index) => {
                const IconComponent = section.icon;

                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/40 border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 cursor-pointer group">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-center mb-4">
                          <motion.div
                            className={`p-4 bg-gradient-to-r ${section.color} rounded-xl shadow-lg`}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <IconComponent className="w-8 h-8 text-white" />
                          </motion.div>
                        </div>
                        <CardTitle className="text-lg font-bold text-white text-center">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-center">
                          {section.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          onClick={() => handleAccountClick(section.id)}
                          className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg group-hover:shadow-xl`}
                        >
                          فتح الحسابات
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Info Section */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border-teal-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-right flex items-center justify-end">
                    <span className="ml-2">معلومات النظام</span>
                    <Building2 className="w-5 h-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-right">
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <h4 className="text-teal-400 font-semibold mb-2">
                        حسابات تجار البلينا
                      </h4>
                      <p className="text-gray-300 text-sm">
                        إدارة شاملة لحسابات التجار مع تتبع الفواتير والدفعات والمبالغ المتبقية
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Dialogs */}
      {selectedAccount === 'merchant-accounts' && (
        <MerchantAccount
          isOpen={true}
          onClose={handleCloseAccount}
        />
      )}
    </>
  );
};

export default TradeAccounts;
