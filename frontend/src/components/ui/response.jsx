import ReactMarkdown from 'reaction-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '../../lib/utils';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

export function Response({ children, className }) {
    return (
        <div className={cn("markdown-body prose prose-sm max-w-none dark:prose-invert", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                components={{
                    // Code block
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline ? (
                            <div className="relative group">
                                <pre className="!bg-slate-900 !p-4 rounded-lg overflow-x-auto">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(String(children).trim());
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded"
                                >
                                    Copy
                                </button>
                            </div>
                        ) : (
                            <code className="!bg-slate-100 dark:!bg-slate-800 !px-1.5 !py-0.5 rounded text-sm" {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Tables
                    table({ children }) {
                        return (
                            <div className="overflow-x-auto my-4">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    {children}
                                </table>
                            </div>
                        );
                    },
                    thead({ children }) {
                        return <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>;
                    },
                    th({ children }) {
                        return (
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                {children}
                            </th>
                        );
                    },
                    td({ children }) {
                        return (
                            <td className="px-4 py-2 text-sm text-slate-900 dark:text-slate-100">
                                {children}
                            </td>
                        );
                    },
                    // Blockquotes
                    blockquote({ children }) {
                        return (
                            <blockquote className="border-l-4 border-cyan-500 pl-4 my-4 italic text-slate-600 dark:text-slate-400">
                                {children}
                            </blockquote>
                        );
                    },
                    // Links
                    a({ href, children }) {
                        return (
                            <a
                                href={href}
                                className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {children}
                            </a>
                        );
                    },
                    // Lists
                    ul({ children }) {
                        return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                        return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>;
                    },
                    // Headings
                    h1({ children }) {
                        return <h1 className="text-2xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100">{children}</h1>;
                    },
                    h2({ children }) {
                        return <h2 className="text-xl font-bold mt-5 mb-2 text-slate-900 dark:text-slate-100">{children}</h2>;
                    },
                    h3({ children }) {
                        return <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-900 dark:text-slate-100">{children}</h3>;
                    },
                    // Paragraphs
                    p({ children }) {
                        return <p className="my-2 leading-relaxed text-slate-800 dark:text-slate-200">{children}</p>;
                    },
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
