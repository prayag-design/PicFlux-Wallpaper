import React, { useState } from 'react';
import { X, Check, Zap, Crown } from 'lucide-react';

interface PremiumModalProps {
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-[#121212] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row">
        
        {/* Left Side: Pitch */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
            Unlock the Full <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Potential</span>
          </h2>
          <p className="text-gray-300 mb-8 relative z-10">
            Support creators and get access to uncompressed 4K, 8K, and Ultrawide originals. No ads, ever.
          </p>
          <ul className="space-y-4 relative z-10">
            {[
              'Unlimited full-resolution downloads',
              'Access to exclusive "PicFlux Originals"',
              'Priority generation with Gemini 3 Pro',
              'Ad-free experience',
              'Support the developer'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-200">
                <div className="p-1 bg-green-500/20 rounded-full text-green-400"><Check className="w-3 h-3" /></div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Pricing */}
        <div className="p-8 md:p-12 md:w-1/2 bg-surface flex flex-col items-center justify-center">
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
           
           <div className="text-center mb-8">
             <div className="inline-block p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-500/20 mb-4">
               <Crown className="w-8 h-8 text-white" />
             </div>
             <h3 className="text-xl font-bold text-white">PicFlux Pro</h3>
           </div>

           <div className="w-full space-y-4">
             <button className="w-full p-4 rounded-xl border-2 border-blue-500 bg-blue-500/10 flex items-center justify-between hover:bg-blue-500/20 transition-all">
               <div className="text-left">
                 <div className="font-bold text-white">Yearly Access</div>
                 <div className="text-xs text-blue-300">Save 2 months</div>
               </div>
               <div className="text-right">
                 <div className="font-bold text-xl text-white">$49.99</div>
                 <div className="text-xs text-gray-400">/year</div>
               </div>
             </button>

             <button className="w-full p-4 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 flex items-center justify-between transition-all">
               <div className="text-left">
                 <div className="font-bold text-white">Monthly</div>
                 <div className="text-xs text-gray-400">Flexible</div>
               </div>
               <div className="text-right">
                 <div className="font-bold text-xl text-white">$4.99</div>
                 <div className="text-xs text-gray-400">/mo</div>
               </div>
             </button>
           </div>

           <p className="mt-8 text-xs text-gray-500 text-center">
             Secure payment via Stripe. Cancel anytime. <br/>
             <a href="#" className="underline hover:text-gray-400">Restore purchases</a>
           </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;