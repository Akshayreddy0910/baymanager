import React from 'react';

const Input = ({ label, icon: Icon, error, className = '', ...props }) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`
                        w-full bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-4 
                        text-slate-200 font-bold placeholder:text-slate-700
                        focus:outline-none focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10 
                        transition-all hover:border-slate-700
                        ${Icon ? 'pl-14' : ''}
                        ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/10' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-tight ml-2">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
