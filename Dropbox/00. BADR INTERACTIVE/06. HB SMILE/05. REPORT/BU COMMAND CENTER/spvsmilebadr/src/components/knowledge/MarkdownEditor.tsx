import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Table,
  CheckSquare,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => insertText('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertText('*', '*', 'italic text') },
    { icon: Strikethrough, label: 'Strikethrough', action: () => insertText('~~', '~~', 'strikethrough') },
    { divider: true },
    { icon: Heading1, label: 'Heading 1', action: () => insertText('# ', '', 'Heading 1') },
    { icon: Heading2, label: 'Heading 2', action: () => insertText('## ', '', 'Heading 2') },
    { icon: Heading3, label: 'Heading 3', action: () => insertText('### ', '', 'Heading 3') },
    { divider: true },
    { icon: Link, label: 'Link', action: () => insertText('[', '](url)', 'link text') },
    { icon: Image, label: 'Image', action: () => insertText('![', '](image-url)', 'alt text') },
    { icon: Code, label: 'Code', action: () => insertText('`', '`', 'code') },
    { divider: true },
    { icon: List, label: 'Bullet List', action: () => insertText('- ', '', 'list item') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertText('1. ', '', 'list item') },
    { icon: CheckSquare, label: 'Task List', action: () => insertText('- [ ] ', '', 'task item') },
    { divider: true },
    { icon: Quote, label: 'Quote', action: () => insertText('> ', '', 'quote') },
    { icon: Minus, label: 'Horizontal Rule', action: () => insertText('\n---\n', '', '') },
    { icon: Table, label: 'Table', action: () => insertText('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', '', '') },
  ];

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 border-b bg-muted/50 flex-wrap">
        {toolbarButtons.map((btn, idx) =>
          btn.divider ? (
            <div key={idx} className="w-px h-6 bg-border mx-1" />
          ) : (
            <Button
              key={idx}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={btn.action}
              title={btn.label}
            >
              {btn.icon && <btn.icon className="h-4 w-4" />}
            </Button>
          )
        )}
      </div>

      {/* Editor with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between px-2 py-1 border-b bg-muted/30">
          <TabsList className="h-8">
            <TabsTrigger value="edit" className="text-xs px-3 h-6">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs px-3 h-6">
              Preview
            </TabsTrigger>
            <TabsTrigger value="split" className="text-xs px-3 h-6">
              Split View
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="m-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div className="min-h-[400px] p-4 prose prose-sm max-w-none dark:prose-invert overflow-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value || '*No content yet...*'}
            </ReactMarkdown>
          </div>
        </TabsContent>

        <TabsContent value="split" className="m-0">
          <div className="grid grid-cols-2 divide-x min-h-[400px]">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm min-h-[400px]"
            />
            <div className="p-4 prose prose-sm max-w-none dark:prose-invert overflow-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value || '*No content yet...*'}
              </ReactMarkdown>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
