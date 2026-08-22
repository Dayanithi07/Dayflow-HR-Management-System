import { useState, useEffect } from 'react';
import api from '../lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths } from 'date-fns';

function TimeOff() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const today = new Date();
  
  // Simplified calendar generation for wireframe look
  const generateMonthGrid = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const startDay = getDay(start); // 0 (Sun) to 6 (Sat)
    
    // Adjust to Monday start
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    
    const grid = Array(adjustedStartDay).fill(null);
    days.forEach(d => grid.push(d));
    return grid;
  };

  return (
    <div className="p-4 mx-4">
      <div className="border border-gray-600 bg-[#111111] w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-120px)]">
        
        {/* Header Tabs */}
        <div className="flex border-b border-gray-600 px-4 pt-2">
           <div className="border border-gray-600 border-b-[#111111] bg-[#151515] px-6 py-1.5 -mb-[1px] relative z-10">
              <span className="text-[#d86161] font-['Indie_Flower',sans-serif] text-sm">Time Off</span>
           </div>
        </div>

        <div className="p-4">
           {/* NEW Button */}
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-[#a352cc] text-black font-['Indie_Flower',sans-serif] px-8 py-1.5 text-sm mb-6 hover:bg-[#9142b8] transition-colors"
           >
             NEW
           </button>

           {/* Balances */}
           <div className="grid grid-cols-2 gap-0 border border-gray-600 bg-[#151515] mb-6">
              <div className="p-4 text-center border-r border-gray-600">
                 <h3 className="text-white font-['Indie_Flower',sans-serif] text-base">Paid time Off</h3>
                 <p className="text-gray-400 font-['Indie_Flower',sans-serif] text-xs mt-1">20 Days Available</p>
              </div>
              <div className="p-4 text-center">
                 <h3 className="text-white font-['Indie_Flower',sans-serif] text-base">Sick time off</h3>
                 <p className="text-gray-400 font-['Indie_Flower',sans-serif] text-xs mt-1">05 Days Available</p>
              </div>
           </div>

           {/* Calendar Area */}
           <div className="bg-white p-6 rounded-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 {[0, 1, 2, 3].map((m) => {
                    const monthDate = addMonths(today, m);
                    const grid = generateMonthGrid(monthDate);
                    return (
                      <div key={m} className="text-center">
                         <h4 className="font-sans text-xs font-bold mb-3 uppercase tracking-widest text-black">{format(monthDate, 'MMMM')}</h4>
                         <div className="grid grid-cols-7 gap-1 text-[8px] font-bold text-gray-500 mb-2">
                            {['M','T','W','T','F','S','S'].map((d, i) => <div key={i}>{d}</div>)}
                         </div>
                         <div className="grid grid-cols-7 gap-1 text-[10px] text-black">
                            {grid.map((d, i) => (
                               <div key={i} className={`
                                  aspect-square flex items-center justify-center rounded-full
                                  ${d && m === 1 && d.getDate() === 15 ? 'bg-red-500 text-white' : ''}
                                  ${d && m === 1 && d.getDate() >= 16 && d.getDate() <= 18 ? 'bg-red-500/20' : ''}
                                  ${d && m === 0 && d.getDate() === 5 ? 'bg-blue-500 text-white' : ''}
                               `}>
                                  {d ? d.getDate() : ''}
                               </div>
                            ))}
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="border border-gray-600 bg-[#151515] w-full max-w-md p-6 relative">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">x</button>
             
             <h2 className="text-white font-['Indie_Flower',sans-serif] text-lg border-b border-gray-600 pb-2 mb-6">Time off Type Request:</h2>
             
             <form className="space-y-4 font-['Indie_Flower',sans-serif] text-sm text-gray-300" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                <div className="flex items-center gap-4">
                   <label className="w-1/3 text-left">Employee</label>
                   <span className="text-[#5bc0de]">[Employee]</span>
                </div>
                
                <div className="flex items-center gap-4">
                   <label className="w-1/3 text-left">Time off Type</label>
                   <span className="text-[#5bc0de]">[Paid time off]</span>
                </div>

                <div className="flex items-center gap-4">
                   <label className="w-1/3 text-left">Validity Period</label>
                   <div className="flex items-center gap-2 text-[#5bc0de]">
                      <span>May 13</span>
                      <span className="text-gray-300">To</span>
                      <span>May 14</span>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <label className="w-1/3 text-left">Allocation</label>
                   <div className="flex items-center gap-2">
                      <span className="text-[#5bc0de]">01.00</span>
                      <span>Days</span>
                   </div>
                </div>

                <div className="flex items-center gap-4 border-b border-gray-600 pb-6">
                   <label className="w-1/3 text-left">Attachment</label>
                   <div className="flex items-center gap-2">
                      <button type="button" className="w-6 h-6 bg-[#1e4a6d] rounded flex items-center justify-center text-white text-xs">↑</button>
                      <span className="text-xs text-gray-500">(For Sick leave certificate)</span>
                   </div>
                </div>

                <div className="flex gap-4 pt-2">
                   <button type="submit" className="bg-[#a352cc] text-black px-6 py-1 text-sm hover:bg-[#9142b8] transition-colors">Submit</button>
                   <button type="button" onClick={() => setIsModalOpen(false)} className="border border-gray-600 px-6 py-1 text-sm text-gray-300 hover:text-white">Discard</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeOff;
