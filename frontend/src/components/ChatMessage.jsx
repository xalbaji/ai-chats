import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export const ChatMessage = ({ content, timestamp }) => {
    return (
        <div className="flex gap-3 my-4">
            {/* Bot Icon */}
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                ✨
            </div>

            <div className="flex-1 overflow-hidden">
                {/* Header info */}
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-200">AI Assistant</span>
                    {timestamp && <span className="text-xs text-slate-500">{timestamp}</span>}
                </div>

                {/* Content Bubble */}
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-sm p-4 text-slate-200 leading-relaxed max-w-full overflow-x-auto">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            // Headings
                            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-indigo-300" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2 text-indigo-300" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-3 mb-1 text-slate-100" {...props} />,

                            // Lists
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1 pl-2 text-slate-300" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2 space-y-1 pl-2 text-slate-300" {...props} />,
                            li: ({ node, ...props }) => <li className="ml-2" {...props} />,

                            // Emphasis & Lines
                            strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                            hr: () => <hr className="my-4 border-slate-700" />,

                            // Tables
                            table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-3">
                                    <table className="w-full text-left border-collapse border border-slate-700 rounded-lg" {...props} />
                                </div>
                            ),
                            th: ({ node, ...props }) => <th className="bg-slate-900/60 p-2 border border-slate-700 font-semibold" {...props} />,
                            td: ({ node, ...props }) => <td className="p-2 border border-slate-700 text-sm" {...props} />,

                            // Inline Code Blocks
                            code: ({ node, inline, ...props }) =>
                                inline ? (
                                    <code className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                                ) : (
                                    <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto border border-slate-800 text-sm font-mono my-2 text-emerald-400" {...props} />
                                )
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};