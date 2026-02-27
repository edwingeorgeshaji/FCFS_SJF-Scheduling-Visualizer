import React, { useState, useCallback } from 'react';
import { Play, Plus, Trash2, RotateCcw, Cpu, BarChart2, List, Clock, Activity, Info, ChevronDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Process = {
  id: string;
  arrivalTime: number;
  burstTime: number;
};

type GanttBlock = {
  processId: string;
  start: number;
  end: number;
  isIdle: boolean;
};

type ProcessMetrics = Process & {
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
};

type SimulationResult = {
  gantt: GanttBlock[];
  metrics: ProcessMetrics[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  log: string[];
};

const DEFAULT_PROCESSES: Process[] = [];

export default function App() {
  const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState<'FCFS' | 'SJF'>('SJF');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLogExpanded, setIsLogExpanded] = useState(false);

  const [newId, setNewId] = useState('');
  const [newArrival, setNewArrival] = useState('');
  const [newBurst, setNewBurst] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddProcess = () => {
    setError(null);
    
    if (!newId.trim()) {
      setError('Process ID cannot be empty.');
      return;
    }
    
    if (processes.some(p => p.id === newId.trim())) {
      setError('Process ID must be unique.');
      return;
    }

    const arrival = Number(newArrival);
    const burst = Number(newBurst);

    if (newArrival.trim() === '' || isNaN(arrival) || arrival < 0) {
      setError('Arrival time must be a valid non-negative number.');
      return;
    }

    if (newBurst.trim() === '' || isNaN(burst) || burst <= 0) {
      setError('Burst time must be a valid positive number greater than 0.');
      return;
    }

    const newProcesses = [...processes, { 
      id: newId.trim(), 
      arrivalTime: arrival, 
      burstTime: burst 
    }];
    
    setProcesses(newProcesses);
    
    setNewId('');
    setNewArrival('');
    setNewBurst('');
    
    if (result) {
      setResult(algorithm === 'FCFS' ? simulateFCFS(newProcesses) : simulateSJF(newProcesses));
    }
  };

  const handleRemoveProcess = (id: string) => {
    const newProcesses = processes.filter(p => p.id !== id);
    setProcesses(newProcesses);
    if (result) {
      if (newProcesses.length === 0) {
        setResult(null);
      } else {
        setResult(algorithm === 'FCFS' ? simulateFCFS(newProcesses) : simulateSJF(newProcesses));
      }
    }
  };

  const handleReset = () => {
    setProcesses(DEFAULT_PROCESSES);
    setNewId('');
    setNewArrival('');
    setNewBurst('');
    setError(null);
    setResult(null);
  };

  const handleLoadExample = () => {
    const exampleProcs = [
      { id: 'P1', arrivalTime: 0, burstTime: 8 },
      { id: 'P2', arrivalTime: 1, burstTime: 4 },
      { id: 'P3', arrivalTime: 2, burstTime: 2 },
      { id: 'P4', arrivalTime: 3, burstTime: 1 },
      { id: 'P5', arrivalTime: 4, burstTime: 3 },
    ];
    setProcesses(exampleProcs);
    setError(null);
    setResult(algorithm === 'FCFS' ? simulateFCFS(exampleProcs) : simulateSJF(exampleProcs));
  };

  const handleAlgorithmChange = (algo: 'FCFS' | 'SJF') => {
    setAlgorithm(algo);
    if (result && processes.length > 0) {
      setResult(algo === 'FCFS' ? simulateFCFS(processes) : simulateSJF(processes));
    }
  };

  const simulateFCFS = useCallback((procs: Process[]): SimulationResult => {
    let currentTime = 0;
    const gantt: GanttBlock[] = [];
    const metrics: ProcessMetrics[] = [];
    const log: string[] = [];
    
    const remaining = [...procs];
    
    while (remaining.length > 0) {
      const available = remaining.filter(p => p.arrivalTime <= currentTime);
      
      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
        gantt.push({ processId: 'IDLE', start: currentTime, end: nextArrival, isIdle: true });
        currentTime = nextArrival;
        continue;
      }
      
      available.sort((a, b) => a.arrivalTime - b.arrivalTime);
      const selected = available[0];
      
      const readyQueueIds = available.map(p => p.id).join(', ');
      log.push(`At time ${currentTime}, the following processes were in the ready queue: [${readyQueueIds}]. Process ${selected.id} was selected because it arrived first.`);
      
      const start = currentTime;
      const end = start + selected.burstTime;
      gantt.push({ processId: selected.id, start, end, isIdle: false });
      
      const completionTime = end;
      const turnaroundTime = completionTime - selected.arrivalTime;
      const waitingTime = turnaroundTime - selected.burstTime;
      
      metrics.push({ ...selected, completionTime, turnaroundTime, waitingTime });
      currentTime = end;
      
      const index = remaining.findIndex(p => p.id === selected.id);
      remaining.splice(index, 1);
    }

    const avgWaitingTime = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / metrics.length || 0;
    const avgTurnaroundTime = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / metrics.length || 0;

    metrics.sort((a, b) => a.arrivalTime - b.arrivalTime);

    return { gantt, metrics, avgWaitingTime, avgTurnaroundTime, log };
  }, []);

  const simulateSJF = useCallback((procs: Process[]): SimulationResult => {
    let currentTime = 0;
    const gantt: GanttBlock[] = [];
    const metrics: ProcessMetrics[] = [];
    const log: string[] = [];
    
    const remaining = [...procs];
    
    while (remaining.length > 0) {
      const available = remaining.filter(p => p.arrivalTime <= currentTime);
      
      if (available.length === 0) {
        const nextArrival = Math.min(...remaining.map(p => p.arrivalTime));
        gantt.push({ processId: 'IDLE', start: currentTime, end: nextArrival, isIdle: true });
        currentTime = nextArrival;
        continue;
      }
      
      available.sort((a, b) => {
        if (a.burstTime === b.burstTime) {
          return a.arrivalTime - b.arrivalTime;
        }
        return a.burstTime - b.burstTime;
      });
      
      const selected = available[0];
      
      const readyQueueIds = available.map(p => p.id).join(', ');
      log.push(`At time ${currentTime}, the following processes were in the ready queue: [${readyQueueIds}]. Process ${selected.id} was selected because it had the shortest burst time (${selected.burstTime}).`);
      
      const start = currentTime;
      const end = start + selected.burstTime;
      gantt.push({ processId: selected.id, start, end, isIdle: false });
      
      const completionTime = end;
      const turnaroundTime = completionTime - selected.arrivalTime;
      const waitingTime = turnaroundTime - selected.burstTime;
      
      metrics.push({ ...selected, completionTime, turnaroundTime, waitingTime });
      currentTime = end;
      
      const index = remaining.findIndex(p => p.id === selected.id);
      remaining.splice(index, 1);
    }

    const avgWaitingTime = metrics.reduce((acc, m) => acc + m.waitingTime, 0) / metrics.length || 0;
    const avgTurnaroundTime = metrics.reduce((acc, m) => acc + m.turnaroundTime, 0) / metrics.length || 0;

    metrics.sort((a, b) => a.arrivalTime - b.arrivalTime);

    return { gantt, metrics, avgWaitingTime, avgTurnaroundTime, log };
  }, []);

  const handleSimulate = () => {
    if (processes.length === 0) return;
    
    if (algorithm === 'FCFS') {
      setResult(simulateFCFS(processes));
    } else {
      setResult(simulateSJF(processes));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/60 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Cpu className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">CPU Scheduling Simulator</h1>
              <p className="text-sm text-zinc-400 mt-1">Edwin George Shaji - Guido</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex bg-zinc-950/80 rounded-xl p-1.5 border border-zinc-800/80 shadow-inner relative">
              {['FCFS', 'SJF'].map((algo) => (
                <button 
                  key={algo}
                  onClick={() => handleAlgorithmChange(algo as 'FCFS' | 'SJF')}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${algorithm === algo ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'}`}
                >
                  {algorithm === algo && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-zinc-800 rounded-lg shadow-md border border-zinc-700/50"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{algo === 'SJF' ? 'SJF (Non-Preemptive)' : 'FCFS'}</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleSimulate}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 fill-current" />
              Simulate
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-4 space-y-8">
            {/* Add Process Form */}
            <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/60 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-cyan-500/50"></div>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-indigo-400" />
                Add Process
              </h2>
              
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Process ID</label>
                    <input type="text" value={newId} onChange={e => { setNewId(e.target.value); setError(null); }} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700" placeholder="e.g. P1" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Arrival</label>
                    <input type="text" value={newArrival} onChange={e => { setNewArrival(e.target.value); setError(null); }} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700" placeholder="e.g. 0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Burst</label>
                    <input type="text" value={newBurst} onChange={e => { setNewBurst(e.target.value); setError(null); }} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700" placeholder="e.g. 5" />
                  </div>
                </div>
                <button onClick={handleAddProcess} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 active:bg-zinc-600 text-white font-medium rounded-xl transition-all duration-200 border border-zinc-700/50 hover:border-zinc-600">
                  <Plus className="w-4 h-4" />
                  Add to Queue
                </button>
              </div>
            </div>

            {/* Process List */}
            <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/60 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 to-emerald-500/50"></div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                  <List className="w-5 h-5 text-cyan-400" />
                  Process Queue
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={handleLoadExample} className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20">
                    Load Example
                  </button>
                  <button onClick={handleReset} className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors" title="Reset to default">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-zinc-500 uppercase tracking-wider bg-zinc-950/50 border-b border-zinc-800/80">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-tl-lg">Process ID</th>
                      <th className="px-4 py-3 font-medium">Arrival</th>
                      <th className="px-4 py-3 font-medium">Burst</th>
                      <th className="px-4 py-3 text-right font-medium rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {processes.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-4 py-3.5 font-mono text-zinc-200 font-medium">{p.id}</td>
                        <td className="px-4 py-3.5 font-mono text-zinc-400">{p.arrivalTime}</td>
                        <td className="px-4 py-3.5 font-mono text-zinc-400">{p.burstTime}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button onClick={() => handleRemoveProcess(p.id)} className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-400/10 opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {processes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No processes in queue.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-8">
            {result ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Gantt Chart */}
                <div className="bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-zinc-800/60 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-indigo-500/50"></div>
                  <h2 className="text-xl font-semibold mb-8 flex items-center gap-2 text-white">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    Gantt Chart
                  </h2>
                  
                  <div className="relative w-full h-20 rounded-2xl overflow-hidden border border-zinc-700/50 flex shadow-inner bg-zinc-950/80">
                    {result.gantt.map((block, i) => {
                      const totalDuration = result.gantt[result.gantt.length - 1]?.end || 1;
                      const safeTotal = totalDuration === 0 ? 1 : totalDuration;
                      const widthPct = ((block.end - block.start) / safeTotal) * 100;
                      return (
                        <div 
                          key={i}
                          style={{ width: `${widthPct}%` }}
                          className={`flex flex-col items-center justify-center border-r border-zinc-900/50 last:border-r-0 transition-all duration-300 hover:brightness-125 group relative ${block.isIdle ? 'bg-zinc-800/20 text-zinc-500' : 'bg-indigo-500/20 text-indigo-300 border-b-4 border-b-indigo-500/50'}`}
                        >
                          {widthPct > 4 && <span className="font-mono font-bold text-base truncate px-1">{block.processId}</span>}
                          {/* Tooltip */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg border border-zinc-700">
                            {block.processId}: {block.start} - {block.end}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="relative w-full h-6 mt-3">
                    {result.gantt.map((block, i) => {
                      const totalDuration = result.gantt[result.gantt.length - 1]?.end || 1;
                      const safeTotal = totalDuration === 0 ? 1 : totalDuration;
                      const leftPct = (block.start / safeTotal) * 100;
                      return (
                        <div key={i} style={{ left: `${leftPct}%` }} className="absolute text-xs font-mono text-zinc-400 -translate-x-1/2">
                          {block.start}
                        </div>
                      );
                    })}
                    <div style={{ left: '100%' }} className="absolute text-xs font-mono text-zinc-400 -translate-x-1/2">
                      {result.gantt[result.gantt.length - 1]?.end}
                    </div>
                  </div>
                </div>

                {/* Metrics & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Stats */}
                  <div className="bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-zinc-800/60 shadow-lg flex flex-col justify-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 to-purple-500/50"></div>
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <Clock className="w-7 h-7 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider mb-1">Avg Waiting Time</p>
                        <p className="text-4xl font-mono font-bold text-white">{result.avgWaitingTime.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="h-px w-full bg-zinc-800/60"></div>
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <BarChart2 className="w-7 h-7 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider mb-1">Avg Turnaround Time</p>
                        <p className="text-4xl font-mono font-bold text-white">{result.avgTurnaroundTime.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-zinc-800/60 shadow-lg overflow-x-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50"></div>
                    <table className="w-full text-sm text-left">
                      <thead className="text-[11px] text-zinc-500 uppercase tracking-wider border-b border-zinc-800/80">
                        <tr>
                          <th className="pb-4 font-medium">Process</th>
                          <th className="pb-4 font-medium text-right">CT</th>
                          <th className="pb-4 font-medium text-right">TAT</th>
                          <th className="pb-4 font-medium text-right">WT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/30">
                        {result.metrics.map(m => (
                          <tr key={m.id} className="hover:bg-zinc-800/20 transition-colors">
                            <td className="py-3.5 font-mono text-zinc-200 font-medium">{m.id}</td>
                            <td className="py-3.5 font-mono text-zinc-400 text-right">{m.completionTime}</td>
                            <td className="py-3.5 font-mono text-zinc-400 text-right">{m.turnaroundTime}</td>
                            <td className="py-3.5 font-mono text-zinc-400 text-right">{m.waitingTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-6 pt-4 border-t border-zinc-800/50 text-[11px] text-zinc-500 flex flex-wrap gap-x-6 gap-y-2 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div> CT: Completion Time</span>
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div> TAT: Turnaround Time</span>
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div> WT: Waiting Time</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-zinc-900/20 rounded-3xl border border-zinc-800/40 border-dashed text-zinc-500">
                <div className="p-6 bg-zinc-900/50 rounded-full mb-6 border border-zinc-800/50 shadow-inner">
                  <Cpu className="w-16 h-16 opacity-30 text-zinc-400" />
                </div>
                <h3 className="text-xl font-medium text-zinc-300 mb-2">Ready to Simulate</h3>
                <p className="text-zinc-500 max-w-sm text-center">Add your processes to the queue and click Simulate to visualize the scheduling algorithm.</p>
              </div>
            )}
          </div>
        </div>

        {/* Decision Log */}
        {result && result.log.length > 0 && (
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800/60 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50"></div>
            <button 
              onClick={() => setIsLogExpanded(!isLogExpanded)}
              className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-800/20 transition-colors focus:outline-none"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <Info className="w-6 h-6 text-indigo-400" />
                Decision Log
              </h2>
              <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isLogExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isLogExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 md:p-8 pt-0 space-y-0 relative pl-2 border-t border-zinc-800/30 mt-2">
                    <div className="absolute left-[13px] top-4 bottom-4 w-px bg-zinc-800/80"></div>
                    {result.log.map((entry, i) => (
                      <div key={i} className="flex gap-6 text-sm relative z-10">
                        <div className="flex flex-col items-center mt-1">
                          <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-zinc-900 border border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        </div>
                        <p className="text-zinc-300 leading-relaxed pb-8 pt-0.5">
                          {entry.split(/(\[.*?\]|Process \w+)/).map((part, j) => {
                            if (part.startsWith('[')) return <span key={j} className="font-mono text-cyan-400">{part}</span>;
                            if (part.startsWith('Process')) return <span key={j} className="font-mono text-emerald-400 font-medium">{part}</span>;
                            return part;
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
