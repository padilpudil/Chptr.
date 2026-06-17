"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Minus,
  Undo,
  Redo,
} from "lucide-react";

interface ChapterEditorProps {
  value: string;
  onChange: (htmlContent: string) => void;
}

export default function ChapterEditor({ value, onChange }: ChapterEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate dark:prose-invert max-w-none focus:outline-none p-4 min-h-[300px]",
      },
    },
  });

  // Sync value from outside if changed
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full min-h-[350px] bg-slate-100/50 dark:bg-slate-900/40 border border-indigo-500/20 dark:border-slate-800 rounded-none animate-pulse" />
    );
  }

  const MenuBarButton = ({
    onClick,
    isActive,
    disabled,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-none border transition disabled:opacity-40 disabled:cursor-not-allowed ${
        isActive
          ? "bg-purple-650/15 border-purple-550/45 text-purple-655 dark:text-purple-400"
          : "bg-white dark:bg-slate-950/40 border-indigo-500/20 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full bg-white dark:bg-slate-900/20 border border-indigo-500/30 dark:border-slate-800 rounded-none overflow-hidden focus-within:border-indigo-500 transition-colors">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-indigo-500/20 dark:border-slate-800">
        <MenuBarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </MenuBarButton>
        <MenuBarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </MenuBarButton>
        <MenuBarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </MenuBarButton>

        <div className="w-px h-6 bg-indigo-500/20 dark:bg-slate-800 mx-1"></div>

        <MenuBarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuBarButton>
        <MenuBarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </MenuBarButton>

        <div className="w-px h-6 bg-indigo-500/20 dark:bg-slate-800 mx-1"></div>

        <MenuBarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </MenuBarButton>
        <MenuBarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </MenuBarButton>
        <MenuBarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuBarButton>
        <MenuBarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </MenuBarButton>

        <div className="w-px h-6 bg-indigo-500/20 dark:bg-slate-800 mx-1 flex-grow md:flex-grow-0"></div>

        <div className="flex gap-1 md:ml-auto">
          <MenuBarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuBarButton>
          <MenuBarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </MenuBarButton>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="bg-transparent dark:bg-slate-950/10 max-h-[500px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
