"use client";

import { Sliders, Settings, X } from "lucide-react";
import { useState } from "react";

export interface ReaderConfig {
  fontSize: number; // 14 to 24
  fontFamily: "serif" | "sans";
  lineHeight: "compact" | "normal" | "relaxed";
  contentWidth: "narrow" | "medium" | "wide";
  theme: "cream" | "sepia" | "dark";
}

interface ReaderSettingsProps {
  config: ReaderConfig;
  onChange: (config: ReaderConfig) => void;
}

export default function ReaderSettings({ config, onChange }: ReaderSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateConfig = (key: keyof ReaderConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 py-2 px-3 bg-transparent border border-indigo-500 text-purple-655 dark:text-purple-400 hover:bg-slate-200/50 rounded-none text-xs font-bold transition shadow-sm uppercase tracking-widest"
        type="button"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Settings</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay to close popover */}
          <div className="fixed inset-0 z-45 bg-black/15 backdrop-blur-sm" onClick={handleToggle}></div>

          {/* Drawer Menu */}
          <aside className="fixed right-0 top-0 h-full w-full max-w-[360px] bg-slate-50 dark:bg-slate-900 border-l border-indigo-500 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-indigo-500/20">
                <h4 className="font-serif text-base font-extrabold text-purple-655 dark:text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Appearance</span>
                </h4>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={handleToggle}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Font Family */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-indigo-650 dark:text-indigo-400">
                    Font Family
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => updateConfig("fontFamily", "serif")}
                      className={`py-3 px-3 border rounded-none font-serif text-center transition-all ${
                        config.fontFamily === "serif"
                          ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                          : "border-indigo-500/15 text-slate-655 dark:text-slate-350 hover:border-indigo-500/40 hover:bg-slate-200/20"
                      }`}
                    >
                      Source Serif
                    </button>
                    <button
                      type="button"
                      onClick={() => updateConfig("fontFamily", "sans")}
                      className={`py-3 px-3 border rounded-none font-sans text-center transition-all ${
                        config.fontFamily === "sans"
                          ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                          : "border-indigo-500/15 text-slate-700 dark:text-slate-350 hover:border-indigo-500/40 hover:bg-slate-200/20"
                      }`}
                    >
                      Source Sans
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-indigo-655 dark:text-indigo-400">
                    <span>Font Size</span>
                    <span className="text-indigo-500 font-serif font-bold">{config.fontSize}px</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([16, 20, 24] as const).map((sz) => {
                      const label = sz === 16 ? "Small" : sz === 20 ? "Medium" : "Large";
                      const isActive = config.fontSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => updateConfig("fontSize", sz)}
                          className={`py-2.5 px-1 text-xs text-center border rounded-none transition-all ${
                            isActive
                              ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                              : "border-indigo-500/15 text-slate-655 dark:text-slate-350 hover:border-indigo-500/40 hover:bg-slate-200/20"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Themes */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-indigo-650 dark:text-indigo-400">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["cream", "sepia", "dark"] as const).map((t) => {
                      const themeColors = {
                        cream: "bg-[#fdfbf7] border-[#1a1a1a]/15 text-[#1a1a1a]",
                        sepia: "bg-[#f4ecd8] border-[#433422]/15 text-[#433422]",
                        dark: "bg-[#0b0f19] border-[#e9dcd3]/15 text-[#e9dcd3]",
                      }[t];
                      const themeLabel = t.toUpperCase();
                      const isActive = config.theme === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => updateConfig("theme", t)}
                          className={`flex flex-col items-center justify-center py-3.5 px-2 border rounded-none transition-all shadow-sm ${themeColors} ${
                            isActive
                              ? "border-indigo-500 ring-1 ring-indigo-500 font-bold scale-[1.03]"
                              : "hover:scale-[1.01] hover:border-indigo-500/50"
                          }`}
                        >
                          <span className="text-lg font-serif mb-1">Aa</span>
                          <span className="text-[10px] font-bold tracking-widest uppercase">{themeLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Line Height */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-indigo-655 dark:text-indigo-400">
                    Line Spacing
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(["compact", "normal", "relaxed"] as const).map((lh) => (
                      <button
                        key={lh}
                        type="button"
                        onClick={() => updateConfig("lineHeight", lh)}
                        className={`py-2 px-1 border rounded-none capitalize text-center transition-all ${
                          config.lineHeight === lh
                            ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                            : "border-indigo-500/15 text-slate-655 dark:text-slate-350 hover:border-indigo-500/40 hover:bg-slate-200/20"
                        }`}
                      >
                        {lh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-indigo-500/20">
              <button
                type="button"
                onClick={handleToggle}
                className="w-full py-3 bg-purple-655 hover:bg-purple-550 border border-indigo-500 text-white font-bold rounded-none text-xs uppercase tracking-widest transition"
              >
                Save Settings
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
